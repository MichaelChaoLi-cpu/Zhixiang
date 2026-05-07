# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 启动与开发

```bash
# 初始化（首次 / 依赖变更后）
bash init.sh

# 启动应用
bash start.sh          # macOS / Linux
# 或直接
.venv/bin/python app.py

# 访问
open http://localhost:4096
```

无测试框架，无构建步骤，无 lint 配置。验证改动需手动在浏览器中操作。

## 架构

**单进程 Flask + 原生 JS SPA**，无任何前端构建工具。

```
app.py          ← Flask 后端，所有 REST API，唤醒词 MFCC/DTW 逻辑
templates/index.html  ← 唯一 HTML 页面（Jinja2 仅用于 render_template）
static/app.js   ← 全部前端逻辑（~2200 行），含 i18n、状态管理、渲染
static/style.css
data/schedule.db       ← SQLite，自动创建
data/wake_samples/     ← 唤醒词 MFCC 样本（.npy），自动创建
```

## 关键约定

### LLM 调用
所有 LLM 调用统一走 `call_llm(prompt: str) -> str`（`app.py`）。  
涉及 LLM 的 4 个端点各自构建 prompt，**必须根据 `lang` 参数提供中英文两套 prompt**：

| 端点 | 作用 |
|------|------|
| `POST /api/voice/process` | 语音/文字 → 解析任务 |
| `POST /api/voice/reorder` | 语音指令 → 重排任务 |
| `POST /api/schedule/generate` | AI 一键规划全天 |
| `POST /api/pool/parse-time` | 自然语言 → 日期时间 |

前端每次调用以上端点时都在请求体中携带 `lang: getCurrentLang()`。

### 国际化（i18n）
- 语言偏好存在 `localStorage("lang")`，值为 `"zh"` 或 `"en"`
- 所有 UI 字符串走 `t('key', {vars})` 函数，locale 定义在 `app.js` 顶部 `LOCALES` 对象
- `applyLocale()` 负责刷新所有静态 DOM 元素并重新渲染动态内容，在 `init()` 和语言切换时调用
- **禁止**在 `app.js` 中直接硬编码中文或英文 UI 字符串，新增字符串必须同时加入 `LOCALES.zh` 和 `LOCALES.en`

### 环境变量（`.env`）
通过 `_env_read_key` / `_env_set_key` / `_env_delete_key` 读写，不直接用 `os.environ`。  
API Key 在 UI 设置面板中管理，不在代码中硬编码。

### 数据库
SQLite，通过 `get_db()` 获取连接（`row_factory = sqlite3.Row`）。  
新增字段走 `init_db()` 里的 `migrations` 列表（`ALTER TABLE ADD COLUMN`），保持向后兼容。

### 版本号
`app.py` 顶部 `__version__` 变量，同步更新 `README.md` 徽章。

## 不要改动

- `WAKE_WORD = "志翔"` / `END_WORD = "完毕"`：唤醒词硬编码为中文，与语音采样绑定
- `transcribe_audio()` 中 `language="zh"`：Whisper 固定转录中文（用户说中文下达指令）
- LLM prompt 的 JSON 结构约定（字段名、格式）：前端 `extract_json()` 依赖固定结构解析
