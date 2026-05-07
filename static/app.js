/* ── i18n ───────────────────────────────────────────────────────────── */
const LOCALES = {
  zh: {
    pageTitle: "日程计划",
    topbarCheckUpdate: "检测最新版本",
    topbarCheckUpdateTitle: "检查并更新到最新版本",
    themeBtnTitle: "切换主题",
    settingsBtnTitle: "唤醒词设置",
    langBtn: "EN",
    settingsTitle: "设置",
    settingsAiModel: "AI 模型",
    settingsConfigured: "✓ 已配置",
    settingsDeleteKey: "删除 Key",
    settingsGeminiPlaceholder: "输入 Gemini API Key",
    settingsDeepSeekPlaceholder: "输入 DeepSeek API Key",
    settingsSave: "保存",
    settingsWakeSample: "唤醒词采样",
    settingsWakeDesc: "录制 5 段你说「<strong>志翔</strong>」的声音，系统将学习识别你的声音。",
    settingsRecordSample: "按住录制样本",
    settingsClearSample: "清除所有样本",
    settingsSampleHint: "建议：每次说完整的「志翔」，停顿约 1 秒后松开",
    aiPlanTitle: "✨ AI 规划预览",
    aiPlanLoading: "正在生成规划…",
    aiPlanCancel: "取消",
    aiPlanApply: "应用规划",
    months: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    weekdays: ["日","一","二","三","四","五","六"],
    calTitle: "{y}年 {month}",
    exportTitle: "导出日程",
    exportFrom: "从",
    exportTo: "至",
    aiPlanBtn: "✨ AI 规划",
    modeLabel: "模式：",
    modeSortBtn: "排序模式",
    modeAddBtn: "返回添加模式",
    poolTitle: "任务池",
    poolEmpty: "暂无待办任务",
    poolScheduleBtn: "排期",
    micTitle: "麦克风",
    micDetecting: "检测中…",
    inputPlaceholder: "输入任务，如：下午2点开会一小时（Shift+Enter 添加）",
    micBtnTitle: "按住说话",
    addBtn: "添加",
    wakeBtn: "🎧 开启唤醒",
    wakeBtnActive: "🔴 关闭唤醒",
    statusRecordingReorder: "🎙️ 请说出排序指令…",
    statusRecording: "🎙️ 录音中… 松开按钮即可处理",
    statusTranscribing: "📝 本地转录中…",
    statusProcessing: "⏳ Gemini 整理中…",
    statusIdleReorder: "排序模式：按住麦克风说出排序指令",
    statusIdle: "按住麦克风按钮说出工作事项",
    durationUnit: "分钟",
    durationShort: "分",
    pinTitle: "已图钉，起始时间锁定",
    unpinTitle: "取消图钉",
    pinLockTitle: "图钉锁定起始时间",
    taskComplete: "✓ 完成",
    taskSuspend: "⏸ 挂起",
    taskExtend: "+ 延长",
    taskDelete: "✕",
    durationEditTitle: "点击修改时长",
    titleEditTitle: "双击编辑任务名",
    timeEditTitle: "双击编辑开始时间",
    extendLabel: "延长",
    extendUnit: "分钟",
    extendConfirm: "确认",
    notePlaceholder: "记录日志和笔记…",
    noteHint: "Ctrl+Enter 保存 · Esc 取消",
    noteSave: "保存",
    noteCancel: "取消",
    scheduleTitle: "排期时间（支持自然语言）",
    schedulePlaceholderWork: "如：明天上午10点、下周一14:00，留空则不排期",
    schedulePlaceholderPool: "如：14:00、下午两点，留空则加入 {date} 未排期",
    scheduleParse: "解析",
    scheduleConfirm: "确认",
    parseResult: "→ {date} {time}",
    parseResultNoTime: "→ {date}（未排期）",
    parseFailed: "解析失败：{msg}",
    unscheduledLabel: "→ 保持未排期（{date}）",
    unscheduledAddLabel: "→ 加入 {date} 未排期列表",
    emptyState: "今天还没有工作事项<br>按住麦克风按钮开始添加",
    toastOpFailed: "操作失败",
    toastCompleted: "已标记完成",
    toastSuspendFailed: "挂起失败",
    toastSuspended: "已移至任务池",
    toastExtendFailed: "延长失败",
    toastExtended: "已延长 {n} 分钟",
    toastScheduleFailed: "排期失败",
    toastScheduled: "已排期到 {date} {time}",
    toastUnscheduled: "保持未排期",
    toastMovedToPool: "已移至未排期列表",
    toastDropScheduled: "已排期到 {time}",
    toastNoDate: "请先选择日期",
    toastSelectDates: "请选择起止日期",
    toastDateRangeError: "起始日期不能晚于结束日期",
    toastShortRecording: "录音太短，请重试",
    toastNoSpeech: "未识别到语音内容",
    toastNoItems: "未识别到工作事项",
    toastNoReorder: "当前没有可排序的事项",
    toastAdded: "已添加工作事项",
    toastAddedTo: "已添加到 {date}",
    toastReordered: "排序已更新",
    toastAIPlanApplied: "AI 规划已应用",
    toastAIPlanFailed: "应用失败",
    toastWakeFailed: "唤醒监听启动失败：{msg}",
    toastWakeDetected: "已唤醒，说完说「{word}」结束",
    toastSampleCleared: "样本已清除",
    toastSaveFailed: "保存失败",
    toastDeviceError: "无法打开该设备：{msg}",
    toastMicError: "无法打开麦克风：{msg}",
    wakeLabelListening: "监听中「{word}」…",
    wakeLabelRecording: "录音中，说「{word}」结束…",
    sampleEnough: "样本已足够（可继续添加）",
    sampleEnabled: "已启用声纹检测，阈值 {val}",
    sampleNeeded: "还需录制 {n} 个样本",
    sampleRecording: "🔴 录制中…",
    sampleSpeakPrompt: "请说「志翔」…",
    sampleTooShort: "录音太短，请重试",
    sampleSaving: "保存中…",
    sampleError: "错误：{msg}",
    sampleRecordBtn: "按住录制样本",
    micPermDenied: "麦克风权限被拒绝。请在浏览器地址栏点击 🔒 图标允许麦克风，或前往<br><b>系统设置 → 隐私与安全 → 麦克风</b>，开启浏览器权限后刷新页面。",
    micNotFound: "未检测到麦克风设备",
    micInitFailed: "麦克风初始化失败：{msg}",
    micDeviceDefault: "麦克风 {n}",
    micDeviceNone: "未检测到麦克风",
    micDeviceListFailed: "无法获取设备列表",
    errTranscribe: "转录失败：{msg}",
    errGeneral: "错误：{msg}",
    errAIProcess: "AI 处理失败",
    errReorder: "排序失败",
    errGenerate: "生成失败",
    confirmDeleteKey: "确定要删除 API Key 吗？",
    confirmClearSamples: "确认清除所有唤醒词样本？",
    updateFailed: "更新失败：{msg}",
    updateSuccess: "已更新！\n本地版本：v{local}\n最新版本：v{remote}\n\n即将刷新页面…",
    updateUpToDate: "已是最新版本 v{version}",
    updateRequestFailed: "更新请求失败：{msg}",
    updateBtn: "检测最新版本",
    autoExtended: "{n} 个任务已自动延长 15 分钟",
    friendlyDate: "{y}年{m}月{d}日",
    dateLocale: "zh-CN",
  },
  en: {
    pageTitle: "Schedule",
    topbarCheckUpdate: "Check for Updates",
    topbarCheckUpdateTitle: "Check and update to the latest version",
    themeBtnTitle: "Toggle theme",
    settingsBtnTitle: "Wake word settings",
    langBtn: "中文",
    settingsTitle: "Settings",
    settingsAiModel: "AI Model",
    settingsConfigured: "✓ Configured",
    settingsDeleteKey: "Delete Key",
    settingsGeminiPlaceholder: "Enter Gemini API Key",
    settingsDeepSeekPlaceholder: "Enter DeepSeek API Key",
    settingsSave: "Save",
    settingsWakeSample: "Wake Word Sampling",
    settingsWakeDesc: "Record 5 clips of you saying <strong>Zhixiang</strong> so the system can learn your voice.",
    settingsRecordSample: "Hold to Record Sample",
    settingsClearSample: "Clear All Samples",
    settingsSampleHint: "Tip: Say the full wake word each time, pause ~1 second before releasing",
    aiPlanTitle: "✨ AI Planning Preview",
    aiPlanLoading: "Generating plan…",
    aiPlanCancel: "Cancel",
    aiPlanApply: "Apply Plan",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    weekdays: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    calTitle: "{month} {y}",
    exportTitle: "Export Schedule",
    exportFrom: "From",
    exportTo: "To",
    aiPlanBtn: "✨ AI Plan",
    modeLabel: "Mode:",
    modeSortBtn: "Sort Mode",
    modeAddBtn: "Back to Add",
    poolTitle: "Task Pool",
    poolEmpty: "No pending tasks",
    poolScheduleBtn: "Schedule",
    micTitle: "Microphone",
    micDetecting: "Detecting…",
    inputPlaceholder: "Add task, e.g.: meeting at 2pm for 1 hour (Shift+Enter to add)",
    micBtnTitle: "Hold to speak",
    addBtn: "Add",
    wakeBtn: "🎧 Enable Wake",
    wakeBtnActive: "🔴 Disable Wake",
    statusRecordingReorder: "🎙️ Say your reorder command…",
    statusRecording: "🎙️ Recording… release to process",
    statusTranscribing: "📝 Transcribing locally…",
    statusProcessing: "⏳ AI processing…",
    statusIdleReorder: "Sort mode: hold mic and say reorder command",
    statusIdle: "Hold the mic button to dictate tasks",
    durationUnit: "min",
    durationShort: "min",
    pinTitle: "Pinned — start time locked",
    unpinTitle: "Unpin",
    pinLockTitle: "Pin to lock start time",
    taskComplete: "✓ Done",
    taskSuspend: "⏸ Suspend",
    taskExtend: "+ Extend",
    taskDelete: "✕",
    durationEditTitle: "Click to edit duration",
    titleEditTitle: "Double-click to edit name",
    timeEditTitle: "Double-click to edit start time",
    extendLabel: "Extend",
    extendUnit: "min",
    extendConfirm: "OK",
    notePlaceholder: "Add notes and logs…",
    noteHint: "Ctrl+Enter to save · Esc to cancel",
    noteSave: "Save",
    noteCancel: "Cancel",
    scheduleTitle: "Schedule time (natural language supported)",
    schedulePlaceholderWork: "e.g.: tomorrow 10am, next Monday 14:00, leave blank to keep unscheduled",
    schedulePlaceholderPool: "e.g.: 14:00, 2pm, leave blank to add to {date} unscheduled",
    scheduleParse: "Parse",
    scheduleConfirm: "Confirm",
    parseResult: "→ {date} {time}",
    parseResultNoTime: "→ {date} (unscheduled)",
    parseFailed: "Parse failed: {msg}",
    unscheduledLabel: "→ Keep unscheduled ({date})",
    unscheduledAddLabel: "→ Add to {date} unscheduled",
    emptyState: "No tasks yet today<br>Hold the mic button to start adding",
    toastOpFailed: "Operation failed",
    toastCompleted: "Marked as done",
    toastSuspendFailed: "Suspend failed",
    toastSuspended: "Moved to task pool",
    toastExtendFailed: "Extend failed",
    toastExtended: "Extended by {n} min",
    toastScheduleFailed: "Schedule failed",
    toastScheduled: "Scheduled to {date} {time}",
    toastUnscheduled: "Kept unscheduled",
    toastMovedToPool: "Moved to unscheduled list",
    toastDropScheduled: "Scheduled to {time}",
    toastNoDate: "Please select a date first",
    toastSelectDates: "Please select a date range",
    toastDateRangeError: "Start date cannot be after end date",
    toastShortRecording: "Recording too short, please try again",
    toastNoSpeech: "No speech detected",
    toastNoItems: "No tasks detected",
    toastNoReorder: "No tasks to reorder",
    toastAdded: "Task added",
    toastAddedTo: "Added to {date}",
    toastReordered: "Order updated",
    toastAIPlanApplied: "AI plan applied",
    toastAIPlanFailed: "Apply failed",
    toastWakeFailed: "Wake listener failed: {msg}",
    toastWakeDetected: "Awake — say \"{word}\" to stop",
    toastSampleCleared: "Samples cleared",
    toastSaveFailed: "Save failed",
    toastDeviceError: "Cannot open device: {msg}",
    toastMicError: "Cannot open microphone: {msg}",
    wakeLabelListening: "Listening for \"{word}\"…",
    wakeLabelRecording: "Recording — say \"{word}\" to stop…",
    sampleEnough: "Enough samples (you can add more)",
    sampleEnabled: "Voice detection enabled, threshold {val}",
    sampleNeeded: "{n} more sample(s) needed",
    sampleRecording: "🔴 Recording…",
    sampleSpeakPrompt: "Say \"Zhixiang\"…",
    sampleTooShort: "Recording too short, please try again",
    sampleSaving: "Saving…",
    sampleError: "Error: {msg}",
    sampleRecordBtn: "Hold to Record Sample",
    micPermDenied: "Microphone permission denied. Click the 🔒 icon in the browser address bar to allow access, or go to<br><b>System Settings → Privacy & Security → Microphone</b> and enable browser access, then refresh the page.",
    micNotFound: "No microphone detected",
    micInitFailed: "Microphone initialization failed: {msg}",
    micDeviceDefault: "Microphone {n}",
    micDeviceNone: "No microphone detected",
    micDeviceListFailed: "Cannot retrieve device list",
    errTranscribe: "Transcription failed: {msg}",
    errGeneral: "Error: {msg}",
    errAIProcess: "AI processing failed",
    errReorder: "Reorder failed",
    errGenerate: "Generation failed",
    confirmDeleteKey: "Are you sure you want to delete the API Key?",
    confirmClearSamples: "Clear all wake word samples?",
    updateFailed: "Update failed: {msg}",
    updateSuccess: "Updated!\nLocal version: v{local}\nLatest version: v{remote}\n\nRefreshing page…",
    updateUpToDate: "Already up to date: v{version}",
    updateRequestFailed: "Update request failed: {msg}",
    updateBtn: "Check for Updates",
    autoExtended: "{n} task(s) auto-extended by 15 min",
    friendlyDate: "{m}/{d}/{y}",
    dateLocale: "en-US",
  },
};

function getCurrentLang() {
  return localStorage.getItem("lang") || "zh";
}

function t(key, vars) {
  const lang = getCurrentLang();
  let str = (LOCALES[lang] || LOCALES.zh)[key];
  if (str === undefined) str = (LOCALES.zh)[key] || key;
  if (vars && typeof str === "string") {
    str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
  }
  return str;
}

function applyLocale() {
  const lang = getCurrentLang();
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");

  function setEl(id, text, placeholder, title) {
    const el = document.getElementById(id);
    if (!el) return;
    if (text !== undefined && text !== null) el.textContent = text;
    if (placeholder !== undefined && placeholder !== null) el.placeholder = placeholder;
    if (title !== undefined && title !== null) el.title = title;
  }

  // Topbar
  setEl("topbar-title", "📅 " + t("pageTitle"));
  setEl("topbar-date", new Date().toLocaleDateString(
    lang === "zh" ? "zh-CN" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  ));
  setEl("update-btn", t("topbarCheckUpdate"), null, t("topbarCheckUpdateTitle"));
  setEl("lang-btn", t("langBtn"));
  setEl("theme-btn", null, null, t("themeBtnTitle"));
  setEl("settings-btn", null, null, t("settingsBtnTitle"));

  // Settings
  setEl("settings-title-text", t("settingsTitle"));
  setEl("settings-ai-model-title", t("settingsAiModel"));
  setEl("gemini-status-text", t("settingsConfigured"));
  setEl("gemini-delete-btn", t("settingsDeleteKey"));
  setEl("gemini-input", null, t("settingsGeminiPlaceholder"));
  setEl("gemini-save-btn", t("settingsSave"));
  setEl("deepseek-status-text", t("settingsConfigured"));
  setEl("deepseek-delete-btn", t("settingsDeleteKey"));
  setEl("deepseek-input", null, t("settingsDeepSeekPlaceholder"));
  setEl("deepseek-save-btn", t("settingsSave"));
  setEl("settings-wake-title", t("settingsWakeSample"));
  const wakeDesc = document.getElementById("settings-wake-desc");
  if (wakeDesc) wakeDesc.innerHTML = t("settingsWakeDesc");
  setEl("sample-record-btn", t("settingsRecordSample"));
  setEl("sample-clear-btn", t("settingsClearSample"));
  setEl("sample-hint", t("settingsSampleHint"));

  // AI Plan modal
  setEl("ai-plan-title-text", t("aiPlanTitle"));
  setEl("ai-plan-loading", t("aiPlanLoading"));
  setEl("ai-plan-cancel", t("aiPlanCancel"));
  setEl("ai-plan-apply", t("aiPlanApply"));

  // Weekdays
  const wdSpans = document.querySelectorAll(".cal-weekdays span");
  const wds = t("weekdays");
  wds.forEach((d, i) => { if (wdSpans[i]) wdSpans[i].textContent = d; });

  // Export
  setEl("export-title", t("exportTitle"));
  setEl("export-from-label", t("exportFrom"));
  setEl("export-to-label", t("exportTo"));

  // Right panel
  setEl("ai-plan-btn", t("aiPlanBtn"));
  setEl("mode-label", t("modeLabel"));
  const modeBtn = document.getElementById("mode-btn");
  if (modeBtn) modeBtn.textContent = state.isReorderMode ? t("modeAddBtn") : t("modeSortBtn");

  // Pool title
  setEl("pool-title", t("poolTitle"));

  // Input bar
  setEl("mic-select", null, null, t("micTitle"));
  setEl("manual-input", null, t("inputPlaceholder"));
  setEl("mic-btn", null, null, t("micBtnTitle"));
  setEl("manual-add-btn", t("addBtn"));

  // Wake button (only if not currently in wake mode)
  const wakeBtn = document.getElementById("wake-btn");
  if (wakeBtn) {
    wakeBtn.textContent = wakeDetector ? t("wakeBtnActive") : t("wakeBtn");
  }

  // Mic detecting option (before mic devices are populated)
  const sel = document.getElementById("mic-select");
  if (sel && sel.options.length === 1) {
    const opt = sel.options[0];
    if (opt.id === "mic-detecting-opt") opt.textContent = t("micDetecting");
  }

  // Update selected date label
  if (state && state.selectedDate) {
    const label = document.getElementById("selected-date-label");
    if (label && label.textContent !== "—") {
      label.textContent = friendlyDate(state.selectedDate);
    }
  }

  // Re-render dynamic content with new locale
  renderCalendar();
  if (state && state.items) renderTimeline(state.items);
  renderPool();
  setMicState("idle");
}

function setupLangToggle() {
  document.getElementById("lang-btn").addEventListener("click", () => {
    const next = getCurrentLang() === "zh" ? "en" : "zh";
    localStorage.setItem("lang", next);
    applyLocale();
  });
}

/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),      // 0-based
  selectedDate: formatDate(new Date()),
  items: [],
  poolItems: [],
  unscheduledItems: [],
  datesWithItems: new Set(),
  isReorderMode: false,
  isRecording: false,
  isProcessing: false,
  poolExpanded: false,
  pendingSchedule: null,   // AI-generated schedule awaiting apply
};

/* ── Timeline constants ────────────────────────────────────────────── */
const WORK_START  = 7 * 60;   // 07:00 in minutes
const WORK_END    = 22 * 60;  // 22:00 in minutes
const PX_PER_MIN  = 1.5;
const TOTAL_PX    = (WORK_END - WORK_START) * PX_PER_MIN;

/* ── Utilities ─────────────────────────────────────────────────────── */
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function friendlyDate(str) {
  const [y, m, d] = str.split("-");
  const tpl = t("friendlyDate");
  return tpl
    .replace("{y}", y)
    .replace("{m}", parseInt(m))
    .replace("{d}", parseInt(d));
}

function showToast(msg, isError = false, duration = 2500) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.toggle("error", isError);
  el.classList.add("show");
  clearTimeout(el._timer);
  const d = isError ? 8000 : duration;
  el._timer = setTimeout(() => el.classList.remove("show"), d);
}

function showError(msg) {
  const el = document.getElementById("transcript-preview");
  el.style.color = "var(--danger)";
  el.textContent = msg;
}

function timeToMinutes(ti) {
  if (!ti) return null;
  const [h, m] = ti.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

/* ── Calendar ──────────────────────────────────────────────────────── */
function renderCalendar() {
  const { year, month, selectedDate, datesWithItems } = state;
  const months = t("months");
  const calTpl = t("calTitle");
  document.getElementById("cal-title").textContent = calTpl
    .replace("{y}", year)
    .replace("{month}", months[month]);

  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  let startDow   = firstDay.getDay();

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1);
    grid.appendChild(makeDay(d, true));
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.appendChild(makeDay(new Date(year, month, d), false));
  }

  const total = startDow + lastDay.getDate();
  const remainder = total % 7;
  if (remainder !== 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      grid.appendChild(makeDay(new Date(year, month + 1, i), true));
    }
  }
}

function makeDay(date, otherMonth) {
  const str   = formatDate(date);
  const today = formatDate(new Date());
  const el    = document.createElement("div");
  el.className = "cal-day";
  el.textContent = date.getDate();
  if (otherMonth)                      el.classList.add("other-month");
  if (str === today)                   el.classList.add("today");
  if (str === state.selectedDate)      el.classList.add("selected");
  if (state.datesWithItems.has(str)) {
    const dot = document.createElement("span");
    dot.className = "dot";
    el.appendChild(dot);
  }
  if (!otherMonth) el.addEventListener("click", () => selectDate(str));
  return el;
}

async function selectDate(dateStr) {
  state.selectedDate = dateStr;
  document.getElementById("selected-date-label").textContent = friendlyDate(dateStr);
  renderCalendar();
  await Promise.all([loadItems(), loadPool()]);
  if (!state.poolExpanded) {
    state.poolExpanded = true;
    document.getElementById("pool-section").classList.add("expanded");
    document.getElementById("pool-toggle").textContent = "▲";
  }
}

/* ── Items & Timeline ─────────────────────────────────────────────── */
async function loadItems() {
  const res   = await fetch(`/api/items?date=${state.selectedDate}`);
  state.items = await res.json();
  renderTimeline(state.items);
}

async function loadDatesWithItems() {
  const res  = await fetch("/api/items/dates");
  const dates = await res.json();
  state.datesWithItems = new Set(dates);
  renderCalendar();
}

async function refreshAll() {
  await Promise.all([loadItems(), loadPool()]);
}

async function loadPool() {
  const [poolRes, unscheduledRes] = await Promise.all([
    fetch("/api/pool"),
    fetch("/api/items/unscheduled"),
  ]);
  state.poolItems       = await poolRes.json();
  state.unscheduledItems = await unscheduledRes.json();
  renderPool();
}

/* ── Overlap column layout ──────────────────────────────────────────── */
function assignColumns(tasks) {
  const sorted = [...tasks]
    .filter(t => timeToMinutes(t.start_time) != null)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const colEnds = [];
  const result  = new Map();

  sorted.forEach(item => {
    const start = timeToMinutes(item.start_time);
    const end   = start + (item.duration_min || 60);
    let col = colEnds.findIndex(e => e <= start);
    if (col === -1) col = colEnds.length;
    colEnds[col] = end;
    result.set(item.id, { col, totalCols: 0 });
  });

  sorted.forEach(item => {
    const start = timeToMinutes(item.start_time);
    const end   = start + (item.duration_min || 60);
    let maxCol  = result.get(item.id).col;
    sorted.forEach(other => {
      if (other.id === item.id) return;
      const oStart = timeToMinutes(other.start_time);
      const oEnd   = oStart + (other.duration_min || 60);
      if (oStart < end && oEnd > start) {
        maxCol = Math.max(maxCol, result.get(other.id).col);
      }
    });
    result.get(item.id).totalCols = maxCol + 1;
  });

  return result;
}

/* ── Timeline rendering ─────────────────────────────────────────────── */
function renderTimeline(items) {
  const axis   = document.getElementById("timeline-axis");
  const tracks = document.getElementById("timeline-tracks");
  axis.innerHTML   = "";
  tracks.innerHTML = "";

  axis.style.height   = TOTAL_PX + "px";
  tracks.style.height = TOTAL_PX + "px";

  for (let mins = WORK_START; mins <= WORK_END; mins += 30) {
    const top = (mins - WORK_START) * PX_PER_MIN;

    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = top + "px";
    label.textContent = minutesToTime(mins);
    axis.appendChild(label);

    const line = document.createElement("div");
    line.className = "timeline-gridline";
    line.style.top = top + "px";
    tracks.appendChild(line);
  }

  if (state.selectedDate === formatDate(new Date())) {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (nowMins >= WORK_START && nowMins <= WORK_END) {
      const top = (nowMins - WORK_START) * PX_PER_MIN;

      const nowLine = document.createElement("div");
      nowLine.id = "now-line";
      nowLine.style.top = top + "px";
      tracks.appendChild(nowLine);

      const nowDot = document.createElement("div");
      nowDot.id = "now-dot";
      nowDot.style.top = (top - 5) + "px";
      tracks.appendChild(nowDot);

      const nowLabel = document.createElement("div");
      nowLabel.id = "now-label";
      nowLabel.style.top = (top - 8) + "px";
      nowLabel.textContent = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      axis.appendChild(nowLabel);
    }
  }

  const scheduled = items.filter(it => it.start_time && it.status !== "suspended");
  const suspended = items.filter(it => it.start_time && it.status === "suspended");

  const colMap = assignColumns(scheduled);

  suspended.forEach(item => {
    const startMins = timeToMinutes(item.start_time);
    if (startMins == null) return;
    const top    = (startMins - WORK_START) * PX_PER_MIN;
    const height = Math.max((item.duration_min || 1) * PX_PER_MIN, 12);

    const block = document.createElement("div");
    block.className = "task-block suspended";
    block.style.top    = top + "px";
    block.style.height = height + "px";

    const endTime = minutesToTime(startMins + (item.duration_min || 1));
    block.innerHTML = `
      <div class="task-block-title">
        <span class="task-title-text">⏸ ${escapeHtml(item.content)}</span>
      </div>
      <div class="task-block-meta">
        <span class="task-time-label">${item.start_time} – ${endTime}</span>
        <span class="task-duration-badge">${item.duration_min || 1}${t("durationUnit")}</span>
      </div>
    `;
    tracks.appendChild(block);
  });

  scheduled.forEach(item => {
    const startMins = timeToMinutes(item.start_time);
    if (startMins == null) return;
    const top       = (startMins - WORK_START) * PX_PER_MIN;
    const height    = Math.max((item.duration_min || 60) * PX_PER_MIN, 24);

    const block = document.createElement("div");
    block.className = "task-block";
    block.dataset.id = item.id;
    block.dataset.dur = item.duration_min || 60;
    if (item.status === "completed") block.classList.add("completed");

    const layout = colMap.get(item.id) || { col: 0, totalCols: 1 };
    if (layout.totalCols > 1) {
      const pct = 100 / layout.totalCols;
      block.style.left  = `calc(${layout.col * pct}% + 2px)`;
      block.style.width = `calc(${pct}% - 4px)`;
      block.style.right = "auto";
    }

    block.style.top    = top + "px";
    block.style.height = height + "px";
    if (height < 90) block.classList.add("compact");

    const endTime = minutesToTime(startMins + (item.duration_min || 60));
    const statusIcon = item.status === "completed" ? "✓ " : "";
    const descHtml = item.description
      ? `<div class="task-block-desc">${escapeHtml(item.description)}</div>` : "";
    const taskNoHtml = item.task_no
      ? `<span class="task-no-badge">${escapeHtml(item.task_no)}</span>` : "";
    const pinnedHtml = item.pinned
      ? `<span class="task-pin-icon" title="${t("pinTitle")}">📌</span>` : "";

    block.innerHTML = `
      <div class="task-block-title">
        ${taskNoHtml}<span class="task-title-text">${statusIcon}${escapeHtml(item.content)}</span>${pinnedHtml}
      </div>
      ${descHtml}
      <div class="task-block-meta">
        <span class="task-time-label">${item.start_time} – ${endTime}</span>
        <span class="task-duration-badge" title="${t("durationEditTitle")}" data-id="${item.id}">${item.duration_min || 60}${t("durationUnit")}</span>
        ${item.parallel_reason ? `<span class="parallel-badge" title="${escapeHtml(item.parallel_reason)}">∥</span>` : ""}
      </div>
      ${item.status !== "completed" ? `
      <div class="task-actions">
        <button class="task-action-btn btn-complete" data-id="${item.id}">${t("taskComplete")}</button>
        <button class="task-action-btn btn-suspend"  data-id="${item.id}">${t("taskSuspend")}</button>
        <button class="task-action-btn btn-extend"   data-id="${item.id}">${t("taskExtend")}</button>
        <button class="task-action-btn btn-pin ${item.pinned ? "btn-pin-active" : ""}" data-id="${item.id}" title="${item.pinned ? t("unpinTitle") : t("pinLockTitle")}">📌</button>
        <button class="task-action-btn btn-delete"   data-id="${item.id}">${t("taskDelete")}</button>
      </div>` : `
      <div class="task-actions">
        <button class="task-action-btn btn-delete" data-id="${item.id}">${t("taskDelete")}</button>
      </div>`}
    `;

    initBlockDrag(block, item);
    initTitleEdit(block, item);
    initDurationEdit(block, item);
    initTimeEdit(block, item);
    initNoteEdit(block, item);
    tracks.appendChild(block);
  });

  tracks.querySelectorAll(".btn-complete").forEach(btn => {
    btn.addEventListener("click", () => completeItem(parseInt(btn.dataset.id)));
  });
  tracks.querySelectorAll(".btn-suspend").forEach(btn => {
    btn.addEventListener("click", () => suspendItem(parseInt(btn.dataset.id)));
  });
  tracks.querySelectorAll(".btn-extend").forEach(btn => {
    btn.addEventListener("click", () => showExtendDialog(parseInt(btn.dataset.id), btn));
  });
  tracks.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteItem(parseInt(btn.dataset.id)));
  });
  tracks.querySelectorAll(".btn-pin").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      const item = state.items.find(it => it.id === id);
      if (!item) return;
      const newPinned = item.pinned ? 0 : 1;
      await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: newPinned }),
      });
      await loadItems();
    });
  });

  const oldUnscheduled = document.querySelector(".unscheduled-section");
  if (oldUnscheduled) oldUnscheduled.remove();

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<span class="icon">📋</span>${t("emptyState")}`;
    tracks.appendChild(empty);
  }
}

/* ── Item actions ────────────────────────────────────────────────────── */
async function completeItem(id) {
  const res = await fetch(`/api/items/${id}/complete`, { method: "POST" });
  if (!res.ok) { showToast(t("toastOpFailed"), true); return; }
  await loadItems();
  showToast(t("toastCompleted"));
}

async function suspendItem(id) {
  const res = await fetch(`/api/items/${id}/suspend`, { method: "POST" });
  if (!res.ok) { showToast(t("toastSuspendFailed"), true); return; }
  await refreshAll();
  showToast(t("toastSuspended"));
}

async function deleteItem(id) {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  await Promise.all([refreshAll(), loadDatesWithItems()]);
}

/* ── Block drag (reschedule by dragging on timeline) ─────────────────── */
let _drag = null;

function initBlockDrag(block, item) {
  block.addEventListener("mousedown", e => {
    if (e.target.closest("button") || e.target.closest(".task-title-text")) return;
    if (item.pinned) return;
    e.preventDefault();
    const startMins = timeToMinutes(item.start_time);
    if (startMins == null) return;
    _drag = {
      id: item.id,
      block,
      startMins,
      mouseY: e.clientY,
      origTop: parseFloat(block.style.top),
      currentMins: startMins,
    };
    block.classList.add("dragging");
  });
}

document.addEventListener("mousemove", e => {
  if (!_drag) return;
  const dy = e.clientY - _drag.mouseY;
  const deltaMins = Math.round(dy / PX_PER_MIN / 15) * 15;
  const newMins = Math.max(WORK_START, Math.min(WORK_END - 15, _drag.startMins + deltaMins));
  _drag.currentMins = newMins;
  _drag.block.style.top = (_drag.origTop + (newMins - _drag.startMins) * PX_PER_MIN) + "px";
  const label = _drag.block.querySelector(".task-time-label");
  if (label) {
    const dur = parseInt(_drag.block.dataset.dur || 60);
    label.textContent = `${minutesToTime(newMins)} – ${minutesToTime(newMins + dur)} ✎`;
  }
});

document.addEventListener("mouseup", async () => {
  if (!_drag) return;
  const { id, block, startMins, currentMins } = _drag;
  _drag = null;
  block.classList.remove("dragging");
  if (currentMins !== startMins) {
    await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_time: minutesToTime(currentMins) }),
    });
    await loadItems();
  }
});

/* ── Inline title edit ───────────────────────────────────────────────── */
function initTitleEdit(block, item) {
  const span = block.querySelector(".task-title-text");
  if (!span) return;
  span.title = t("titleEditTitle");
  span.style.cursor = "text";

  span.addEventListener("dblclick", e => {
    e.stopPropagation();
    if (block.querySelector(".title-input")) return;
    const input = document.createElement("input");
    input.className = "title-input";
    input.value = item.content;
    span.replaceWith(input);
    input.focus();
    input.select();

    async function save() {
      const newContent = input.value.trim();
      if (newContent && newContent !== item.content) {
        await fetch(`/api/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });
        item.content = newContent;
      }
      const newSpan = document.createElement("span");
      newSpan.className = "task-title-text";
      newSpan.textContent = item.content;
      input.replaceWith(newSpan);
      initTitleEdit(block, item);
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { input.value = item.content; input.blur(); }
    });
  });
}

function initDurationEdit(block, item) {
  const badge = block.querySelector(".task-duration-badge");
  if (!badge) return;
  badge.style.cursor = "pointer";

  badge.addEventListener("click", e => {
    e.stopPropagation();
    if (block.querySelector(".duration-input")) return;

    const input = document.createElement("input");
    input.className = "duration-input";
    input.type = "number";
    input.min = 5;
    input.max = 480;
    input.step = 5;
    input.value = item.duration_min || 60;
    badge.replaceWith(input);
    input.focus();
    input.select();

    async function save() {
      const val = Math.max(5, Math.min(480, parseInt(input.value) || 60));
      if (val !== item.duration_min) {
        await fetch(`/api/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_min: val }),
        });
        item.duration_min = val;
        block.dataset.dur = val;
      }
      const newBadge = document.createElement("span");
      newBadge.className = "task-duration-badge";
      newBadge.title = t("durationEditTitle");
      newBadge.dataset.id = item.id;
      newBadge.textContent = `${item.duration_min}${t("durationUnit")}`;
      input.replaceWith(newBadge);

      const startMins = timeToMinutes(item.start_time);
      if (startMins != null) {
        const label = block.querySelector(".task-time-label");
        if (label) label.textContent = `${item.start_time} – ${minutesToTime(startMins + item.duration_min)}`;
        block.style.height = Math.max(item.duration_min * PX_PER_MIN, 24) + "px";
      }
      initDurationEdit(block, item);
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { input.value = item.duration_min; input.blur(); }
    });
  });
}

function initTimeEdit(block, item) {
  if (item.status === "completed" || item.status === "suspended" || item.pinned) return;
  const label = block.querySelector(".task-time-label");
  if (!label) return;
  label.title = t("timeEditTitle");
  label.style.cursor = "text";

  label.addEventListener("dblclick", e => {
    e.stopPropagation();
    if (block.querySelector(".time-edit-input")) return;

    const input = document.createElement("input");
    input.type = "time";
    input.className = "time-edit-input title-input";
    input.value = item.start_time || "09:00";
    label.replaceWith(input);
    input.focus();

    async function save() {
      const newTime = input.value;
      if (newTime && newTime !== item.start_time) {
        await fetch(`/api/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start_time: newTime }),
        });
      }
      await loadItems();
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { input.value = item.start_time; input.blur(); }
    });
  });
}

function initNoteEdit(block, item) {
  block.addEventListener("dblclick", e => {
    if (e.target.closest(".task-title-text, .task-action-btn, .task-duration-badge, .note-editor-panel")) return;
    e.stopPropagation();
    if (block.querySelector(".note-editor-panel")) return;

    const panel = document.createElement("div");
    panel.className = "note-editor-panel";
    panel.innerHTML = `
      <textarea class="note-editor-textarea" placeholder="${t("notePlaceholder")}" rows="3">${escapeHtml(item.description || "")}</textarea>
      <div class="note-editor-actions">
        <span class="note-editor-hint">${t("noteHint")}</span>
        <button class="task-action-btn note-save-btn">${t("noteSave")}</button>
        <button class="task-action-btn note-cancel-btn">${t("noteCancel")}</button>
      </div>
    `;
    block.appendChild(panel);
    const ta = panel.querySelector(".note-editor-textarea");
    ta.focus();

    async function save() {
      const newDesc = ta.value.trim();
      if (newDesc !== (item.description || "").trim()) {
        await fetch(`/api/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: newDesc }),
        });
        item.description = newDesc;
        let descEl = block.querySelector(".task-block-desc");
        if (newDesc) {
          if (!descEl) {
            descEl = document.createElement("div");
            descEl.className = "task-block-desc";
            block.querySelector(".task-block-title").after(descEl);
          }
          descEl.textContent = newDesc;
        } else if (descEl) {
          descEl.remove();
        }
      }
      panel.remove();
    }

    panel.querySelector(".note-save-btn").addEventListener("click", save);
    panel.querySelector(".note-cancel-btn").addEventListener("click", () => panel.remove());
    ta.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); save(); }
      if (e.key === "Escape") { e.preventDefault(); panel.remove(); }
    });
  });
}

function showExtendDialog(id, anchorBtn) {
  const existing = document.querySelector(".extend-dialog");
  if (existing) existing.remove();

  const dialog = document.createElement("div");
  dialog.className = "extend-dialog";
  dialog.innerHTML = `
    <span>${t("extendLabel")}</span>
    <input type="number" class="extend-input" value="30" min="5" max="480" step="5" />
    <span>${t("extendUnit")}</span>
    <button class="extend-confirm">${t("extendConfirm")}</button>
    <button class="extend-cancel">✕</button>
  `;

  anchorBtn.parentElement.appendChild(dialog);

  dialog.querySelector(".extend-cancel").addEventListener("click", () => dialog.remove());
  dialog.querySelector(".extend-confirm").addEventListener("click", async () => {
    const extra = parseInt(dialog.querySelector(".extend-input").value) || 30;
    dialog.remove();
    const res = await fetch(`/api/items/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extra_min: extra }),
    });
    if (!res.ok) { showToast(t("toastExtendFailed"), true); return; }
    await loadItems();
    showToast(t("toastExtended", { n: extra }));
  });
}

async function addItems(itemsPayload) {
  const byDate = {};
  for (const item of itemsPayload) {
    const d = item.date || state.selectedDate;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(item);
  }
  for (const [date, items] of Object.entries(byDate)) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, items }),
    });
    if (!res.ok) throw new Error("Failed to save items");
  }
  await Promise.all([refreshAll(), loadDatesWithItems()]);
}

async function saveReorder(orderedItems) {
  await fetch("/api/items/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: state.selectedDate, items: orderedItems }),
  });
  await loadItems();
}

/* ── Pool item inline title edit ────────────────────────────────────── */
function initPoolTitleEdit(el) {
  const span = el.querySelector(".pool-item-content");
  if (!span) return;
  span.title = t("titleEditTitle");
  span.style.cursor = "text";

  span.addEventListener("dblclick", e => {
    e.stopPropagation();
    if (el.querySelector(".pool-title-input")) return;
    const original = span.textContent;
    const input = document.createElement("input");
    input.className = "pool-title-input title-input";
    input.value = original;
    span.replaceWith(input);
    input.focus();
    input.select();

    async function save() {
      const newContent = input.value.trim() || original;
      if (newContent !== original) {
        const isPoolItem = !el.classList.contains("pool-item-work");
        const itemId = el.querySelector("[data-id]")?.dataset.id;
        if (itemId) {
          const url = isPoolItem ? `/api/pool/${itemId}` : `/api/items/${itemId}`;
          await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          });
        }
      }
      const newSpan = document.createElement("span");
      newSpan.className = "pool-item-content";
      newSpan.textContent = newContent;
      input.replaceWith(newSpan);
      initPoolTitleEdit(el);
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { input.value = original; input.blur(); }
    });
  });
}

/* ── Task Pool ─────────────────────────────────────────────────────── */
function renderPool() {
  const list        = document.getElementById("pool-list");
  const countEl     = document.getElementById("pool-count");
  const poolItems   = state.poolItems;
  const unscheduled = state.unscheduledItems;
  countEl.textContent = poolItems.length + unscheduled.length;

  list.innerHTML = "";
  if (!poolItems.length && !unscheduled.length) {
    list.innerHTML = `<div class="pool-empty">${t("poolEmpty")}</div>`;
    return;
  }

  unscheduled.forEach(item => {
    const el = document.createElement("div");
    el.className = "pool-item pool-item-work";
    el.innerHTML = `
      <div class="pool-item-main">
        <span class="pool-item-content">${escapeHtml(item.content)}</span>
        <span class="pool-item-duration">${item.duration_min || 60}${t("durationShort")}</span>
      </div>
      <div class="pool-item-actions">
        <button class="task-action-btn work-schedule-btn" data-id="${item.id}">${t("poolScheduleBtn")}</button>
        <button class="task-action-btn work-delete-btn"   data-id="${item.id}">✕</button>
      </div>
    `;
    list.appendChild(el);
  });

  poolItems.forEach(item => {
    const el = document.createElement("div");
    el.className = "pool-item";
    el.innerHTML = `
      <div class="pool-item-main">
        <span class="pool-item-content">${escapeHtml(item.content)}</span>
        <span class="pool-item-duration">${item.duration_min}${t("durationShort")}</span>
      </div>
      <div class="pool-item-actions">
        <button class="task-action-btn pool-schedule-btn" data-id="${item.id}">${t("poolScheduleBtn")}</button>
        <button class="task-action-btn pool-delete-btn"   data-id="${item.id}">✕</button>
      </div>
    `;
    list.appendChild(el);
  });

  list.querySelectorAll(".pool-item").forEach(el => initPoolTitleEdit(el));

  list.querySelectorAll(".work-schedule-btn").forEach(btn => {
    btn.addEventListener("click", () => scheduleWorkItem(parseInt(btn.dataset.id), btn));
  });
  list.querySelectorAll(".work-delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetch(`/api/items/${btn.dataset.id}`, { method: "DELETE" });
      await Promise.all([loadItems(), loadPool(), loadDatesWithItems()]);
    });
  });
  list.querySelectorAll(".pool-schedule-btn").forEach(btn => {
    btn.addEventListener("click", () => schedulePoolItem(parseInt(btn.dataset.id), btn));
  });
  list.querySelectorAll(".pool-delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetch(`/api/pool/${btn.dataset.id}`, { method: "DELETE" });
      await loadPool();
    });
  });
}

async function scheduleWorkItem(itemId, anchorBtn) {
  const existing = document.querySelector(".pool-schedule-dialog");
  if (existing) { existing.remove(); return; }

  const dialog = document.createElement("div");
  dialog.className = "pool-schedule-dialog";
  dialog.innerHTML = `
    <div class="psd-title">${t("scheduleTitle")}</div>
    <input class="psd-input" type="text" placeholder="${t("schedulePlaceholderWork")}" />
    <div class="psd-parsed hidden"></div>
    <div class="psd-actions">
      <button class="psd-parse-btn">${t("scheduleParse")}</button>
      <button class="psd-confirm-btn" disabled>${t("scheduleConfirm")}</button>
      <button class="psd-cancel-btn">✕</button>
    </div>
  `;
  anchorBtn.closest(".pool-item").appendChild(dialog);
  dialog.querySelector(".psd-input").focus();

  let parsedDate = state.selectedDate;
  let parsedTime = null;

  const parsedEl   = dialog.querySelector(".psd-parsed");
  const confirmBtn = dialog.querySelector(".psd-confirm-btn");
  const parseBtn   = dialog.querySelector(".psd-parse-btn");

  dialog.querySelector(".psd-cancel-btn").addEventListener("click", () => dialog.remove());

  async function parse() {
    const text = dialog.querySelector(".psd-input").value.trim();
    if (!text) {
      parsedDate = state.selectedDate;
      parsedTime = null;
      parsedEl.textContent = t("unscheduledLabel", { date: parsedDate });
      parsedEl.classList.remove("hidden");
      confirmBtn.disabled = false;
      return;
    }
    parseBtn.disabled = true;
    parseBtn.textContent = "…";
    try {
      const res  = await fetch("/api/pool/parse-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context_date: state.selectedDate, lang: getCurrentLang() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      parsedDate = data.date;
      parsedTime = data.start_time;
      parsedEl.textContent = parsedTime
        ? t("parseResult", { date: parsedDate, time: parsedTime })
        : t("parseResultNoTime", { date: parsedDate });
      parsedEl.classList.remove("hidden");
      confirmBtn.disabled = false;
    } catch (e) {
      parsedEl.textContent = t("parseFailed", { msg: e.message });
      parsedEl.classList.remove("hidden");
    } finally {
      parseBtn.disabled = false;
      parseBtn.textContent = t("scheduleParse");
    }
  }

  parseBtn.addEventListener("click", parse);
  dialog.querySelector(".psd-input").addEventListener("keydown", e => {
    if (e.key === "Enter") parse();
  });

  confirmBtn.addEventListener("click", async () => {
    dialog.remove();
    const body = { start_time: parsedTime, date: parsedDate };
    const res = await fetch(`/api/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { showToast(t("toastScheduleFailed"), true); return; }
    await Promise.all([refreshAll(), loadDatesWithItems()]);
    showToast(parsedTime
      ? t("toastScheduled", { date: parsedDate, time: parsedTime })
      : t("toastUnscheduled"));
  });
}

async function schedulePoolItem(poolId, anchorBtn) {
  const existing = document.querySelector(".pool-schedule-dialog");
  if (existing) { existing.remove(); return; }

  const dialog = document.createElement("div");
  dialog.className = "pool-schedule-dialog";
  dialog.innerHTML = `
    <div class="psd-title">${t("scheduleTitle")}</div>
    <input class="psd-input" type="text" placeholder="${t("schedulePlaceholderPool", { date: state.selectedDate })}" />
    <div class="psd-parsed hidden"></div>
    <div class="psd-actions">
      <button class="psd-parse-btn">${t("scheduleParse")}</button>
      <button class="psd-confirm-btn" disabled>${t("scheduleConfirm")}</button>
      <button class="psd-cancel-btn">✕</button>
    </div>
  `;
  anchorBtn.closest(".pool-item").appendChild(dialog);
  dialog.querySelector(".psd-input").focus();

  let parsedDate = state.selectedDate;
  let parsedTime = null;

  const parsedEl  = dialog.querySelector(".psd-parsed");
  const confirmBtn = dialog.querySelector(".psd-confirm-btn");
  const parseBtn   = dialog.querySelector(".psd-parse-btn");

  dialog.querySelector(".psd-cancel-btn").addEventListener("click", () => dialog.remove());

  async function parse() {
    const text = dialog.querySelector(".psd-input").value.trim();
    if (!text) {
      parsedDate = state.selectedDate;
      parsedTime = null;
      parsedEl.textContent = t("unscheduledAddLabel", { date: parsedDate });
      parsedEl.classList.remove("hidden");
      confirmBtn.disabled = false;
      return;
    }
    parseBtn.disabled = true;
    parseBtn.textContent = "…";
    try {
      const res  = await fetch("/api/pool/parse-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context_date: state.selectedDate, lang: getCurrentLang() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      parsedDate = data.date;
      parsedTime = data.start_time;
      parsedEl.textContent = parsedTime
        ? t("parseResult", { date: parsedDate, time: parsedTime })
        : t("parseResultNoTime", { date: parsedDate });
      parsedEl.classList.remove("hidden");
      confirmBtn.disabled = false;
    } catch (e) {
      parsedEl.textContent = t("parseFailed", { msg: e.message });
      parsedEl.classList.remove("hidden");
    } finally {
      parseBtn.disabled = false;
      parseBtn.textContent = t("scheduleParse");
    }
  }

  parseBtn.addEventListener("click", parse);
  dialog.querySelector(".psd-input").addEventListener("keydown", e => {
    if (e.key === "Enter") parse();
  });

  confirmBtn.addEventListener("click", async () => {
    dialog.remove();
    const res = await fetch(`/api/pool/${poolId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: parsedDate, start_time: parsedTime }),
    });
    if (!res.ok) { showToast(t("toastScheduleFailed"), true); return; }
    await Promise.all([refreshAll(), loadDatesWithItems()]);
    showToast(parsedTime
      ? t("toastScheduled", { date: parsedDate, time: parsedTime })
      : t("toastMovedToPool"));
  });
}

/* ── CSV Export ──────────────────────────────────────────────────────── */
function setupExport() {
  const today = formatDate(new Date());
  const firstOfMonth = today.slice(0, 8) + "01";
  document.getElementById("export-from").value = firstOfMonth;
  document.getElementById("export-to").value   = today;

  function getDateRange() {
    const from = document.getElementById("export-from").value;
    const to   = document.getElementById("export-to").value;
    if (!from || !to) { showToast(t("toastSelectDates"), true); return null; }
    if (from > to)    { showToast(t("toastDateRangeError"), true); return null; }
    return { from, to };
  }

  document.getElementById("export-csv-btn").addEventListener("click", () => {
    const r = getDateRange();
    if (r) window.location.href = `/api/export/csv?from=${r.from}&to=${r.to}`;
  });

  document.getElementById("export-ics-btn").addEventListener("click", () => {
    const r = getDateRange();
    if (r) window.location.href = `/api/export/ics?from=${r.from}&to=${r.to}`;
  });
}

/* ── Theme toggle ────────────────────────────────────────────────────── */
function setupThemeToggle() {
  const btn = document.getElementById("theme-btn");
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.dataset.theme = "light";
    document.getElementById("theme-btn").textContent = "☀️";
  } else {
    delete document.documentElement.dataset.theme;
    document.getElementById("theme-btn").textContent = "🌙";
  }
}

function setupPoolToggle() {
  document.getElementById("pool-header").addEventListener("click", () => {
    state.poolExpanded = !state.poolExpanded;
    const section = document.getElementById("pool-section");
    const btn     = document.getElementById("pool-toggle");
    section.classList.toggle("expanded", state.poolExpanded);
    btn.textContent = state.poolExpanded ? "▲" : "▼";
  });
}

/* ── AI Planning ─────────────────────────────────────────────────────── */
function setupAIPlan() {
  document.getElementById("ai-plan-btn").addEventListener("click", openAIPlanModal);
  document.getElementById("ai-plan-close").addEventListener("click", closeAIPlanModal);
  document.getElementById("ai-plan-cancel").addEventListener("click", closeAIPlanModal);
  document.getElementById("ai-plan-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("ai-plan-overlay")) closeAIPlanModal();
  });
  document.getElementById("ai-plan-apply").addEventListener("click", applyAIPlan);
}

function closeAIPlanModal() {
  document.getElementById("ai-plan-overlay").classList.add("hidden");
  state.pendingSchedule = null;
}

async function openAIPlanModal() {
  if (!state.selectedDate) { showToast(t("toastNoDate"), true); return; }
  const overlay = document.getElementById("ai-plan-overlay");
  const loading = document.getElementById("ai-plan-loading");
  const planList = document.getElementById("ai-plan-list");
  const footer   = document.getElementById("ai-plan-footer");

  overlay.classList.remove("hidden");
  loading.textContent = t("aiPlanLoading");
  loading.classList.remove("hidden");
  planList.classList.add("hidden");
  footer.classList.add("hidden");
  planList.innerHTML = "";
  state.pendingSchedule = null;

  try {
    const res = await fetch("/api/schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: state.selectedDate,
        work_start: "09:00",
        work_end: "18:00",
        lang: getCurrentLang(),
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || t("errGenerate"));

    state.pendingSchedule = data.schedule;
    loading.classList.add("hidden");
    renderAIPlanPreview(data.schedule, planList);
    planList.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (e) {
    loading.textContent = `${t("errGenerate")}：${e.message}`;
  }
}

function renderAIPlanPreview(schedule, container) {
  container.innerHTML = "";
  schedule.forEach(entry => {
    const row = document.createElement("div");
    row.className = "ai-plan-row";
    const parallelInfo = entry.parallel_group != null
      ? `<span class="parallel-badge" title="${escapeHtml(entry.parallel_reason || "")}">∥ ${escapeHtml(entry.parallel_reason || "")}</span>`
      : "";
    row.innerHTML = `
      <span class="ai-plan-time">${entry.start_time || "—"}</span>
      <span class="ai-plan-content">${escapeHtml(entry.content)}</span>
      <span class="ai-plan-duration">${entry.duration_min}${t("durationShort")}</span>
      ${parallelInfo}
    `;
    container.appendChild(row);
  });
}

async function applyAIPlan() {
  if (!state.pendingSchedule) return;
  const res = await fetch("/api/schedule/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: state.selectedDate,
      schedule: state.pendingSchedule,
    }),
  });
  if (!res.ok) { showToast(t("toastAIPlanFailed"), true); return; }
  closeAIPlanModal();
  await Promise.all([refreshAll(), loadDatesWithItems()]);
  showToast(t("toastAIPlanApplied"));
}

/* ── Drag & Drop (unscheduled only) ────────────────────────────────── */
let dragSrc = null;

/* ── Drop unscheduled item onto timeline ─────────────────────────────── */
function setupTimelineDrop() {
  const tracks = document.getElementById("timeline-tracks");

  tracks.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    tracks.classList.add("drop-active");
    const rect = tracks.getBoundingClientRect();
    const rawMins = WORK_START + (e.clientY - rect.top) / PX_PER_MIN;
    const snapped = Math.max(WORK_START, Math.min(WORK_END - 15, Math.round(rawMins / 15) * 15));
    showDropIndicator(snapped);
  });

  tracks.addEventListener("dragleave", e => {
    if (!tracks.contains(e.relatedTarget)) {
      tracks.classList.remove("drop-active");
      removeDropIndicator();
    }
  });

  tracks.addEventListener("drop", async e => {
    e.preventDefault();
    e.stopPropagation();
    tracks.classList.remove("drop-active");
    const id = parseInt(e.dataTransfer.getData("text/plain"));
    if (!id) return;
    const rect = tracks.getBoundingClientRect();
    const rawMins = WORK_START + (e.clientY - rect.top) / PX_PER_MIN;
    const snapped = Math.max(WORK_START, Math.min(WORK_END - 15, Math.round(rawMins / 15) * 15));
    removeDropIndicator();
    await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_time: minutesToTime(snapped) }),
    });
    await loadItems();
    showToast(t("toastDropScheduled", { time: minutesToTime(snapped) }));
  });
}

function showDropIndicator(mins) {
  let line = document.getElementById("drop-indicator");
  if (!line) {
    line = document.createElement("div");
    line.id = "drop-indicator";
    document.getElementById("timeline-tracks").appendChild(line);
  }
  line.style.top = ((mins - WORK_START) * PX_PER_MIN) + "px";
  line.dataset.time = minutesToTime(mins);
}

function removeDropIndicator() {
  const el = document.getElementById("drop-indicator");
  if (el) el.remove();
}

function setupDragDrop(list) {
  const items = list.querySelectorAll(".work-item");
  items.forEach(item => {
    item.addEventListener("dragstart", onDragStart);
    item.addEventListener("dragover",  onDragOver);
    item.addEventListener("drop",      onDrop);
    item.addEventListener("dragend",   onDragEnd);
    item.addEventListener("dragleave", onDragLeave);
  });
}

function onDragStart(e) {
  dragSrc = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.id);
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (this !== dragSrc) this.classList.add("drag-over");
  return false;
}

function onDragLeave() { this.classList.remove("drag-over"); }

async function onDrop(e) {
  e.stopPropagation();
  if (dragSrc === this) return;
  const list    = this.closest("ul");
  if (!list) return;
  const items   = [...list.querySelectorAll(".work-item")];
  const srcIdx  = items.indexOf(dragSrc);
  const tgtIdx  = items.indexOf(this);
  if (srcIdx === -1 || tgtIdx === -1) return;

  const unscheduled = state.items.filter(i => !i.start_time && i.status !== "suspended");
  const reordered   = [...unscheduled];
  const [moved]     = reordered.splice(srcIdx, 1);
  reordered.splice(tgtIdx, 0, moved);

  await saveReorder(reordered.map(i => ({ id: i.id, content: i.content })));
}

function onDragEnd() {
  document.querySelectorAll(".work-item").forEach(el => {
    el.classList.remove("dragging", "drag-over");
  });
  dragSrc = null;
}

/* ── Voice (MediaRecorder → Whisper → Gemini) ──────────────────────── */
let mediaRecorder = null;
let audioChunks   = [];
let levelAnimId   = null;
let levelStream   = null;

const WAKE_WORD       = "志翔";
const END_WORD        = "完毕";
const SPEAK_THRESHOLD = 12;
const MAX_CLIP_MS     = 5000;

function createWordDetector(word, onDetected) {
  let active = false;
  let stream = null;
  let audioCtx = null;
  let recorder = null;
  let chunks = [];
  let speaking = false;
  let checkPending = false;
  let monitorId = null;
  let silTimer = null;

  async function start() {
    if (active) return;
    active = true;
    const deviceId    = document.getElementById("mic-select").value;
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
    try {
      stream   = await navigator.mediaDevices.getUserMedia(constraints);
      audioCtx = new AudioContext();
      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      function monitor() {
        if (!active) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > SPEAK_THRESHOLD && !speaking && !checkPending) {
          speaking = true;
          startClip();
        }
        if (speaking && recorder && recorder.state === "recording") {
          if (avg <= SPEAK_THRESHOLD) {
            if (!silTimer) silTimer = setTimeout(() => {
              if (recorder && recorder.state === "recording") recorder.stop();
            }, 700);
          } else { clearTimeout(silTimer); silTimer = null; }
        }
        monitorId = requestAnimationFrame(monitor);
      }
      monitor();
    } catch (e) {
      active = false;
      throw e;
    }
  }

  function stop() {
    active = false;
    if (monitorId) { cancelAnimationFrame(monitorId); monitorId = null; }
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (stream) { stream.getTracks().forEach(tk => tk.stop()); stream = null; }
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    clearTimeout(silTimer); silTimer = null;
    speaking = false; checkPending = false;
  }

  function startClip() {
    chunks   = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = processClip;
    recorder.start();
    setTimeout(() => { if (recorder && recorder.state === "recording") recorder.stop(); }, MAX_CLIP_MS);
  }

  async function processClip() {
    speaking = false;
    clearTimeout(silTimer); silTimer = null;
    if (!active) return;
    checkPending = true;
    const mimeType = (recorder && recorder.mimeType) || "audio/webm";
    const blob     = new Blob(chunks, { type: mimeType });
    if (blob.size < 500) { checkPending = false; return; }
    try {
      const form = new FormData();
      form.append("audio", blob, "detect.webm");
      form.append("mime_type", mimeType);
      form.append("wake_word", word);
      const res  = await fetch("/api/voice/wake", { method: "POST", body: form });
      const data = await res.json();
      if (data.detected && active) { stop(); onDetected(); }
    } catch (e) { /* keep listening */ }
    finally { checkPending = false; }
  }

  return { start, stop };
}

let wakeDetector = null;
let endDetector  = null;

async function startWakeListening() {
  if (state.isRecording || state.isProcessing) return;
  wakeDetector = createWordDetector(WAKE_WORD, onWakeDetected);
  try {
    await wakeDetector.start();
    startLevelMeter();
    updateWakeUI(true);
  } catch (e) {
    showToast(t("toastWakeFailed", { msg: e.message }), true);
    wakeDetector = null;
    updateWakeUI(false);
  }
}

function stopWakeListening() {
  if (wakeDetector) { wakeDetector.stop(); wakeDetector = null; }
  stopLevelMeter();
  updateWakeUI(false);
}

async function onWakeDetected() {
  showToast(t("toastWakeDetected", { word: END_WORD }));
  setMicState("recording");
  document.getElementById("transcript-preview").textContent = "";
  document.getElementById("wake-word-label").textContent = t("wakeLabelRecording", { word: END_WORD });

  const deviceId    = document.getElementById("mic-select").value;
  const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
  const stream      = await navigator.mediaDevices.getUserMedia(constraints);
  audioChunks  = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
  mediaRecorder.start();

  endDetector = createWordDetector(END_WORD, async () => {
    endDetector = null;
    await stopRecording();
    startWakeListening();
  });
  try { await endDetector.start(); } catch (e) { /* fallback to silence */ }

  const ctx      = new AudioContext();
  const src      = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  src.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let silTimer = null;
  function watchSilence() {
    if (!state.isRecording) { ctx.close(); return; }
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    if (avg <= SPEAK_THRESHOLD) {
      if (!silTimer) silTimer = setTimeout(async () => {
        ctx.close();
        if (endDetector) { endDetector.stop(); endDetector = null; }
        await stopRecording();
        startWakeListening();
      }, 8000);
    } else { clearTimeout(silTimer); silTimer = null; }
    requestAnimationFrame(watchSilence);
  }
  watchSilence();
}

function updateWakeUI(active) {
  const btn = document.getElementById("wake-btn");
  if (!btn) return;
  btn.textContent = active ? t("wakeBtnActive") : t("wakeBtn");
  btn.classList.toggle("wake-active", active);
  if (!active) {
    document.getElementById("wake-word-label").textContent = "";
  } else if (!state.isRecording) {
    document.getElementById("wake-word-label").textContent = t("wakeLabelListening", { word: WAKE_WORD });
  }
}

async function checkMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(tk => tk.stop());
    return true;
  } catch (err) {
    const statusEl = document.getElementById("voice-status");
    const btn      = document.getElementById("mic-btn");
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      statusEl.innerHTML = t("micPermDenied");
    } else if (err.name === "NotFoundError") {
      statusEl.textContent = t("micNotFound");
    } else {
      statusEl.textContent = t("micInitFailed", { msg: err.message });
    }
    statusEl.style.color = "var(--danger)";
    btn.disabled = true;
    return false;
  }
}

async function populateMicDevices() {
  const sel = document.getElementById("mic-select");
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics    = devices.filter(d => d.kind === "audioinput");
    sel.innerHTML = "";
    mics.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label || t("micDeviceDefault", { n: i + 1 });
      if (d.label.toLowerCase().includes("built-in") || d.label.includes("内置") || d.label.includes("MacBook")) {
        opt.selected = true;
      }
      sel.appendChild(opt);
    });
    if (!mics.length) sel.innerHTML = `<option>${t("micDeviceNone")}</option>`;
  } catch (e) {
    sel.innerHTML = `<option>${t("micDeviceListFailed")}</option>`;
  }
}

async function startLevelMeter() {
  stopLevelMeter();
  const deviceId = document.getElementById("mic-select").value;
  try {
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
    levelStream = await navigator.mediaDevices.getUserMedia(constraints);
    const ctx      = new AudioContext();
    const source   = ctx.createMediaStreamSource(levelStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const bar  = document.getElementById("mic-level-bar");
    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      bar.style.width      = Math.min(100, avg * 2.5) + "%";
      bar.style.background = avg > 20 ? "var(--accent)" : "var(--border)";
      levelAnimId = requestAnimationFrame(tick);
    }
    tick();
  } catch (e) {
    showToast(t("toastDeviceError", { msg: e.message }), true);
  }
}

function stopLevelMeter() {
  if (levelAnimId) { cancelAnimationFrame(levelAnimId); levelAnimId = null; }
  if (levelStream) { levelStream.getTracks().forEach(tk => tk.stop()); levelStream = null; }
  const bar = document.getElementById("mic-level-bar");
  if (bar) bar.style.width = "0%";
}

function setMicState(s) {
  const btn      = document.getElementById("mic-btn");
  const statusEl = document.getElementById("voice-status");
  state.isRecording  = s === "recording";
  state.isProcessing = s === "processing";

  btn.classList.toggle("recording",  s === "recording");
  btn.classList.toggle("processing", s === "processing");
  btn.disabled = s === "processing";
  document.getElementById("mic-select").disabled = s !== "idle";

  if (s === "recording") {
    statusEl.className   = "recording";
    statusEl.textContent = state.isReorderMode ? t("statusRecordingReorder") : t("statusRecording");
  } else if (s === "transcribing") {
    statusEl.className   = "processing";
    statusEl.textContent = t("statusTranscribing");
  } else if (s === "processing") {
    statusEl.className   = "processing";
    statusEl.textContent = t("statusProcessing");
  } else {
    statusEl.className   = "";
    statusEl.textContent = state.isReorderMode ? t("statusIdleReorder") : t("statusIdle");
  }
}

async function startRecording() {
  if (state.isProcessing || state.isRecording) return;
  const deviceId = document.getElementById("mic-select").value;
  try {
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
    const stream      = await navigator.mediaDevices.getUserMedia(constraints);
    audioChunks   = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.start();
    setMicState("recording");
    document.getElementById("transcript-preview").textContent = "";
  } catch (err) {
    showToast(t("toastMicError", { msg: err.message }), true);
  }
}

async function stopRecording() {
  if (!state.isRecording || !mediaRecorder) return;

  await new Promise(resolve => {
    mediaRecorder.onstop = resolve;
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(tk => tk.stop());
  });

  const mimeType = mediaRecorder.mimeType || "audio/webm";
  const blob     = new Blob(audioChunks, { type: mimeType });

  if (blob.size < 1000) {
    setMicState("idle");
    showToast(t("toastShortRecording"), true);
    return;
  }

  setMicState("transcribing");
  let transcript = "";
  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("mime_type", mimeType);
    const res  = await fetch("/api/voice/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || t("errAIProcess"));
    transcript = data.transcript;
    const el   = document.getElementById("transcript-preview");
    el.style.color = "";
    el.textContent = transcript ? `"${transcript}"` : "";
  } catch (err) {
    setMicState("idle");
    showError(t("errTranscribe", { msg: err.message }));
    return;
  }

  if (!transcript) {
    setMicState("idle");
    showToast(t("toastNoSpeech"), true);
    return;
  }

  setMicState("processing");
  try {
    if (state.isReorderMode) {
      await processReorderCommand(transcript);
    } else {
      await processAddCommand(transcript);
    }
  } catch (err) {
    showError(t("errGeneral", { msg: err.message }));
  } finally {
    setMicState("idle");
  }
}

/* ── Manual text input ───────────────────────────────────────────────── */
function setupManualInput() {
  const input = document.getElementById("manual-input");
  const btn   = document.getElementById("manual-add-btn");

  async function submit() {
    const text = input.value.trim();
    if (!text) return;
    btn.disabled = true;
    btn.textContent = "…";
    try {
      await processAddCommand(text);
      input.value = "";
      input.style.height = "auto";
    } catch {
      // error already shown by processAddCommand
    } finally {
      btn.disabled = false;
      btn.textContent = t("addBtn");
    }
  }

  btn.addEventListener("click", submit);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); submit(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  });
}

async function processAddCommand(transcript) {
  const res  = await fetch("/api/voice/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, date: state.selectedDate, lang: getCurrentLang() }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(t("errGeneral", { msg: data.error || t("errAIProcess") }));
    throw new Error(data.error || t("errAIProcess"));
  }
  if (!data.items || !data.items.length) { showToast(t("toastNoItems")); return; }
  await addItems(data.items);

  const item     = data.items[0];
  const taskDate = item.date || state.selectedDate;
  if (taskDate !== state.selectedDate) {
    showToast(t("toastAddedTo", { date: friendlyDate(taskDate) }));
  } else {
    showToast(t("toastAdded"));
  }
}

async function processReorderCommand(transcript) {
  if (!state.items.length) { showToast(t("toastNoReorder"), true); return; }
  const res  = await fetch("/api/voice/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: transcript,
      items: state.items.map(i => ({ id: i.id, content: i.content })),
      lang: getCurrentLang(),
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(t("errGeneral", { msg: data.error || t("errReorder") }));
    throw new Error(data.error || t("errReorder"));
  }
  await saveReorder(data.items);
  showToast(t("toastReordered"));
}

/* ── Wake word settings panel ──────────────────────────────────────── */
const SAMPLE_TARGET = 5;
let sampleRecorder  = null;
let sampleChunks    = [];

async function loadSampleState() {
  const res  = await fetch("/api/wake/samples");
  const data = await res.json();
  renderSampleDots(data.count);
  const label = document.getElementById("sample-count-label");
  label.textContent = `${data.count} / ${SAMPLE_TARGET}`;
  const btn   = document.getElementById("sample-record-btn");
  if (data.count >= SAMPLE_TARGET) {
    btn.textContent = t("sampleEnough");
    document.getElementById("sample-status").textContent =
      t("sampleEnabled", { val: data.threshold?.toFixed(2) ?? "—" });
    document.getElementById("sample-status").style.color = "var(--accent)";
  } else {
    btn.textContent = t("sampleRecordBtn");
    document.getElementById("sample-status").textContent =
      t("sampleNeeded", { n: SAMPLE_TARGET - data.count });
    document.getElementById("sample-status").style.color = "";
  }
}

function renderSampleDots(count) {
  const container = document.getElementById("sample-dots");
  container.innerHTML = "";
  for (let i = 0; i < SAMPLE_TARGET; i++) {
    const dot = document.createElement("div");
    dot.className = "sample-dot" + (i < count ? " filled" : "");
    container.appendChild(dot);
  }
}

function setupSettingsPanel() {
  document.getElementById("settings-btn").addEventListener("click", async () => {
    document.getElementById("settings-overlay").classList.remove("hidden");
    await loadLLMSettings();
    await loadSampleState();
  });
  document.getElementById("settings-close").addEventListener("click", () => {
    document.getElementById("settings-overlay").classList.add("hidden");
  });
  document.getElementById("settings-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("settings-overlay"))
      document.getElementById("settings-overlay").classList.add("hidden");
  });

  const recordBtn = document.getElementById("sample-record-btn");
  recordBtn.addEventListener("mousedown", startSampleRecording);
  recordBtn.addEventListener("mouseup",   stopSampleRecording);
  recordBtn.addEventListener("mouseleave", () => { if (sampleRecorder) stopSampleRecording(); });
  recordBtn.addEventListener("touchstart", e => { e.preventDefault(); startSampleRecording(); }, { passive: false });
  recordBtn.addEventListener("touchend",   e => { e.preventDefault(); stopSampleRecording(); }, { passive: false });

  document.getElementById("sample-clear-btn").addEventListener("click", async () => {
    if (!confirm(t("confirmClearSamples"))) return;
    await fetch("/api/wake/samples", { method: "DELETE" });
    await loadSampleState();
    showToast(t("toastSampleCleared"));
  });
}

async function startSampleRecording() {
  if (sampleRecorder) return;
  const deviceId    = document.getElementById("mic-select").value;
  const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
  try {
    const stream  = await navigator.mediaDevices.getUserMedia(constraints);
    sampleChunks  = [];
    sampleRecorder = new MediaRecorder(stream);
    sampleRecorder.ondataavailable = e => { if (e.data.size > 0) sampleChunks.push(e.data); };
    sampleRecorder.start();
    document.getElementById("sample-record-btn").classList.add("recording");
    document.getElementById("sample-record-btn").textContent = t("sampleRecording");
    document.getElementById("sample-status").textContent     = t("sampleSpeakPrompt");
    document.getElementById("sample-status").style.color     = "var(--danger)";
  } catch (e) {
    showToast(t("toastMicError", { msg: e.message }), true);
  }
}

async function stopSampleRecording() {
  if (!sampleRecorder) return;
  const btn = document.getElementById("sample-record-btn");
  btn.classList.remove("recording");
  btn.disabled = true;

  await new Promise(resolve => {
    sampleRecorder.onstop = resolve;
    sampleRecorder.stop();
    sampleRecorder.stream.getTracks().forEach(tk => tk.stop());
  });
  sampleRecorder = null;

  const mimeType = "audio/webm";
  const blob     = new Blob(sampleChunks, { type: mimeType });
  if (blob.size < 500) {
    document.getElementById("sample-status").textContent = t("sampleTooShort");
    btn.disabled    = false;
    btn.textContent = t("sampleRecordBtn");
    return;
  }

  document.getElementById("sample-status").textContent = t("sampleSaving");
  const form = new FormData();
  form.append("audio", blob, "sample.webm");
  form.append("mime_type", mimeType);
  const res  = await fetch("/api/wake/samples", { method: "POST", body: form });
  const data = await res.json();
  btn.disabled = false;
  if (data.error) {
    document.getElementById("sample-status").textContent = t("sampleError", { msg: data.error });
  } else {
    await loadSampleState();
  }
}

/* ── LLM settings ────────────────────────────────────────────────────── */
async function loadLLMSettings() {
  const { provider } = await (await fetch("/api/settings/llm", { cache: "no-store" })).json();

  document.getElementById("llm-btn-gemini").classList.toggle("active", provider === "gemini");
  document.getElementById("llm-btn-deepseek").classList.toggle("active", provider === "deepseek");

  document.getElementById("gemini-key-section").classList.toggle("hidden", provider !== "gemini");
  document.getElementById("deepseek-key-section").classList.toggle("hidden", provider !== "deepseek");

  await loadKeySection("gemini",   "/api/settings/apikey");
  await loadKeySection("deepseek", "/api/settings/deepseek_apikey");

  for (const p of ["gemini", "deepseek"]) {
    const btn = document.getElementById(`llm-btn-${p}`);
    btn.replaceWith(btn.cloneNode(true));
    document.getElementById(`llm-btn-${p}`).addEventListener("click", async () => {
      await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: p }),
      });
      await loadLLMSettings();
    });
  }
}

async function loadKeySection(provider, endpoint) {
  const res  = await fetch(endpoint, { cache: "no-store" });
  const data = await res.json();
  const configuredEl = document.getElementById(`${provider}-configured`);
  const formEl       = document.getElementById(`${provider}-form`);
  const msgEl        = document.getElementById(`${provider}-msg`);

  configuredEl.classList.toggle("hidden", !data.configured);
  formEl.classList.toggle("hidden", data.configured);
  msgEl.textContent = "";

  const deleteBtn = document.getElementById(`${provider}-delete-btn`);
  const saveBtn   = document.getElementById(`${provider}-save-btn`);
  const inputEl   = document.getElementById(`${provider}-input`);
  deleteBtn.replaceWith(deleteBtn.cloneNode(true));
  saveBtn.replaceWith(saveBtn.cloneNode(true));

  document.getElementById(`${provider}-delete-btn`).addEventListener("click", async () => {
    if (!confirm(t("confirmDeleteKey"))) return;
    await fetch(endpoint, { method: "DELETE" });
    await loadKeySection(provider, endpoint);
  });

  async function saveKey() {
    const key = document.getElementById(`${provider}-input`).value.trim();
    if (!key) return;
    const r    = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const d   = await r.json();
    const msg = document.getElementById(`${provider}-msg`);
    if (!r.ok) {
      msg.textContent = d.error || t("toastSaveFailed");
      msg.style.color = "var(--danger)";
    } else {
      document.getElementById(`${provider}-input`).value = "";
      await loadKeySection(provider, endpoint);
    }
  }

  document.getElementById(`${provider}-save-btn`).addEventListener("click", saveKey);
  inputEl.addEventListener("keydown", e => { if (e.key === "Enter") saveKey(); });
}

/* ── Mode toggle ───────────────────────────────────────────────────── */
function setupModeToggle() {
  const btn = document.getElementById("mode-btn");
  btn.addEventListener("click", () => {
    state.isReorderMode = !state.isReorderMode;
    btn.textContent = state.isReorderMode ? t("modeAddBtn") : t("modeSortBtn");
    btn.classList.toggle("reorder-active", state.isReorderMode);
    setMicState("idle");
    document.getElementById("transcript-preview").textContent = "";
  });
}

/* ── Mic button events ─────────────────────────────────────────────── */
function setupMicButton() {
  const btn = document.getElementById("mic-btn");
  btn.addEventListener("touchstart", e => { e.preventDefault(); startRecording(); }, { passive: false });
  btn.addEventListener("touchend",   e => { e.preventDefault(); stopRecording(); }, { passive: false });
  btn.addEventListener("mousedown",  () => startRecording());
  btn.addEventListener("mouseup",    () => stopRecording());
  btn.addEventListener("mouseleave", () => { if (state.isRecording) stopRecording(); });
}

/* ── Calendar navigation ───────────────────────────────────────────── */
function setupCalNav() {
  document.getElementById("cal-prev").addEventListener("click", () => {
    state.month--;
    if (state.month < 0) { state.month = 11; state.year--; }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    state.month++;
    if (state.month > 11) { state.month = 0; state.year++; }
    renderCalendar();
  });
}

/* ── Init ──────────────────────────────────────────────────────────── */
async function init() {
  document.getElementById("selected-date-label").textContent = friendlyDate(state.selectedDate);
  setupCalNav();
  setupModeToggle();
  setupMicButton();
  setupThemeToggle();
  setupLangToggle();
  setupExport();
  setupSettingsPanel();
  setupAIPlan();
  setupPoolToggle();
  setupTimelineDrop();
  setupManualInput();

  applyLocale();

  const micOk = await checkMicPermission();
  if (micOk) {
    await populateMicDevices();
    document.getElementById("mic-select").addEventListener("change", () => {
      if (wakeDetector) startLevelMeter();
    });
    document.getElementById("wake-btn").addEventListener("click", () => {
      wakeDetector ? stopWakeListening() : startWakeListening();
    });
    setMicState("idle");
  }

  fetch("/api/version").then(r => r.json()).then(d => {
    const el = document.getElementById("topbar-version");
    if (el) el.textContent = `v${d.version}`;
  });

  document.getElementById("update-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("update-btn");
    btn.disabled = true;
    btn.textContent = "…";
    try {
      const res = await fetch("/api/update", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        alert(t("updateFailed", { msg: data.error || data.output }));
        return;
      }
      const msg = data.updated
        ? t("updateSuccess", { local: data.local_version, remote: data.remote_version })
        : t("updateUpToDate", { version: data.remote_version });
      alert(msg);
      if (data.updated) location.reload();
    } catch (e) {
      alert(t("updateRequestFailed", { msg: e.message }));
    } finally {
      btn.disabled = false;
      btn.textContent = t("updateBtn");
    }
  });

  await loadDatesWithItems();
  await loadItems();
  await loadPool();

  setInterval(() => {
    if (state.selectedDate === formatDate(new Date())) {
      renderTimeline(state.items);
      autoExtendOverdue();
    }
  }, 60 * 1000);
}

async function autoExtendOverdue() {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const overdue = state.items.filter(it => {
    if (it.status !== "pending" || !it.start_time || it.pinned) return false;
    const start = timeToMinutes(it.start_time);
    return start != null && nowMins >= start + (it.duration_min || 60);
  });
  if (!overdue.length) return;

  await Promise.all(overdue.map(it =>
    fetch(`/api/items/${it.id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extra_min: 15 }),
    })
  ));
  await loadItems();
  showToast(t("autoExtended", { n: overdue.length }));
}

document.addEventListener("DOMContentLoaded", init);
