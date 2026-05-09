# 志翔 · Zhixiang

![Version](https://img.shields.io/badge/version-0.0.10-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![macOS](https://img.shields.io/badge/platform-macOS-lightgrey?logo=apple)
![Linux](https://img.shields.io/badge/platform-Linux-lightgrey?logo=linux)
![Windows](https://img.shields.io/badge/platform-Windows-lightgrey?logo=windows)
![Stars](https://img.shields.io/github/stars/MichaelChaoLi-cpu/Zhixiang?style=social)

个人语音日程管理助手。用自然语言或语音添加任务，在时间轴上拖拽排期，由 AI 智能规划全天。支持中英双语界面，AI 输出语言随界面语言自动切换。

A personal voice-driven schedule assistant. Add tasks by voice or text, drag to reschedule on the timeline, and let AI plan your day. Supports Chinese/English UI with AI output language matching the selected interface language.

支持两款主流 LLM，可在设置中随时切换：

| LLM | 说明 | 获取 API Key |
|-----|------|-------------|
| **Google Gemini 2.5 Flash** | 默认推荐，有免费额度 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **DeepSeek-V3** | 高性价比替代方案，能力强，价格低 | [DeepSeek Platform](https://platform.deepseek.com/) |

> 语音音频仅在本机处理（faster-whisper），仅文字内容发送给所选 LLM，保护隐私。
>
> Voice audio is processed locally (faster-whisper). Only text is sent to the selected LLM.

---

## 快速开始 / Quick Start

### macOS

```bash
git clone https://github.com/MichaelChaoLi-cpu/Zhixiang.git
bash Zhixiang/init.sh
source ~/.zshrc
Zhixiang
```

> `init.sh` 会自动安装 Python 3.12（通过 Homebrew）、创建虚拟环境、注册 `Zhixiang` 命令。

### Linux / WSL

```bash
git clone https://github.com/MichaelChaoLi-cpu/Zhixiang.git
bash Zhixiang/init.sh
source ~/.bashrc   # 或 source ~/.zshrc
Zhixiang
```

> `init.sh` 会自动通过 apt / dnf / pacman 安装 Python 3.12（需要 sudo 权限），并修复 Ubuntu 上 pip 缺失的问题。

### Windows

```cmd
git clone https://github.com/MichaelChaoLi-cpu/Zhixiang.git
cd Zhixiang
init.bat
```

之后双击 `start.bat` 启动应用，或在 cmd 中运行 `start.bat`。

> 前提：已安装 [Git for Windows](https://git-scm.com/download/win) 和 [Python 3.12](https://www.python.org/downloads/)（安装时勾选 **Add Python to PATH**）。

浏览器会自动打开 `http://localhost:4096`（端口被占用时自动 +1）。

---

**首次使用**：点击右上角 ⚙️ 设置，选择 LLM 并填入对应 API Key：
- Gemini：[Google AI Studio 免费获取](https://aistudio.google.com/app/apikey)
- DeepSeek：[DeepSeek Platform 注册获取](https://platform.deepseek.com/)

---

## 功能概览 / Features

### 界面语言 / UI Language

点击顶栏 **EN** / **中文** 按钮切换语言。切换后：
- 所有界面文字（按钮、提示、状态信息）即时更新
- AI 输出语言（任务名、规划内容、并行说明等）随之切换
- 语言偏好保存在本地，刷新后保持

Click **EN** / **中文** in the top bar to switch languages. All UI text and AI output (task names, schedule content, parallel notes) switch together. The preference is saved locally.

### 添加任务 / Add Tasks

| 方式 | 中文示例 | English example |
|------|---------|----------------|
| 文字输入 | `明天下午2点开会一小时`，Shift+Enter 提交 | `Meeting tomorrow at 2pm for 1 hour`, Shift+Enter |
| 语音输入 | 按住麦克风按钮说话 | Hold the mic button and speak |
| 唤醒词免提 | 说「志翔」→ 开始录音，说「完毕」→ 结束 | Say "Zhixiang" → start, say "Wanbi" → stop |
| 跨日期 | `下周一上午10点提交报告` → 自动添加到对应日期 | `Submit report next Monday 10am` |
| 立即开始 | `现在开始写文档，两小时` | `Start writing docs now, 2 hours` |

### 时间轴操作 / Timeline

| 操作 | 说明 |
|------|------|
| 拖动任务块 | 纵向拖拽，吸附到 15 分钟整点 |
| 双击时间标签 | 直接修改任务起始时间 |
| 点击时长徽章 | 直接修改任务时长 |
| 双击任务名 | 内联编辑任务名称（任务池同样支持） |
| 双击任务空白区 | 记录日志和笔记（挂起块同样支持） |
| 📌 图钉 | 锁定起始时间，禁止拖拽 / 时间编辑 / 自动推移 |
| 并行任务 | 时间重叠自动并列显示，不堆叠（挂起块参与并列布局） |
| 挂起块悬停 | 块高度过小时，鼠标移入自动展开显示完整内容 |

### 任务编号 / Task Numbers

每天排期后自动分配 `T01`–`T99` 序号，编号一经分配不再改变；挂起后重新排期可获新编号。

### 任务状态 / Task Status

| 操作 | 行为 |
|------|------|
| ✓ 完成 | 提前完成自动截断时长（精确记录实际用时） |
| ⏸ 挂起 | 已消耗时段保留在时间轴（显示原任务编号，可写笔记），剩余部分移入任务池；挂起时自动写入日志；从任务池重新排期后获得新编号 |
| + 延长 | 手动延长；仅推移实际被覆盖的后续任务 |
| 自动延长 | 到期未处理，每 15 分钟自动 +15 分钟（图钉任务不受影响） |

### AI 功能 / AI Features

- **✨ AI 规划**：一键为当天所有任务分配最优时间段，预览确认后应用
- **排序模式**：语音指令调整任务顺序（如「把写报告移到最前面」/ "Move the report task to the top"）

### 导出 / Export

- **CSV**：Excel 可直接打开（UTF-8 BOM），含全部字段
- **ICS**：导入 Google Calendar / Apple Calendar，有时间的任务为具体事件

---

## 技术栈 / Tech Stack

| 层 | 技术 |
|----|------|
| 后端 | Python · Flask · SQLite |
| 语音识别 | faster-whisper（本地，small 模型） |
| AI 处理 | Google Gemini 2.5 Flash / DeepSeek-V3（可切换） |
| 唤醒词 | MFCC + DTW 相似度匹配（本地，无需联网） |
| 前端 | 原生 JS · CSS 变量（深色 / 浅色主题） |
| 国际化 | 内置中英双语，`localStorage` 持久化 |

---

## 目录结构

```
Zhixiang/
├── app.py              # Flask 后端 + API
├── init.sh             # 初始化脚本（macOS / Linux）
├── start.sh            # 启动脚本（macOS / Linux）
├── init.bat            # 初始化脚本（Windows）
├── start.bat           # 启动脚本（Windows）
├── requirement.txt     # Python 依赖
├── LICENSE
├── templates/
│   └── index.html
├── static/
│   ├── app.js
│   └── style.css
├── data/               # 自动创建
│   ├── schedule.db     # SQLite 数据库
│   └── wake_samples/   # 唤醒词 MFCC 样本
└── logs/               # 每日任务日志（Markdown，自动创建）
```

---

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `GEMINI_API_KEY` | Gemini API Key（可在 UI 设置中配置） | — |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（可在 UI 设置中配置） | — |
| `PORT` | 服务端口 | `4096` |

---

## 版本历史 / Changelog

### v0.0.10 (2026-05)
- 挂起任务在时间轴上显示任务编号和任务名（与正常任务保持一致，仅样式不同）
- 挂起任务支持双击写入日志 / 笔记
- 挂起时自动将任务编号写入当日日志
- 挂起后重新排期可获得新的任务编号
- 挂起块高度过小时，鼠标移入自动展开显示完整内容
- 挂起任务参与时间轴并列布局（不再堆叠在其他任务下方）

### v0.0.9 (2026-05)
- 新增中英双语界面，点击顶栏 **EN** / **中文** 即时切换
- AI 输出语言（任务名、规划内容、并行说明）随界面语言自动切换
- 修复 Ubuntu / WSL 下 `pip` 不存在导致 `init.sh` 失败的问题（自动 ensurepip + apt 回退）

### v0.0.8 (2026-05)
- 任务池改为全局共享，切换日期后任务池内容不变
- 新增 `GET /api/items/unscheduled`，跨所有日期聚合未排期任务
- 切换日期时自动展开任务池面板，排期对话框提示目标日期

### v0.0.7 (2026-05)
- 跨平台支持：新增 Windows（`init.bat` / `start.bat`），`init.sh` 兼容 Linux（apt / dnf / pacman）
- 任务自动分配每日序号 T01–T99，排期后锁定，挂起重排可获新编号
- 📌 图钉功能：锁定任务起始时间，禁止拖拽、时间编辑及自动推移
- 双击时间标签可直接修改起始时间
- 双击任务名称可内联编辑（时间轴与任务池均支持）
- 双击任务空白区域可记录日志和笔记
- 启动时自动检测被占用端口，从 4096 开始逐一 +1
- 电脑 sleep 后重启，未完成任务自动推移到当前时间 +15 分钟（图钉任务除外）

### v0.0.6 (2026-05)
- 未排期任务统一显示在任务池，移除时间轴底部"未排期"区域
- 挂起任务时，已消耗时段保留在时间轴（条纹样式），剩余时长移入任务池
- 任务池排期支持自然语言输入，通过 LLM 解析日期和时间
- 文字输入框改为多行，Shift+Enter 提交，Enter 换行

### v0.0.5 (2026-05)
- 网页顶栏新增"检测最新版本"按钮，自动执行 git pull 并在有更新时刷新页面
- 时间轴范围调整为 07:00–22:00

### v0.0.4 (2026-05)
- 时间轴范围调整为 07:00–22:00

### v0.0.3 (2026-05)
- 支持多 LLM：Gemini 2.5 Flash / DeepSeek-V3 可在设置中切换
- init.sh 自动安装 Python 3.12（通过 Homebrew）

### v0.0.1 (2026-05)
- 初始版本
- 语音 / 文字添加任务，自然语言解析日期时间
- 时间轴拖拽排期，并行任务自动并列
- 任务完成截断、挂起、手动 / 自动延长
- AI 一键规划全天
- 唤醒词免提（MFCC + DTW）
- CSV / ICS 导出
- 深色 / 浅色主题
- Gemini API Key 在 UI 中管理

---

## License

[MIT](LICENSE) © 2026 MichaelChaoLi-cpu
