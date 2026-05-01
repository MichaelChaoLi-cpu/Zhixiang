import os
import json
import sqlite3
import re
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from google import genai

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "schedule.db")


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
    """Return distinct dates that have at least one item (for dot markers)."""
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
    # Find current max position for this date
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
    items = data.get("items", [])   # list of {id, content} or just ids
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


# ── Voice / Gemini endpoints ──────────────────────────────────────────────────

def extract_json(text: str):
    """Try to pull a JSON array out of a freeform Gemini response."""
    # Strip markdown code fences
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    # Find the first '[' ... ']' block
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1:
        return json.loads(text[start:end + 1])
    return json.loads(text)


@app.route("/api/voice/process", methods=["POST"])
def voice_process():
    """Send audio directly to Gemini; returns transcript + extracted work items."""
    if "audio" not in request.files:
        return jsonify({"error": "audio file required"}), 400
    audio_file = request.files["audio"]
    mime_type = request.form.get("mime_type", "audio/webm")
    audio_bytes = audio_file.read()

    try:
        client = configure_gemini()
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    prompt = (
        "你是一个工作计划助手。用户用中文或日文说出今天的工作事项。\n"
        "请完成两件事：\n"
        "1. 将语音内容转录为文字（transcript 字段）\n"
        "2. 从中提取工作事项列表（items 字段），每条简洁中文描述\n"
        "只返回如下 JSON，不添加任何解释：\n"
        "{\"transcript\": \"...\", \"items\": [\"事项1\", \"事项2\"]}"
    )

    try:
        from google.genai import types
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                prompt,
            ]
        )
        text = response.text.strip()
        text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
        result = json.loads(text)
        return jsonify({
            "transcript": result.get("transcript", ""),
            "items": [str(i) for i in result.get("items", []) if str(i).strip()],
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Gemini 处理失败：{str(e)}"}), 500


@app.route("/api/voice/reorder", methods=["POST"])
def voice_reorder():
    """Send audio + current items to Gemini; returns reordered list."""
    if "audio" not in request.files:
        return jsonify({"error": "audio file required"}), 400
    audio_file = request.files["audio"]
    mime_type = request.form.get("mime_type", "audio/webm")
    audio_bytes = audio_file.read()
    current_items = json.loads(request.form.get("items", "[]"))

    if not current_items:
        return jsonify({"error": "items required"}), 400

    try:
        client = configure_gemini()
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    items_text = "\n".join(
        f"{i+1}. [id={item['id']}] {item['content']}"
        for i, item in enumerate(current_items)
    )
    prompt = (
        "你是一个工作计划助手。用户用语音发出排序指令，要求调整工作事项列表的顺序。\n"
        "请根据语音指令，返回重新排序后的完整列表。\n"
        "只返回 JSON 数组，每个元素是 {\"id\": <原始id>, \"content\": <内容>}，不得增减条目，不添加解释。\n"
        f"当前列表：\n{items_text}"
    )

    try:
        from google.genai import types
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                prompt,
            ]
        )
        reordered = extract_json(response.text)
        if not isinstance(reordered, list):
            raise ValueError("Expected a JSON array")
        return jsonify({"items": reordered})
    except Exception as e:
        return jsonify({"error": f"Gemini 处理失败：{str(e)}"}), 500


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 4096))
    app.run(debug=True, port=port)
