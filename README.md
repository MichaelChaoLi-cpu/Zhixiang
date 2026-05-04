# 志翔 · Zhixiang

个人语音日程管理助手。用自然语言添加任务，在时间轴上拖拽排期，由 Gemini AI 智能规划全天。

---

## 快速开始

**前提：系统已安装 Python 3.9+**

```bash
git clone https://github.com/MichaelChaoLi-cpu/Zhixiang.git
./Zhixiang/init.sh
source ~/.zshrc
```

之后在任意终端输入 `Zhixiang` 即可启动，浏览器自动打开 `http://localhost:4096`。

首次使用在右上角 ⚙️ 设置中填入 Gemini API Key（[获取地址](https://aistudio.google.com/app/apikey)）。

---

## 功能

### 任务管理
- **语音添加**：按住麦克风按钮说话，Whisper 本地转文字，Gemini 解析任务
- **文字添加**：底部输入框直接输入，支持自然语言（「明天下午2点开会一小时」）
- **跨日期**：说「明天」「下周一」「5月10日」，任务自动添加到对应日期
- **「现在开始」**：识别「现在/马上/立刻」，自动填入当前时刻为起始时间

### 时间轴
- 任务按 `start_time` 定位在时间轴上，高度对应时长
- 时间重叠的任务自动并列显示（不堆叠）
- 红线标注当前时刻（每分钟更新）
- 短任务（< 60 分钟）悬停展开显示完整内容

### 排期操作
| 操作 | 说明 |
|------|------|
| 拖动任务块 | 在时间轴上纵向拖拽，吸附到 15 分钟整点 |
| 拖动未排期任务 | 从底部未排期列表拖到时间轴，自动设置起始时间 |
| 点击时长徽章 | 直接编辑任务时长（分钟） |
| 点击任务名 | 内联编辑任务名称 |
| ✓ 完成 | 标记完成，若提前完成则自动截断时长 |
| ⏸ 挂起 | 移入任务池，后续可重新排期 |
| + 延长 | 手动延长指定分钟；仅推移实际与延长区间重叠的后续任务 |
| 自动延长 | 任务到期未完成，每 15 分钟自动延长一次 |

### 唤醒词（免手动）
1. 设置中录制 5 段「志翔」语音样本
2. 点击「开启唤醒」，等待呼唤
3. 说「志翔」→ 自动开始录音；说「完毕」或停顿 → 自动结束

### AI 功能
- **✨ AI 规划**：一键让 Gemini 为当天所有任务分配最优起始时间（预览后确认应用）
- **排序模式**：切换后可语音指令调整任务顺序

### 导出
- **CSV**：含日期、时间、时长、任务名、说明、状态，带 UTF-8 BOM 直接用 Excel 打开
- **ICS**：导入 Google Calendar / Apple Calendar；有时间的任务为具体事件，无时间的为全天事件

---

## 目录结构

```
Zhixiang/
├── app.py              # Flask 后端
├── start.sh            # 一键启动脚本
├── requirement.txt     # Python 依赖
├── templates/
│   └── index.html      # 页面结构
├── static/
│   ├── app.js          # 前端逻辑
│   └── style.css       # 样式（深色 / 浅色主题）
├── data/
│   ├── schedule.db     # SQLite 数据库（自动创建）
│   └── wake_samples/   # 唤醒词 MFCC 样本（自动创建）
└── logs/               # 每日任务日志 Markdown（自动创建）
```

---

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Python · Flask · SQLite |
| 语音转文字 | faster-whisper（本地，small 模型） |
| AI 处理 | Google Gemini 2.5 Flash |
| 唤醒词 | MFCC + DTW 相似度匹配（本地） |
| 前端 | 原生 JS · CSS 变量主题 |

语音音频仅在本机处理，不上传至任何服务器；仅文字内容发送给 Gemini。

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` | Gemini API Key（可在设置 UI 中配置，无需手动编辑 .env） |
| `PORT` | 服务端口，默认 `4096` |

---

## 依赖

```
flask
google-genai
python-dotenv
faster-whisper
scipy
```

首次运行 `start.sh` 时自动安装。
