/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),      // 0-based
  selectedDate: formatDate(new Date()),
  items: [],
  poolItems: [],
  datesWithItems: new Set(),
  isReorderMode: false,
  isRecording: false,
  isProcessing: false,
  poolExpanded: false,
  pendingSchedule: null,   // AI-generated schedule awaiting apply
};

/* ── Timeline constants ────────────────────────────────────────────── */
const WORK_START  = 9 * 60;   // 09:00 in minutes
const WORK_END    = 21 * 60;  // 21:00 in minutes
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

function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
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
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  document.getElementById("cal-title").textContent = `${year}年 ${monthNames[month]}`;

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
  await loadItems();
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

async function loadPool() {
  const res       = await fetch("/api/pool");
  state.poolItems = await res.json();
  renderPool();
}

/* ── Overlap column layout ──────────────────────────────────────────── */
function assignColumns(tasks) {
  const sorted = [...tasks]
    .filter(t => timeToMinutes(t.start_time) != null)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  // Greedy column assignment: each column tracks the end time of its last task
  const colEnds = [];
  const result  = new Map(); // id -> { col, totalCols }

  sorted.forEach(item => {
    const start = timeToMinutes(item.start_time);
    const end   = start + (item.duration_min || 60);
    let col = colEnds.findIndex(e => e <= start);
    if (col === -1) col = colEnds.length;
    colEnds[col] = end;
    result.set(item.id, { col, totalCols: 0 });
  });

  // For each task, totalCols = how many columns are active during its interval
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

  // Set container heights
  axis.style.height   = TOTAL_PX + "px";
  tracks.style.height = TOTAL_PX + "px";

  // Draw hour/half-hour labels and gridlines
  for (let mins = WORK_START; mins <= WORK_END; mins += 30) {
    const top = (mins - WORK_START) * PX_PER_MIN;

    // Label
    const label = document.createElement("div");
    label.className = "time-label";
    label.style.top = top + "px";
    label.textContent = minutesToTime(mins);
    axis.appendChild(label);

    // Gridline
    const line = document.createElement("div");
    line.className = "timeline-gridline";
    line.style.top = top + "px";
    tracks.appendChild(line);
  }

  // Current time line (only when viewing today)
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

  // Separate scheduled vs unscheduled
  const scheduled   = items.filter(it => it.start_time && it.status !== "suspended");
  const unscheduled = items.filter(it => !it.start_time && it.status !== "suspended");

  // Auto-detect overlapping tasks and assign columns
  const colMap = assignColumns(scheduled);

  // Render scheduled blocks
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

    // Column-based positioning for overlapping tasks
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

    block.innerHTML = `
      <div class="task-block-title">
        <span class="task-title-text">${statusIcon}${escapeHtml(item.content)}</span>
      </div>
      ${descHtml}
      <div class="task-block-meta">
        <span class="task-time-label">${item.start_time} – ${endTime}</span>
        <span class="task-duration-badge" title="点击修改时长" data-id="${item.id}">${item.duration_min || 60}分钟</span>
        ${item.parallel_reason ? `<span class="parallel-badge" title="${escapeHtml(item.parallel_reason)}">∥</span>` : ""}
      </div>
      ${item.status !== "completed" ? `
      <div class="task-actions">
        <button class="task-action-btn btn-complete" data-id="${item.id}">✓ 完成</button>
        <button class="task-action-btn btn-suspend"  data-id="${item.id}">⏸ 挂起</button>
        <button class="task-action-btn btn-extend"   data-id="${item.id}">+ 延长</button>
        <button class="task-action-btn btn-delete"   data-id="${item.id}">✕</button>
      </div>` : `
      <div class="task-actions">
        <button class="task-action-btn btn-delete" data-id="${item.id}">✕</button>
      </div>`}
    `;

    initBlockDrag(block, item);
    initTitleEdit(block, item);
    initDurationEdit(block, item);
    tracks.appendChild(block);
  });

  // Wire action buttons
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

  // Unscheduled section
  if (unscheduled.length > 0) {
    const section = document.createElement("div");
    section.className = "unscheduled-section";
    section.innerHTML = `<div class="unscheduled-title">未排期（${unscheduled.length}）</div>`;
    const ul = document.createElement("ul");
    ul.id = "items-list";
    unscheduled.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "work-item unscheduled-item";
      li.dataset.id = item.id;
      li.draggable = true;
      li.innerHTML = `
        <span class="drag-handle" title="拖动排序">⠿</span>
        <span class="item-num">${idx + 1}</span>
        <span class="item-content">${escapeHtml(item.content)}</span>
        <span class="item-duration">${item.duration_min || 60}分</span>
        <button class="item-delete" title="删除" data-id="${item.id}">✕</button>
      `;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    tracks.parentElement.after ? null : null;

    // Append below the timeline wrapper
    const wrapper = document.getElementById("timeline-wrapper");
    // Remove old unscheduled section if present
    const old = wrapper.parentElement.querySelector(".unscheduled-section");
    if (old) old.remove();
    wrapper.insertAdjacentElement("afterend", section);

    // Delete buttons
    section.querySelectorAll(".item-delete").forEach(btn => {
      btn.addEventListener("click", () => deleteItem(parseInt(btn.dataset.id)));
    });

    setupDragDrop(ul);
  } else {
    const old = document.querySelector(".unscheduled-section");
    if (old) old.remove();
  }

  // Empty state
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<span class="icon">📋</span>今天还没有工作事项<br>按住麦克风按钮开始添加`;
    tracks.appendChild(empty);
  }
}

/* ── Item actions ────────────────────────────────────────────────────── */
async function completeItem(id) {
  const res = await fetch(`/api/items/${id}/complete`, { method: "POST" });
  if (!res.ok) { showToast("操作失败", true); return; }
  await loadItems();
  showToast("已标记完成");
}

async function suspendItem(id) {
  const res = await fetch(`/api/items/${id}/suspend`, { method: "POST" });
  if (!res.ok) { showToast("挂起失败", true); return; }
  await loadItems();
  await loadPool();
  showToast("已移至任务池");
}

async function deleteItem(id) {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  state.items = state.items.filter(i => i.id !== id);
  renderTimeline(state.items);
  await loadDatesWithItems();
}

/* ── Block drag (reschedule by dragging on timeline) ─────────────────── */
let _drag = null;

function initBlockDrag(block, item) {
  block.addEventListener("mousedown", e => {
    if (e.target.closest("button") || e.target.closest(".task-title-text")) return;
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
  span.title = "点击编辑任务名";
  span.style.cursor = "text";

  span.addEventListener("click", e => {
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
      newBadge.title = "点击修改时长";
      newBadge.dataset.id = item.id;
      newBadge.textContent = `${item.duration_min}分钟`;
      input.replaceWith(newBadge);

      // Update time label and block height
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

function showExtendDialog(id, anchorBtn) {
  // Remove any existing extend dialog
  const existing = document.querySelector(".extend-dialog");
  if (existing) existing.remove();

  const dialog = document.createElement("div");
  dialog.className = "extend-dialog";
  dialog.innerHTML = `
    <span>延长</span>
    <input type="number" class="extend-input" value="30" min="5" max="480" step="5" />
    <span>分钟</span>
    <button class="extend-confirm">确认</button>
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
    if (!res.ok) { showToast("延长失败", true); return; }
    await loadItems();
    showToast(`已延长 ${extra} 分钟`);
  });
}

async function addItems(itemsPayload) {
  // Group by date (items may carry their own date field)
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

/* ── Task Pool ─────────────────────────────────────────────────────── */
function renderPool() {
  const list      = document.getElementById("pool-list");
  const countEl   = document.getElementById("pool-count");
  const items     = state.poolItems;
  countEl.textContent = items.length;

  list.innerHTML = "";
  if (!items.length) {
    list.innerHTML = `<div class="pool-empty">暂无挂起任务</div>`;
    return;
  }

  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "pool-item";
    el.innerHTML = `
      <div class="pool-item-main">
        <span class="pool-item-content">${escapeHtml(item.content)}</span>
        <span class="pool-item-duration">${item.duration_min}分</span>
      </div>
      <div class="pool-item-actions">
        <button class="task-action-btn pool-schedule-btn" data-id="${item.id}">排期</button>
        <button class="task-action-btn pool-delete-btn"   data-id="${item.id}">✕</button>
      </div>
    `;
    list.appendChild(el);
  });

  list.querySelectorAll(".pool-schedule-btn").forEach(btn => {
    btn.addEventListener("click", () => schedulePoolItem(parseInt(btn.dataset.id)));
  });
  list.querySelectorAll(".pool-delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetch(`/api/pool/${btn.dataset.id}`, { method: "DELETE" });
      await loadPool();
    });
  });
}

async function schedulePoolItem(poolId) {
  const date = state.selectedDate;
  const timeStr = prompt("排期到哪个时间？(格式 HH:MM，留空则放入未排期)", "");
  const start_time = timeStr && /^\d{2}:\d{2}$/.test(timeStr.trim()) ? timeStr.trim() : null;
  const res = await fetch(`/api/pool/${poolId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, start_time }),
  });
  if (!res.ok) { showToast("排期失败", true); return; }
  await loadPool();
  await loadItems();
  await loadDatesWithItems();
  showToast("已从任务池移至日程");
}

/* ── CSV Export ──────────────────────────────────────────────────────── */
function setupExport() {
  const today = formatDate(new Date());
  const firstOfMonth = today.slice(0, 8) + "01";
  document.getElementById("export-from").value = firstOfMonth;
  document.getElementById("export-to").value   = today;

  document.getElementById("export-btn").addEventListener("click", () => {
    const from = document.getElementById("export-from").value;
    const to   = document.getElementById("export-to").value;
    if (!from || !to) { showToast("请选择起止日期", true); return; }
    if (from > to)    { showToast("起始日期不能晚于结束日期", true); return; }
    window.location.href = `/api/export/csv?from=${from}&to=${to}`;
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
  if (!state.selectedDate) { showToast("请先选择日期", true); return; }
  const overlay = document.getElementById("ai-plan-overlay");
  const loading = document.getElementById("ai-plan-loading");
  const planList = document.getElementById("ai-plan-list");
  const footer   = document.getElementById("ai-plan-footer");

  overlay.classList.remove("hidden");
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
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "生成失败");

    state.pendingSchedule = data.schedule;
    loading.classList.add("hidden");
    renderAIPlanPreview(data.schedule, planList);
    planList.classList.remove("hidden");
    footer.classList.remove("hidden");
  } catch (e) {
    loading.textContent = `生成失败：${e.message}`;
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
      <span class="ai-plan-duration">${entry.duration_min}分</span>
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
  if (!res.ok) { showToast("应用失败", true); return; }
  closeAIPlanModal();
  await loadItems();
  await loadDatesWithItems();
  showToast("AI 规划已应用");
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
    showToast(`已排期到 ${minutesToTime(snapped)}`);
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
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
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
    showToast(`唤醒监听启动失败：${e.message}`, true);
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
  showToast(`已唤醒，说完说「${END_WORD}」结束`);
  setMicState("recording");
  document.getElementById("transcript-preview").textContent = "";
  document.getElementById("wake-word-label").textContent = `录音中，说「${END_WORD}」结束…`;

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
  btn.textContent = active ? "🔴 关闭唤醒" : "🎧 开启唤醒";
  btn.classList.toggle("wake-active", active);
  if (!active) document.getElementById("wake-word-label").textContent = "";
  else if (!state.isRecording) document.getElementById("wake-word-label").textContent = `监听中「${WAKE_WORD}」…`;
}

async function checkMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch (err) {
    const statusEl = document.getElementById("voice-status");
    const btn      = document.getElementById("mic-btn");
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
    const mics    = devices.filter(d => d.kind === "audioinput");
    sel.innerHTML = "";
    mics.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label || `麦克风 ${i + 1}`;
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
    statusEl.textContent = state.isReorderMode ? "🎙️ 请说出排序指令…" : "🎙️ 录音中… 松开按钮即可处理";
  } else if (s === "transcribing") {
    statusEl.className   = "processing";
    statusEl.textContent = "📝 本地转录中…";
  } else if (s === "processing") {
    statusEl.className   = "processing";
    statusEl.textContent = "⏳ Gemini 整理中…";
  } else {
    statusEl.className   = "";
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
    const stream      = await navigator.mediaDevices.getUserMedia(constraints);
    audioChunks   = [];
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

  await new Promise(resolve => {
    mediaRecorder.onstop = resolve;
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  });

  const mimeType = mediaRecorder.mimeType || "audio/webm";
  const blob     = new Blob(audioChunks, { type: mimeType });

  if (blob.size < 1000) {
    setMicState("idle");
    showToast("录音太短，请重试", true);
    return;
  }

  // Step 1: local transcription
  setMicState("transcribing");
  let transcript = "";
  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("mime_type", mimeType);
    const res  = await fetch("/api/voice/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "转录失败");
    transcript = data.transcript;
    const el   = document.getElementById("transcript-preview");
    el.style.color = "";
    el.textContent = transcript ? `"${transcript}"` : "";
  } catch (err) {
    setMicState("idle");
    showError(`转录失败：${err.message}`);
    return;
  }

  if (!transcript) {
    setMicState("idle");
    showToast("未识别到语音内容", true);
    return;
  }

  // Step 2: Gemini text processing
  setMicState("processing");
  try {
    if (state.isReorderMode) {
      await processReorderCommand(transcript);
    } else {
      await processAddCommand(transcript);
    }
  } catch (err) {
    showError(`错误：${err.message}`);
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
    } catch {
      // error already shown by processAddCommand
    } finally {
      btn.disabled = false;
      btn.textContent = "添加";
    }
  }

  btn.addEventListener("click", submit);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") submit();
  });
}

async function processAddCommand(transcript) {
  const res  = await fetch("/api/voice/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, date: state.selectedDate }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(`错误：${data.error || "AI 处理失败"}`);
    throw new Error(data.error || "AI 处理失败");
  }
  if (!data.items || !data.items.length) { showToast("未识别到工作事项"); return; }
  await addItems(data.items);

  const item     = data.items[0];
  const taskDate = item.date || state.selectedDate;
  if (taskDate !== state.selectedDate) {
    showToast(`已添加到 ${friendlyDate(taskDate)}`);
  } else {
    showToast("已添加工作事项");
  }
}

async function processReorderCommand(transcript) {
  if (!state.items.length) { showToast("当前没有可排序的事项", true); return; }
  const res  = await fetch("/api/voice/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: transcript,
      items: state.items.map(i => ({ id: i.id, content: i.content })),
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    showError(`错误：${data.error || "排序失败"}`);
    throw new Error(data.error || "排序失败");
  }
  await saveReorder(data.items);
  showToast("排序已更新");
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
    btn.textContent = "样本已足够（可继续添加）";
    document.getElementById("sample-status").textContent =
      `已启用声纹检测，阈值 ${data.threshold?.toFixed(2) ?? "—"}`;
    document.getElementById("sample-status").style.color = "var(--accent)";
  } else {
    btn.textContent = "按住录制样本";
    document.getElementById("sample-status").textContent =
      `还需录制 ${SAMPLE_TARGET - data.count} 个样本`;
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
    await loadApikeyStatus();
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
    if (!confirm("确认清除所有唤醒词样本？")) return;
    await fetch("/api/wake/samples", { method: "DELETE" });
    await loadSampleState();
    showToast("样本已清除");
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
    document.getElementById("sample-record-btn").textContent = "🔴 录制中…";
    document.getElementById("sample-status").textContent     = "请说「志翔」…";
    document.getElementById("sample-status").style.color     = "var(--danger)";
  } catch (e) {
    showToast(`无法录制：${e.message}`, true);
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
    sampleRecorder.stream.getTracks().forEach(t => t.stop());
  });
  sampleRecorder = null;

  const mimeType = "audio/webm";
  const blob     = new Blob(sampleChunks, { type: mimeType });
  if (blob.size < 500) {
    document.getElementById("sample-status").textContent = "录音太短，请重试";
    btn.disabled    = false;
    btn.textContent = "按住录制样本";
    return;
  }

  document.getElementById("sample-status").textContent = "保存中…";
  const form = new FormData();
  form.append("audio", blob, "sample.webm");
  form.append("mime_type", mimeType);
  const res  = await fetch("/api/wake/samples", { method: "POST", body: form });
  const data = await res.json();
  btn.disabled = false;
  if (data.error) {
    document.getElementById("sample-status").textContent = `错误：${data.error}`;
  } else {
    await loadSampleState();
  }
}

/* ── API key management ──────────────────────────────────────────────── */
async function loadApikeyStatus() {
  const res  = await fetch("/api/settings/apikey");
  const data = await res.json();
  document.getElementById("apikey-configured").classList.toggle("hidden", !data.configured);
  document.getElementById("apikey-form").classList.toggle("hidden",       data.configured);
  document.getElementById("apikey-msg").textContent = "";

  const deleteBtn = document.getElementById("apikey-delete-btn");
  const saveBtn   = document.getElementById("apikey-save-btn");

  // Re-bind to avoid duplicate listeners
  deleteBtn.replaceWith(deleteBtn.cloneNode(true));
  saveBtn.replaceWith(saveBtn.cloneNode(true));

  document.getElementById("apikey-delete-btn").addEventListener("click", async () => {
    if (!confirm("确定要删除 API Key 吗？删除后 AI 功能将不可用。")) return;
    await fetch("/api/settings/apikey", { method: "DELETE" });
    await loadApikeyStatus();
  });

  async function saveKey() {
    const key = document.getElementById("apikey-input").value.trim();
    if (!key) return;
    const res  = await fetch("/api/settings/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    const msg  = document.getElementById("apikey-msg");
    if (!res.ok) {
      msg.textContent = data.error || "保存失败";
      msg.style.color = "var(--danger)";
    } else {
      document.getElementById("apikey-input").value = "";
      await loadApikeyStatus();
    }
  }

  document.getElementById("apikey-save-btn").addEventListener("click", saveKey);
  document.getElementById("apikey-input").addEventListener("keydown", e => {
    if (e.key === "Enter") saveKey();
  });
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
  setupExport();
  setupSettingsPanel();
  setupAIPlan();
  setupPoolToggle();
  setupTimelineDrop();
  setupManualInput();

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

  await loadDatesWithItems();
  await loadItems();
  await loadPool();

  // Redraw now-line and check for overdue tasks every minute
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
    if (it.status !== "pending" || !it.start_time) return false;
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
  showToast(`${overdue.length} 个任务已自动延长 15 分钟`);
}

document.addEventListener("DOMContentLoaded", init);
