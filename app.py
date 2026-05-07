import os
import io
import csv
import json
import sqlite3
import re
import tempfile
import glob
from datetime import datetime
import numpy as np
from scipy.fft import dct
from flask import Flask, request, jsonify, render_template, Response
from dotenv import load_dotenv
from google import genai

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

__version__      = "0.0.5"

DB_PATH          = os.path.join(os.path.dirname(__file__), "data", "schedule.db")
LOGS_DIR         = os.path.join(os.path.dirname(__file__), "logs")
WAKE_SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "data", "wake_samples")
ENV_PATH         = os.path.join(os.path.dirname(__file__), ".env")


# ── MFCC / DTW wake word matching ────────────────────────────────────────────

def audio_to_numpy(audio_bytes: bytes, mime_type: str, target_sr: int = 16000) -> np.ndarray:
    """Decode audio bytes → float32 mono numpy array via av."""
    import av
    suffix = ".webm" if "webm" in mime_type else ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(audio_bytes)
        tmp = f.name
    try:
        container = av.open(tmp)
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="fltp", layout="mono", rate=target_sr)
        chunks = []
        for frame in container.decode(stream):
            for rf in resampler.resample(frame):
                chunks.append(rf.to_ndarray()[0])
        container.close()
        return np.concatenate(chunks).astype(np.float32) if chunks else np.zeros(target_sr, dtype=np.float32)
    finally:
        os.unlink(tmp)


def compute_mfcc(y: np.ndarray, sr: int = 16000,
                 n_mfcc: int = 20, n_fft: int = 512,
                 hop_length: int = 160, n_mels: int = 40) -> np.ndarray:
    """Return MFCC matrix of shape (n_mfcc, T)."""
    # Pre-emphasis
    y = np.append(y[0], y[1:] - 0.97 * y[:-1])

    # Framing
    num_frames = max(1, 1 + (len(y) - n_fft) // hop_length)
    idx = (np.arange(n_fft)[None, :] +
           np.arange(num_frames)[:, None] * hop_length)
    idx = np.clip(idx, 0, len(y) - 1)
    frames = y[idx] * np.hamming(n_fft)           # (T, n_fft)

    # Power spectrum
    power = (1.0 / n_fft) * np.abs(np.fft.rfft(frames, n=n_fft)) ** 2  # (T, n_fft//2+1)

    # Mel filterbank
    low_mel  = 2595 * np.log10(1 + 80 / 700)
    high_mel = 2595 * np.log10(1 + (sr / 2) / 700)
    mel_pts  = np.linspace(low_mel, high_mel, n_mels + 2)
    hz_pts   = 700 * (10 ** (mel_pts / 2595) - 1)
    bins     = np.floor((n_fft + 1) * hz_pts / sr).astype(int)

    fbank = np.zeros((n_mels, n_fft // 2 + 1))
    for m in range(1, n_mels + 1):
        lo, mid, hi = bins[m - 1], bins[m], bins[m + 1]
        if mid > lo:
            fbank[m - 1, lo:mid] = (np.arange(lo, mid) - lo) / (mid - lo)
        if hi > mid:
            fbank[m - 1, mid:hi] = (hi - np.arange(mid, hi)) / (hi - mid)

    fb = np.dot(power, fbank.T)                          # (T, n_mels)
    fb = np.where(fb == 0, 1e-10, fb)
    log_fb = 20 * np.log10(fb)

    mfcc = dct(log_fb, type=2, axis=1, norm="ortho")[:, :n_mfcc]  # (T, n_mfcc)
    return mfcc.T                                        # (n_mfcc, T)


def dtw_distance(s1: np.ndarray, s2: np.ndarray) -> float:
    """Normalized DTW distance between two MFCC matrices."""
    n, m = s1.shape[1], s2.shape[1]
    D = np.full((n + 1, m + 1), np.inf)
    D[0, 0] = 0.0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = float(np.linalg.norm(s1[:, i - 1] - s2[:, j - 1]))
            D[i, j] = cost + min(D[i - 1, j], D[i, j - 1], D[i - 1, j - 1])
    return float(D[n, m]) / (n + m)


def load_wake_profiles() -> list:
    """Load all saved MFCC sample files."""
    paths = sorted(glob.glob(os.path.join(WAKE_SAMPLES_DIR, "sample_*.npy")))
    return [np.load(p) for p in paths]


def compute_threshold(profiles: list) -> float:
    """Auto-compute detection threshold from pairwise sample distances."""
    if len(profiles) < 2:
        return 4.0   # conservative default
    dists = [dtw_distance(profiles[i], profiles[j])
             for i in range(len(profiles))
             for j in range(i + 1, len(profiles))]
    return float(np.median(dists)) * 2.2

# Load Whisper model once at startup (downloads ~150 MB on first run)
_whisper_model = None
def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
    return _whisper_model


def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _column_exists(conn, table: str, column: str) -> bool:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(r["name"] == column for r in rows)


def init_db():
    conn = get_db()
    # Main work_items table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS work_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            content TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # Migrate: add new columns if they don't exist
    migrations = [
        ("duration_min",    "INTEGER DEFAULT 60"),
        ("start_time",      "TEXT"),
        ("status",          "TEXT DEFAULT 'pending'"),
        ("parallel_group",  "INTEGER"),
        ("parallel_reason", "TEXT"),
        ("description",     "TEXT DEFAULT ''"),
    ]
    for col, col_def in migrations:
        if not _column_exists(conn, "work_items", col):
            conn.execute(f"ALTER TABLE work_items ADD COLUMN {col} {col_def}")

    # Task pool table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS task_pool (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            duration_min INTEGER NOT NULL DEFAULT 60,
            notes TEXT,
            suspended_from TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()


def call_llm(prompt: str) -> str:
    """Call the active LLM provider and return the response text."""
    provider = _env_read_key("LLM_PROVIDER") or "gemini"
    if provider == "deepseek":
        api_key = _env_read_key("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY 未配置，请在设置中填入 DeepSeek API Key")
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    else:
        api_key = _env_read_key("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY 未配置，请在设置中填入 Gemini API Key")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text


def write_log(date: str, transcript: str, items: list):
    os.makedirs(LOGS_DIR, exist_ok=True)
    log_path = os.path.join(LOGS_DIR, f"{date}.md")
    ts = datetime.now().strftime("%H:%M")
    lines = [f"\n## [{ts}] 语音记录\n", f"**转录：** {transcript}\n"]
    if items:
        lines.append("\n**提取事项：**\n")
        for i, item in enumerate(items, 1):
            content = item["content"] if isinstance(item, dict) else item
            lines.append(f"{i}. {content}\n")
    with open(log_path, "a", encoding="utf-8") as f:
        if os.path.getsize(log_path) == 0:
            f.write(f"# {date} 工作日志\n")
        f.writelines(lines)


def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str:
    """Transcribe audio locally using faster-whisper."""
    suffix = ".webm" if "webm" in mime_type else ".ogg" if "ogg" in mime_type else ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        model = get_whisper()
        segments, _ = model.transcribe(tmp_path, language="zh", task="transcribe")
        text = "".join(seg.text for seg in segments).strip()
        # Strip end words
        text = re.sub(r"[，。,.]?完毕\s*$", "", text).strip()
        return text
    finally:
        os.unlink(tmp_path)


def extract_json(text: str):
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1:
        return json.loads(text[start:end + 1])
    return json.loads(text)


def time_to_minutes(t: str) -> int:
    """Convert 'HH:MM' to minutes since midnight."""
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def minutes_to_time(mins: int) -> str:
    """Convert minutes since midnight to 'HH:MM'."""
    h = (mins // 60) % 24
    m = mins % 60
    return f"{h:02d}:{m:02d}"


# ── REST API ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/items", methods=["GET"])
def get_items():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date parameter required"}), 400
    conn = get_db()
    rows = conn.execute(
        """SELECT id, date, content, description, position, created_at,
                  duration_min, start_time, status, parallel_group, parallel_reason
           FROM work_items WHERE date=? ORDER BY start_time ASC NULLS LAST, position ASC, id ASC""",
        (date,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/items/dates", methods=["GET"])
def get_dates_with_items():
    conn = get_db()
    rows = conn.execute("SELECT DISTINCT date FROM work_items ORDER BY date").fetchall()
    conn.close()
    return jsonify([r["date"] for r in rows])


@app.route("/api/items", methods=["POST"])
def add_items():
    data = request.get_json()
    date = data.get("date")
    items = data.get("items", [])
    if not date or not items:
        return jsonify({"error": "date and items required"}), 400

    conn = get_db()
    row = conn.execute(
        "SELECT COALESCE(MAX(position), -1) as max_pos FROM work_items WHERE date=?", (date,)
    ).fetchone()
    next_pos = row["max_pos"] + 1

    inserted = []
    for item in items:
        if isinstance(item, dict):
            content      = item.get("content", "").strip()
            description  = item.get("description", "").strip()
            duration_min = int(item.get("duration_min", 60) or 60)
            start_time   = item.get("start_time") or None
            if start_time and not re.match(r"^\d{2}:\d{2}$", start_time):
                start_time = None
        else:
            content = str(item).strip()
            description = ""
            duration_min = 60
            start_time = None
        if not content:
            continue
        cur = conn.execute(
            """INSERT INTO work_items (date, content, description, position, duration_min, start_time)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (date, content, description, next_pos, duration_min, start_time)
        )
        inserted.append({
            "id": cur.lastrowid, "date": date, "content": content,
            "description": description, "position": next_pos,
            "duration_min": duration_min, "start_time": start_time,
            "status": "pending", "parallel_group": None, "parallel_reason": None
        })
        next_pos += 1
    conn.commit()
    conn.close()
    return jsonify(inserted), 201


@app.route("/api/items/reorder", methods=["PUT"])
def reorder_items():
    data = request.get_json()
    date = data.get("date")
    items = data.get("items", [])
    if not date or not items:
        return jsonify({"error": "date and items required"}), 400

    conn = get_db()
    for pos, item in enumerate(items):
        item_id = item.get("id") if isinstance(item, dict) else item
        conn.execute(
            "UPDATE work_items SET position=? WHERE id=? AND date=?",
            (pos, item_id, date)
        )
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    conn = get_db()
    conn.execute("DELETE FROM work_items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.get_json()
    conn = get_db()
    item = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({"error": "item not found"}), 404

    fields = {}
    for key in ("content", "description", "duration_min", "start_time", "status", "parallel_group", "parallel_reason"):
        if key in data:
            fields[key] = data[key]

    if fields:
        set_clause = ", ".join(f"{k}=?" for k in fields)
        conn.execute(
            f"UPDATE work_items SET {set_clause} WHERE id=?",
            list(fields.values()) + [item_id]
        )
        conn.commit()

    updated = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


@app.route("/api/items/<int:item_id>/complete", methods=["POST"])
def complete_item(item_id):
    conn = get_db()
    item = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({"error": "item not found"}), 404

    new_duration = item["duration_min"] or 60
    if item["start_time"] and item["status"] == "pending":
        now = datetime.now()
        now_mins = now.hour * 60 + now.minute
        start_mins = time_to_minutes(item["start_time"])
        elapsed = now_mins - start_mins
        if 1 <= elapsed < new_duration:
            new_duration = elapsed

    conn.execute(
        "UPDATE work_items SET status='completed', duration_min=? WHERE id=?",
        (new_duration, item_id)
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


@app.route("/api/items/<int:item_id>/suspend", methods=["POST"])
def suspend_item(item_id):
    conn = get_db()
    item = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({"error": "item not found"}), 404

    item = dict(item)
    # Move to task pool
    conn.execute(
        "INSERT INTO task_pool (content, duration_min, suspended_from) VALUES (?, ?, ?)",
        (item["content"], item["duration_min"] or 60, item["date"])
    )

    # Push subsequent items back if this item has a start_time
    if item.get("start_time"):
        duration = item["duration_min"] or 60
        # All items on same date with start_time > this item's start_time
        later = conn.execute(
            """SELECT id, start_time FROM work_items
               WHERE date=? AND start_time > ? AND id != ? AND start_time IS NOT NULL""",
            (item["date"], item["start_time"], item_id)
        ).fetchall()
        for row in later:
            mins = time_to_minutes(row["start_time"]) - duration
            conn.execute(
                "UPDATE work_items SET start_time=? WHERE id=?",
                (minutes_to_time(mins), row["id"])
            )

    conn.execute("DELETE FROM work_items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok", "moved_to_pool": True})


@app.route("/api/items/<int:item_id>/extend", methods=["POST"])
def extend_item(item_id):
    data = request.get_json()
    extra_min = int(data.get("extra_min", 30))
    conn = get_db()
    item = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({"error": "item not found"}), 404

    item = dict(item)
    new_duration = (item["duration_min"] or 60) + extra_min
    conn.execute("UPDATE work_items SET duration_min=? WHERE id=?", (new_duration, item_id))

    # Only push tasks that now overlap due to the extension.
    # A task overlaps only if its start_time falls within [old_end, new_end).
    if item.get("start_time"):
        old_end_mins = time_to_minutes(item["start_time"]) + (item["duration_min"] or 60)
        new_end_mins = old_end_mins + extra_min
        later = conn.execute(
            """SELECT id, start_time FROM work_items
               WHERE date=? AND start_time >= ? AND start_time < ? AND id != ?
                 AND start_time IS NOT NULL""",
            (item["date"], minutes_to_time(old_end_mins), minutes_to_time(new_end_mins), item_id)
        ).fetchall()
        for row in later:
            conn.execute(
                "UPDATE work_items SET start_time=? WHERE id=?",
                (minutes_to_time(new_end_mins), row["id"])
            )

    conn.commit()
    updated = conn.execute("SELECT * FROM work_items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


# ── Task pool endpoints ───────────────────────────────────────────────────────

@app.route("/api/pool", methods=["GET"])
def get_pool():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM task_pool ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/pool/<int:pool_id>", methods=["DELETE"])
def delete_pool_item(pool_id):
    conn = get_db()
    conn.execute("DELETE FROM task_pool WHERE id=?", (pool_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/pool/<int:pool_id>/schedule", methods=["POST"])
def schedule_pool_item(pool_id):
    data = request.get_json()
    date = data.get("date")
    start_time = data.get("start_time")
    if not date:
        return jsonify({"error": "date required"}), 400

    conn = get_db()
    pool_item = conn.execute("SELECT * FROM task_pool WHERE id=?", (pool_id,)).fetchone()
    if not pool_item:
        conn.close()
        return jsonify({"error": "pool item not found"}), 404

    pool_item = dict(pool_item)
    row = conn.execute(
        "SELECT COALESCE(MAX(position), -1) as max_pos FROM work_items WHERE date=?", (date,)
    ).fetchone()
    next_pos = row["max_pos"] + 1

    cur = conn.execute(
        """INSERT INTO work_items (date, content, position, duration_min, start_time, status)
           VALUES (?, ?, ?, ?, ?, 'pending')""",
        (date, pool_item["content"], next_pos, pool_item["duration_min"], start_time)
    )
    new_id = cur.lastrowid
    conn.execute("DELETE FROM task_pool WHERE id=?", (pool_id,))
    conn.commit()

    inserted = conn.execute("SELECT * FROM work_items WHERE id=?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(inserted)), 201


# ── Schedule generation / apply ───────────────────────────────────────────────

@app.route("/api/schedule/generate", methods=["POST"])
def schedule_generate():
    data = request.get_json()
    date = data.get("date")
    work_start = data.get("work_start", "09:00")
    work_end = data.get("work_end", "18:00")
    if not date:
        return jsonify({"error": "date required"}), 400

    conn = get_db()
    items = conn.execute(
        "SELECT id, content, duration_min, start_time FROM work_items WHERE date=? ORDER BY position ASC, id ASC",
        (date,)
    ).fetchall()
    pool_items = conn.execute("SELECT id, content, duration_min FROM task_pool ORDER BY created_at").fetchall()
    conn.close()

    task_list = []
    for row in items:
        r = dict(row)
        task_list.append({
            "id": r["id"],
            "content": r["content"],
            "duration_min": r["duration_min"] or 60,
            "current_start": r["start_time"]
        })
    # Don't include pool items automatically — they remain in pool unless scheduled

    if not task_list:
        return jsonify({"error": "当天没有工作事项"}), 400

    tasks_json = json.dumps(task_list, ensure_ascii=False, indent=2)

    prompt = f"""你是一个专业日程规划师。给定以下工作任务列表，为 {date} 创建从 {work_start} 到 {work_end} 的日程安排。

规则：
1. 在 12:00 安排 1 小时午休（content="午休", id=null, duration_min=60）
2. 识别哪些任务必须顺序执行，哪些可以并行（用 parallel_group 整数标记同组并行任务，sequential 任务 parallel_group=null）
3. 并行任务必须有明确理由（parallel_reason）
4. 尽量在工作时间内安排所有任务
5. start_time 格式为 "HH:MM"

输入任务：
{tasks_json}

只返回 JSON 数组，每个元素：
{{
  "id": <原始id或null>,
  "content": "<任务内容>",
  "start_time": "HH:MM",
  "duration_min": <分钟数>,
  "parallel_group": <整数或null>,
  "parallel_reason": "<并行原因或null>"
}}

不要添加任何解释，直接返回 JSON 数组。"""

    try:
        text = call_llm(prompt)
        schedule = extract_json(text)
        if not isinstance(schedule, list):
            raise ValueError("Expected a JSON array")
        return jsonify({"schedule": schedule})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"AI 处理失败：{str(e)}"}), 500


@app.route("/api/schedule/apply", methods=["POST"])
def schedule_apply():
    data = request.get_json()
    date = data.get("date")
    schedule = data.get("schedule", [])
    if not date or not schedule:
        return jsonify({"error": "date and schedule required"}), 400

    conn = get_db()
    row = conn.execute(
        "SELECT COALESCE(MAX(position), -1) as max_pos FROM work_items WHERE date=?", (date,)
    ).fetchone()
    next_pos = row["max_pos"] + 1

    for entry in schedule:
        item_id = entry.get("id")
        start_time = entry.get("start_time")
        duration_min = entry.get("duration_min", 60)
        parallel_group = entry.get("parallel_group")
        parallel_reason = entry.get("parallel_reason")
        content = entry.get("content", "")

        if item_id:
            # Update existing item
            conn.execute(
                """UPDATE work_items
                   SET start_time=?, duration_min=?, parallel_group=?, parallel_reason=?
                   WHERE id=?""",
                (start_time, duration_min, parallel_group, parallel_reason, item_id)
            )
        else:
            # Insert new item (e.g., lunch break)
            conn.execute(
                """INSERT INTO work_items (date, content, position, duration_min, start_time, parallel_group, parallel_reason)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (date, content, next_pos, duration_min, start_time, parallel_group, parallel_reason)
            )
            next_pos += 1

    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


# ── Voice endpoints ───────────────────────────────────────────────────────────

@app.route("/api/voice/transcribe", methods=["POST"])
def voice_transcribe():
    """Transcribe audio locally with Whisper. Returns {transcript: str}."""
    if "audio" not in request.files:
        return jsonify({"error": "audio file required"}), 400
    audio_bytes = request.files["audio"].read()
    mime_type = request.form.get("mime_type", "audio/webm")
    try:
        transcript = transcribe_audio(audio_bytes, mime_type)
        return jsonify({"transcript": transcript})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"转录失败：{str(e)}"}), 500


@app.route("/api/wake/samples", methods=["GET"])
def get_wake_samples():
    paths = sorted(glob.glob(os.path.join(WAKE_SAMPLES_DIR, "sample_*.npy")))
    profiles = [np.load(p) for p in paths]
    threshold = compute_threshold(profiles) if profiles else None
    return jsonify({"count": len(profiles), "threshold": threshold})


@app.route("/api/wake/samples", methods=["POST"])
def add_wake_sample():
    """Record one wake word sample, extract MFCC, save."""
    if "audio" not in request.files:
        return jsonify({"error": "audio file required"}), 400
    audio_bytes = request.files["audio"].read()
    mime_type = request.form.get("mime_type", "audio/webm")
    try:
        y = audio_to_numpy(audio_bytes, mime_type)
        mfcc = compute_mfcc(y)
        os.makedirs(WAKE_SAMPLES_DIR, exist_ok=True)
        existing = sorted(glob.glob(os.path.join(WAKE_SAMPLES_DIR, "sample_*.npy")))
        idx = len(existing)
        np.save(os.path.join(WAKE_SAMPLES_DIR, f"sample_{idx:02d}.npy"), mfcc)
        return jsonify({"count": idx + 1})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/wake/samples", methods=["DELETE"])
def clear_wake_samples():
    for p in glob.glob(os.path.join(WAKE_SAMPLES_DIR, "sample_*.npy")):
        os.unlink(p)
    return jsonify({"count": 0})


@app.route("/api/voice/wake", methods=["POST"])
def voice_wake():
    """Detect wake word: MFCC-DTW if samples exist, Whisper fallback otherwise."""
    if "audio" not in request.files:
        return jsonify({"error": "audio file required"}), 400
    audio_bytes = request.files["audio"].read()
    mime_type = request.form.get("mime_type", "audio/webm")
    wake_word = request.form.get("wake_word", "志翔")
    try:
        profiles = load_wake_profiles()
        y = audio_to_numpy(audio_bytes, mime_type)
        if len(profiles) >= 3:
            mfcc = compute_mfcc(y)
            threshold = compute_threshold(profiles)
            dists = [dtw_distance(mfcc, p) for p in profiles]
            best = min(dists)
            detected = best < threshold
            return jsonify({"detected": detected, "distance": round(best, 3), "threshold": round(threshold, 3)})
        else:
            # Fallback: Whisper text match
            transcript = transcribe_audio(audio_bytes, mime_type)
            detected = wake_word in transcript
            return jsonify({"detected": detected, "transcript": transcript, "fallback": True})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"detected": False, "error": str(e)}), 500


@app.route("/api/voice/process", methods=["POST"])
def voice_process():
    """Extract work items (with duration) from text transcript using Gemini."""
    data = request.get_json()
    transcript  = data.get("transcript", "").strip()
    client_date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    if not transcript:
        return jsonify({"error": "transcript required"}), 400

    now        = datetime.now()
    today_str  = now.strftime("%Y-%m-%d")
    now_str    = now.strftime("%H:%M")
    weekday_cn = ["一","二","三","四","五","六","日"][now.weekday()]

    prompt = (
        f"今天是 {today_str}，星期{weekday_cn}，当前时刻是 {now_str}。\n"
        "你是一个工作计划助手。用户用一句话描述一个工作任务，可能包含日期或时间信息。\n"
        "请解析为以下 JSON 对象，字段说明：\n"
        "- content：简洁的任务名（5-15字）\n"
        "- description：任务的详细说明（如有则填写，否则为空字符串）\n"
        "- duration_min：任务时长（分钟整数），如未提及则默认 60\n"
        f"- start_time：开始时间，格式 \"HH:MM\"；「现在」「马上」「立刻」解析为 {now_str}；如未提及则为 null\n"
        "- date：任务日期，格式 \"YYYY-MM-DD\"，「明天」「后天」「下周X」「X月X日」等需计算；如未提及日期则为 null\n\n"
        "忽略「完毕」「结束」等控制词。只返回 JSON，不添加任何解释：\n"
        "{\"content\": \"任务名\", \"description\": \"说明\", \"duration_min\": 60, "
        "\"start_time\": null, \"date\": null}\n\n"
        f"转录文本：{transcript}"
    )

    try:
        item = extract_json(call_llm(prompt))
        if isinstance(item, list):
            item = item[0] if item else {}
        if not isinstance(item, dict):
            raise ValueError("Expected a JSON object")
        content      = str(item.get("content", "")).strip()
        description  = str(item.get("description", "")).strip()
        duration_min = int(item.get("duration_min", 60) or 60)
        raw_time     = item.get("start_time")
        start_time   = raw_time if (raw_time and re.match(r"^\d{2}:\d{2}$", str(raw_time))) else None
        raw_date     = item.get("date")
        task_date    = raw_date if (raw_date and re.match(r"^\d{4}-\d{2}-\d{2}$", str(raw_date))) \
                       else client_date
        if not content:
            raise ValueError("Empty task content")
        normalized = [{"content": content, "description": description,
                       "duration_min": duration_min, "start_time": start_time,
                       "date": task_date}]
        write_log(task_date, transcript, normalized)
        return jsonify({"items": normalized, "transcript": transcript})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"AI 处理失败：{str(e)}"}), 500


@app.route("/api/voice/reorder", methods=["POST"])
def voice_reorder():
    """Reorder items based on text command using Gemini."""
    data = request.get_json()
    command = data.get("command", "").strip()
    current_items = data.get("items", [])
    if not command or not current_items:
        return jsonify({"error": "command and items required"}), 400

    items_text = "\n".join(
        f"{i+1}. [id={item['id']}] {item['content']}"
        for i, item in enumerate(current_items)
    )
    prompt = (
        "你是一个工作计划助手。根据用户的指令，重新排序工作事项列表。\n"
        "只返回 JSON 数组，每个元素是 {\"id\": <原始id>, \"content\": <内容>}，不得增减条目，不添加解释。\n"
        f"当前列表：\n{items_text}\n\n"
        f"用户指令：{command}"
    )

    try:
        reordered = extract_json(call_llm(prompt))
        if not isinstance(reordered, list):
            raise ValueError("Expected a JSON array")
        return jsonify({"items": reordered})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"AI 处理失败：{str(e)}"}), 500


@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    date_from = request.args.get("from", "")
    date_to   = request.args.get("to",   "")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_from or ""):
        return jsonify({"error": "invalid 'from' date"}), 400
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_to or ""):
        return jsonify({"error": "invalid 'to' date"}), 400

    conn = get_db()
    rows = conn.execute(
        """SELECT date, start_time, duration_min, content, description,
                  status, parallel_group, parallel_reason, created_at
           FROM work_items
           WHERE date >= ? AND date <= ?
           ORDER BY date ASC, start_time ASC NULLS LAST, position ASC""",
        (date_from, date_to)
    ).fetchall()
    conn.close()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["日期", "开始时间", "时长(分钟)", "任务名", "说明",
                     "状态", "并行组", "并行说明", "创建时间"])
    for r in rows:
        writer.writerow([
            r["date"], r["start_time"] or "", r["duration_min"] or 60,
            r["content"], r["description"] or "",
            r["status"] or "pending", r["parallel_group"] or "",
            r["parallel_reason"] or "", r["created_at"]
        ])

    filename = f"schedule_{date_from}_{date_to}.csv"
    return Response(
        "﻿" + buf.getvalue(),   # UTF-8 BOM for Excel
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.route("/api/export/ics", methods=["GET"])
def export_ics():
    date_from = request.args.get("from", "")
    date_to   = request.args.get("to",   "")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_from or ""):
        return jsonify({"error": "invalid 'from' date"}), 400
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_to or ""):
        return jsonify({"error": "invalid 'to' date"}), 400

    conn = get_db()
    rows = conn.execute(
        """SELECT id, date, start_time, duration_min, content, description, status, created_at
           FROM work_items
           WHERE date >= ? AND date <= ? AND status != 'suspended'
           ORDER BY date ASC, start_time ASC NULLS LAST, position ASC""",
        (date_from, date_to)
    ).fetchall()
    conn.close()

    from datetime import timezone
    now_stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Zhixiang//Schedule//ZH",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:志翔日程",
        "X-WR-TIMEZONE:Asia/Tokyo",
    ]

    for r in rows:
        date_compact = r["date"].replace("-", "")
        uid = f"zhixiang-{r['id']}@schedule"

        if r["start_time"]:
            hh, mm = r["start_time"].split(":")
            dur = int(r["duration_min"] or 60)
            end_total = int(hh) * 60 + int(mm) + dur
            end_hh, end_mm = divmod(end_total, 60)
            dtstart = f"DTSTART;TZID=Asia/Tokyo:{date_compact}T{hh}{mm}00"
            dtend   = f"DTEND;TZID=Asia/Tokyo:{date_compact}T{end_hh:02d}{end_mm:02d}00"
        else:
            # All-day event
            dtstart = f"DTSTART;VALUE=DATE:{date_compact}"
            dtend   = f"DTEND;VALUE=DATE:{date_compact}"

        summary = r["content"].replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")
        desc = (r["description"] or "").replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")
        status_map = {"completed": "CONFIRMED", "pending": "TENTATIVE"}
        vstatus = status_map.get(r["status"] or "pending", "TENTATIVE")

        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now_stamp}",
            dtstart,
            dtend,
            f"SUMMARY:{summary}",
            *([ f"DESCRIPTION:{desc}" ] if desc else []),
            f"STATUS:{vstatus}",
            "END:VEVENT",
        ]

    lines.append("END:VCALENDAR")
    content = "\r\n".join(lines) + "\r\n"

    filename = f"schedule_{date_from}_{date_to}.ics"
    return Response(
        content,
        mimetype="text/calendar; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.route("/api/version", methods=["GET"])
def get_version():
    return jsonify({"version": __version__})


@app.route("/api/update", methods=["POST"])
def do_update():
    import subprocess, re
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    local_ver = __version__

    try:
        result = subprocess.run(
            ["git", "pull", "origin", "main"],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            timeout=30,
        )
        output = result.stdout + result.stderr
        updated = "Already up to date." not in output and result.returncode == 0

        # Read the remote version from app.py after pull
        remote_ver = local_ver
        try:
            with open(os.path.join(repo_dir, "app.py"), encoding="utf-8") as f:
                content = f.read()
            m = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
            if m:
                remote_ver = m.group(1)
        except Exception:
            pass

        return jsonify({
            "success": result.returncode == 0,
            "updated": updated,
            "local_version": local_ver,
            "remote_version": remote_ver,
            "output": output.strip(),
        })
    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "error": "git pull 超时"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/logs/<date>", methods=["GET"])
def get_log(date):
    log_path = os.path.join(LOGS_DIR, f"{date}.md")
    if not os.path.exists(log_path):
        return jsonify({"content": ""})
    with open(log_path, encoding="utf-8") as f:
        return jsonify({"content": f.read()})


# ── API key management ────────────────────────────────────────────────────────

def _env_set_key(key: str, value: str):
    """Write or update a key=value line in .env without touching other lines."""
    lines = []
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, encoding="utf-8") as f:
            lines = f.readlines()
    updated = False
    for i, line in enumerate(lines):
        if re.match(rf"^\s*{re.escape(key)}\s*=", line):
            lines[i] = f"{key}={value}\n"
            updated = True
            break
    if not updated:
        lines.append(f"{key}={value}\n")
    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.writelines(lines)
    os.environ[key] = value


def _env_delete_key(key: str):
    """Remove a key line from .env and unset from os.environ."""
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, encoding="utf-8") as f:
            lines = f.readlines()
        lines = [l for l in lines if not re.match(rf"^\s*{re.escape(key)}\s*=", l)]
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.writelines(lines)
    os.environ.pop(key, None)


def _env_read_key(key: str) -> str:
    """Read a key's value directly from the .env file (ignores system env vars)."""
    if not os.path.exists(ENV_PATH):
        return ""
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            m = re.match(rf"^\s*{re.escape(key)}\s*=\s*(.+)$", line.rstrip())
            if m:
                return m.group(1).strip().strip('"').strip("'")
    return ""


@app.route("/api/settings/llm", methods=["GET"])
def llm_get():
    provider = _env_read_key("LLM_PROVIDER") or "gemini"
    resp = jsonify({"provider": provider})
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/api/settings/llm", methods=["POST"])
def llm_set():
    data = request.get_json()
    provider = (data.get("provider") or "").strip()
    if provider not in ("gemini", "deepseek"):
        return jsonify({"error": "provider must be 'gemini' or 'deepseek'"}), 400
    _env_set_key("LLM_PROVIDER", provider)
    return jsonify({"provider": provider})


@app.route("/api/settings/apikey", methods=["GET"])
def apikey_status():
    has_key = bool(_env_read_key("GEMINI_API_KEY"))
    resp = jsonify({"configured": has_key})
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/api/settings/apikey", methods=["POST"])
def apikey_set():
    data = request.get_json()
    key = (data.get("key") or "").strip()
    if not key:
        return jsonify({"error": "key is required"}), 400
    if len(key) < 10:
        return jsonify({"error": "API key 太短，请确认复制完整"}), 400
    _env_set_key("GEMINI_API_KEY", key)
    return jsonify({"configured": True})


@app.route("/api/settings/apikey", methods=["DELETE"])
def apikey_delete():
    _env_delete_key("GEMINI_API_KEY")
    return jsonify({"configured": False})


@app.route("/api/settings/deepseek_apikey", methods=["GET"])
def deepseek_apikey_status():
    has_key = bool(_env_read_key("DEEPSEEK_API_KEY"))
    resp = jsonify({"configured": has_key})
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/api/settings/deepseek_apikey", methods=["POST"])
def deepseek_apikey_set():
    data = request.get_json()
    key = (data.get("key") or "").strip()
    if not key:
        return jsonify({"error": "key is required"}), 400
    if len(key) < 10:
        return jsonify({"error": "API key 太短，请确认复制完整"}), 400
    _env_set_key("DEEPSEEK_API_KEY", key)
    return jsonify({"configured": True})


@app.route("/api/settings/deepseek_apikey", methods=["DELETE"])
def deepseek_apikey_delete():
    _env_delete_key("DEEPSEEK_API_KEY")
    return jsonify({"configured": False})


if __name__ == "__main__":
    import threading, webbrowser
    init_db()
    port = int(os.environ.get("PORT", 4096))
    # Open browser after server starts (only on first launch, not reloader reload)
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        def _open():
            import time; time.sleep(1.2)
            webbrowser.open(f"http://localhost:{port}")
        threading.Thread(target=_open, daemon=True).start()
    app.run(debug=True, port=port)
