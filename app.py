import os
import json
import sqlite3
import re
import tempfile
import glob
from datetime import datetime
import numpy as np
from scipy.fft import dct
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from google import genai

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

DB_PATH          = os.path.join(os.path.dirname(__file__), "data", "schedule.db")
LOGS_DIR         = os.path.join(os.path.dirname(__file__), "logs")
WAKE_SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "data", "wake_samples")


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


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS work_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            content TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def configure_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def write_log(date: str, transcript: str, items: list):
    os.makedirs(LOGS_DIR, exist_ok=True)
    log_path = os.path.join(LOGS_DIR, f"{date}.md")
    ts = datetime.now().strftime("%H:%M")
    lines = [f"\n## [{ts}] 语音记录\n", f"**转录：** {transcript}\n"]
    if items:
        lines.append("\n**提取事项：**\n")
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item}\n")
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
        "SELECT id, date, content, position, created_at FROM work_items WHERE date=? ORDER BY position ASC, id ASC",
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
    for content in items:
        content = content.strip()
        if not content:
            continue
        cur = conn.execute(
            "INSERT INTO work_items (date, content, position) VALUES (?, ?, ?)",
            (date, content, next_pos)
        )
        inserted.append({"id": cur.lastrowid, "date": date, "content": content, "position": next_pos})
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
    """Extract work items from text transcript using Gemini."""
    data = request.get_json()
    transcript = data.get("transcript", "").strip()
    date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    if not transcript:
        return jsonify({"error": "transcript required"}), 400

    try:
        client = configure_gemini()
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    prompt = (
        "你是一个工作计划助手。用户用中文或日文说出今天的工作事项。\n"
        "请从以下转录文本中提取工作事项列表，每条简洁中文描述，忽略「完毕」「结束」等控制词。\n"
        "只返回 JSON 数组，不添加任何解释：[\"事项1\", \"事项2\"]\n\n"
        f"转录文本：{transcript}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        items = extract_json(response.text)
        if not isinstance(items, list):
            raise ValueError("Expected a JSON array")
        items = [str(i) for i in items if str(i).strip()]
        write_log(date, transcript, items)
        return jsonify({"items": items})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Gemini 处理失败：{str(e)}"}), 500


@app.route("/api/voice/reorder", methods=["POST"])
def voice_reorder():
    """Reorder items based on text command using Gemini."""
    data = request.get_json()
    command = data.get("command", "").strip()
    current_items = data.get("items", [])
    if not command or not current_items:
        return jsonify({"error": "command and items required"}), 400

    try:
        client = configure_gemini()
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

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
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        reordered = extract_json(response.text)
        if not isinstance(reordered, list):
            raise ValueError("Expected a JSON array")
        return jsonify({"items": reordered})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Gemini 处理失败：{str(e)}"}), 500


@app.route("/api/logs/<date>", methods=["GET"])
def get_log(date):
    log_path = os.path.join(LOGS_DIR, f"{date}.md")
    if not os.path.exists(log_path):
        return jsonify({"content": ""})
    with open(log_path, encoding="utf-8") as f:
        return jsonify({"content": f.read()})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 4096))
    app.run(debug=True, port=port)
