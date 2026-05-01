/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),      // 0-based
  selectedDate: formatDate(new Date()),
  items: [],
  datesWithItems: new Set(),
  isReorderMode: false,
  isRecording: false,
  isProcessing: false,
};

/* ── Utilities ─────────────────────────────────────────────────────── */
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function friendlyDate(str) {
  const [y, m, d] = str.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
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

/* ── Calendar ──────────────────────────────────────────────────────── */
function renderCalendar() {
  const { year, month, selectedDate, datesWithItems } = state;
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  document.getElementById("cal-title").textContent = `${year}年 ${monthNames[month]}`;

  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";

  const today = formatDate(new Date());
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start grid on Sunday (0) or Monday? We use Sunday.
  let startDow = firstDay.getDay(); // 0=Sun

  // Pad with previous-month days
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1);
    grid.appendChild(makeDay(d, true));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    grid.appendChild(makeDay(date, false));
  }

  // Pad end to complete the last row (multiple of 7)
  const total = startDow + lastDay.getDate();
  const remainder = total % 7;
  if (remainder !== 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      const d = new Date(year, month + 1, i);
      grid.appendChild(makeDay(d, true));
    }
  }
}

function makeDay(date, otherMonth) {
  const str = formatDate(date);
  const today = formatDate(new Date());
  const el = document.createElement("div");
  el.className = "cal-day";
  el.textContent = date.getDate();
  if (otherMonth) el.classList.add("other-month");
  if (str === today) el.classList.add("today");
  if (str === state.selectedDate) el.classList.add("selected");
  if (state.datesWithItems.has(str)) {
    const dot = document.createElement("span");
    dot.className = "dot";
    el.appendChild(dot);
  }
  if (!otherMonth) {
    el.addEventListener("click", () => selectDate(str));
  }
  return el;
}

async function selectDate(dateStr) {
  state.selectedDate = dateStr;
  document.getElementById("selected-date-label").textContent = friendlyDate(dateStr);
  renderCalendar();
  await loadItems();
}

/* ── Items ─────────────────────────────────────────────────────────── */
async function loadItems() {
  const res = await fetch(`/api/items?date=${state.selectedDate}`);
  state.items = await res.json();
  renderItems();
}

async function loadDatesWithItems() {
  const res = await fetch("/api/items/dates");
  const dates = await res.json();
  state.datesWithItems = new Set(dates);
  renderCalendar();
}

function renderItems() {
  const list = document.getElementById("items-list");
  list.innerHTML = "";

  if (!state.items.length) {
    list.innerHTML = `
      <li class="empty-state">
        <span class="icon">📋</span>
        今天还没有工作事项<br>
        按住麦克风按钮开始添加
      </li>`;
    return;
  }

  state.items.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "work-item";
    li.dataset.id = item.id;
    li.draggable = true;
    li.innerHTML = `
      <span class="drag-handle" title="拖动排序">⠿</span>
      <span class="item-num">${idx + 1}</span>
      <span class="item-content">${escapeHtml(item.content)}</span>
      <button class="item-delete" title="删除" data-id="${item.id}">✕</button>
    `;
    list.appendChild(li);
  });

  // Delete buttons
  list.querySelectorAll(".item-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteItem(parseInt(btn.dataset.id)));
  });

  // Drag-and-drop
  setupDragDrop();
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

async function deleteItem(id) {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  state.items = state.items.filter(i => i.id !== id);
  renderItems();
  await loadDatesWithItems();
}

async function addItems(contents) {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: state.selectedDate, items: contents }),
  });
  if (!res.ok) throw new Error("Failed to save items");
  await loadItems();
  await loadDatesWithItems();
}

async function saveReorder(orderedItems) {
  await fetch("/api/items/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: state.selectedDate, items: orderedItems }),
  });
  await loadItems();
}

/* ── Drag & Drop ───────────────────────────────────────────────────── */
let dragSrc = null;

function setupDragDrop() {
  const items = document.querySelectorAll(".work-item");
  items.forEach(item => {
    item.addEventListener("dragstart", onDragStart);
    item.addEventListener("dragover", onDragOver);
    item.addEventListener("drop", onDrop);
    item.addEventListener("dragend", onDragEnd);
    item.addEventListener("dragleave", onDragLeave);
  });
}

function onDragStart(e) {
  dragSrc = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (this !== dragSrc) this.classList.add("drag-over");
  return false;
}

function onDragLeave() {
  this.classList.remove("drag-over");
}

async function onDrop(e) {
  e.stopPropagation();
  if (dragSrc === this) return;
  const list = document.getElementById("items-list");
  const items = [...list.querySelectorAll(".work-item:not(.empty-state li)")];
  const srcIdx = items.indexOf(dragSrc);
  const tgtIdx = items.indexOf(this);
  if (srcIdx === -1 || tgtIdx === -1) return;

  // Reorder in DOM order
  const reordered = [...state.items];
  const [moved] = reordered.splice(srcIdx, 1);
  reordered.splice(tgtIdx, 0, moved);

  await saveReorder(reordered.map(i => ({ id: i.id, content: i.content })));
}

function onDragEnd() {
  document.querySelectorAll(".work-item").forEach(el => {
    el.classList.remove("dragging", "drag-over");
  });
  dragSrc = null;
}

/* ── Voice (MediaRecorder → Gemini audio) ──────────────────────────── */
let mediaRecorder = null;
let audioChunks = [];
let levelAnimId = null;
let levelStream = null;

async function checkMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch (err) {
    const statusEl = document.getElementById("voice-status");
    const btn = document.getElementById("mic-btn");
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      statusEl.innerHTML = '麦克风权限被拒绝。请在浏览器地址栏点击 🔒 图标允许麦克风，或前往<br><b>系统设置 → 隐私与安全 → 麦克风</b>，开启浏览器权限后刷新页面。';
    } else if (err.name === "NotFoundError") {
      statusEl.textContent = "未检测到麦克风设备";
    } else {
      statusEl.textContent = `麦克风初始化失败：${err.message}`;
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
    const mics = devices.filter(d => d.kind === "audioinput");
    sel.innerHTML = "";
    mics.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label || `麦克风 ${i + 1}`;
      // Auto-select built-in mic if available
      if (d.label.toLowerCase().includes("built-in") || d.label.includes("内置") || d.label.includes("MacBook")) {
        opt.selected = true;
      }
      sel.appendChild(opt);
    });
    if (!mics.length) sel.innerHTML = "<option>未检测到麦克风</option>";
  } catch (e) {
    sel.innerHTML = "<option>无法获取设备列表</option>";
  }
}

async function startLevelMeter() {
  stopLevelMeter();
  const deviceId = document.getElementById("mic-select").value;
  try {
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
    levelStream = await navigator.mediaDevices.getUserMedia(constraints);
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(levelStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const bar = document.getElementById("mic-level-bar");
    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      bar.style.width = Math.min(100, avg * 2.5) + "%";
      bar.style.background = avg > 20 ? "var(--accent)" : "var(--border)";
      levelAnimId = requestAnimationFrame(tick);
    }
    tick();
  } catch (e) {
    showToast(`无法打开该设备：${e.message}`, true);
  }
}

function stopLevelMeter() {
  if (levelAnimId) { cancelAnimationFrame(levelAnimId); levelAnimId = null; }
  if (levelStream) { levelStream.getTracks().forEach(t => t.stop()); levelStream = null; }
  const bar = document.getElementById("mic-level-bar");
  if (bar) bar.style.width = "0%";
}

function setMicState(s) {
  const btn = document.getElementById("mic-btn");
  const statusEl = document.getElementById("voice-status");
  state.isRecording = s === "recording";
  state.isProcessing = s === "processing";

  btn.classList.toggle("recording", s === "recording");
  btn.classList.toggle("processing", s === "processing");
  btn.disabled = s === "processing";
  document.getElementById("mic-select").disabled = s !== "idle";

  if (s === "recording") {
    statusEl.className = "recording";
    statusEl.textContent = state.isReorderMode ? "🎙️ 请说出排序指令…" : "🎙️ 录音中… 松开按钮即可处理";
  } else if (s === "processing") {
    statusEl.className = "processing";
    statusEl.textContent = "⏳ Gemini 处理中…";
  } else {
    statusEl.className = "";
    statusEl.textContent = state.isReorderMode
      ? "排序模式：按住麦克风说出排序指令"
      : "按住麦克风按钮说出工作事项";
  }
}

async function startRecording() {
  if (state.isProcessing || state.isRecording) return;
  const deviceId = document.getElementById("mic-select").value;
  try {
    const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.start();
    setMicState("recording");
    document.getElementById("transcript-preview").textContent = "";
  } catch (err) {
    showToast(`无法打开麦克风：${err.message}`, true);
  }
}

async function stopRecording() {
  if (!state.isRecording || !mediaRecorder) return;
  setMicState("processing");

  await new Promise(resolve => {
    mediaRecorder.onstop = resolve;
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  });

  const mimeType = mediaRecorder.mimeType || "audio/webm";
  const blob = new Blob(audioChunks, { type: mimeType });

  if (blob.size < 1000) {
    setMicState("idle");
    showToast("录音太短，请重试", true);
    return;
  }

  try {
    if (state.isReorderMode) {
      await processReorderCommand(blob, mimeType);
    } else {
      await processAddCommand(blob, mimeType);
    }
  } catch (err) {
    showToast(`错误：${err.message}`, true);
  } finally {
    setMicState("idle");
  }
}

async function processAddCommand(audioBlob, mimeType) {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  form.append("mime_type", mimeType);
  const res = await fetch("/api/voice/process", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(`错误：${data.error || "AI 处理失败"}`);
    throw new Error(data.error || "AI 处理失败");
  }
  if (!data.items || !data.items.length) { showToast("未识别到工作事项"); return; }
  const el = document.getElementById("transcript-preview");
  el.style.color = "";
  el.textContent = data.transcript ? `"${data.transcript}"` : "";
  await addItems(data.items);
  showToast(`已添加 ${data.items.length} 条工作事项`);
}

async function processReorderCommand(audioBlob, mimeType) {
  if (!state.items.length) { showToast("当前没有可排序的事项", true); return; }
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  form.append("mime_type", mimeType);
  form.append("items", JSON.stringify(state.items.map(i => ({ id: i.id, content: i.content }))));
  const res = await fetch("/api/voice/reorder", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(`错误：${data.error || "排序失败"}`);
    throw new Error(data.error || "排序失败");
  }
  await saveReorder(data.items);
  showToast("排序已更新");
}

/* ── Mode toggle ───────────────────────────────────────────────────── */
function setupModeToggle() {
  const btn = document.getElementById("mode-btn");
  btn.addEventListener("click", () => {
    state.isReorderMode = !state.isReorderMode;
    btn.textContent = state.isReorderMode ? "返回添加模式" : "排序模式";
    btn.classList.toggle("reorder-active", state.isReorderMode);
    setMicState("idle");
    document.getElementById("transcript-preview").textContent = "";
  });
}

/* ── Mic button events ─────────────────────────────────────────────── */
function setupMicButton() {
  const btn = document.getElementById("mic-btn");

  // Touch
  btn.addEventListener("touchstart", e => { e.preventDefault(); startRecording(); }, { passive: false });
  btn.addEventListener("touchend", e => { e.preventDefault(); stopRecording(); }, { passive: false });

  // Mouse
  btn.addEventListener("mousedown", () => startRecording());
  btn.addEventListener("mouseup", () => stopRecording());
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
  const micOk = await checkMicPermission();
  if (micOk) {
    await populateMicDevices();
    startLevelMeter();
    document.getElementById("mic-select").addEventListener("change", () => startLevelMeter());
    setMicState("idle");
  }

  await loadDatesWithItems();
  await loadItems();
}

document.addEventListener("DOMContentLoaded", init);
