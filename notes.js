/**
 * 绿光 · 随堂笔记系统
 * 浮动笔记面板：文字笔记 + 画布涂写，支持导出
 * 自动读写 localStorage，按页面 URL 分组保存
 */
(function () {
  'use strict';

  /* ── 常量 ── */
  const STORAGE_KEY    = 'gl_notes_' + location.pathname.replace(/\W+/g, '_');
  const CANVAS_KEY     = 'gl_canvas_' + location.pathname.replace(/\W+/g, '_');
  const PANEL_OPEN_KEY = 'gl_panel_open';
  const PANEL_TAB_KEY  = 'gl_panel_tab';

  /* ── 注入 CSS ── */
  const style = document.createElement('style');
  style.textContent = `
  /* ── FAB ── */
  #gl-note-fab {
    position: fixed;
    right: 1.4rem;
    bottom: 4rem;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: #111624;
    border: 1px solid rgba(74,222,128,.35);
    color: #4ade80;
    font-size: 1.1rem;
    cursor: pointer;
    z-index: 9000;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(74,222,128,.18), 0 4px 20px rgba(0,0,0,.4);
    transition: box-shadow .25s, border-color .25s;
  }
  #gl-note-fab:hover {
    border-color: rgba(74,222,128,.7);
    box-shadow: 0 0 28px rgba(74,222,128,.3), 0 4px 20px rgba(0,0,0,.4);
  }
  #gl-note-fab .fab-badge {
    position: absolute;
    top: -4px; right: -4px;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #4ade80;
    display: none;
    box-shadow: 0 0 6px #4ade80;
  }
  #gl-note-fab.has-content .fab-badge { display: block; }

  /* ── PANEL ── */
  #gl-note-panel {
    position: fixed;
    right: -420px;
    top: 0; bottom: 0;
    width: 400px;
    max-width: 92vw;
    background: #0e1220;
    border-left: 1px solid rgba(200,220,255,.1);
    z-index: 8999;
    display: flex; flex-direction: column;
    transition: right .35s cubic-bezier(.16,1,.3,1);
    font-family: 'Noto Serif SC', 'PingFang SC', serif;
    box-shadow: -8px 0 40px rgba(0,0,0,.5);
  }
  #gl-note-panel.open { right: 0; }

  /* panel header */
  .gl-panel-head {
    display: flex; align-items: center; gap: .5rem;
    padding: .85rem 1rem;
    border-bottom: 1px solid rgba(200,220,255,.08);
    flex-shrink: 0;
  }
  .gl-panel-title {
    font-size: .78rem; letter-spacing: .18em;
    color: rgba(200,220,255,.5);
    text-transform: uppercase;
    flex: 1;
    font-family: 'Cormorant Garamond', serif; font-style: italic;
  }
  .gl-panel-close {
    background: none; border: none;
    color: rgba(200,220,255,.35);
    font-size: 1.1rem; cursor: pointer;
    padding: .2rem .4rem;
    transition: color .2s;
    line-height: 1;
  }
  .gl-panel-close:hover { color: #f0f0f0; }

  /* tabs */
  .gl-tabs {
    display: flex; gap: 0;
    border-bottom: 1px solid rgba(200,220,255,.08);
    flex-shrink: 0;
  }
  .gl-tab {
    flex: 1; padding: .55rem; font-size: .75rem;
    letter-spacing: .1em; cursor: pointer;
    background: none; border: none;
    color: rgba(200,220,255,.35);
    border-bottom: 2px solid transparent;
    transition: color .2s, border-color .2s;
  }
  .gl-tab.active {
    color: #4ade80;
    border-bottom-color: #4ade80;
  }

  /* panes */
  .gl-pane { display: none; flex: 1; flex-direction: column; min-height: 0; }
  .gl-pane.active { display: flex; }

  /* ── TEXT PANE ── */
  #gl-text-pane { padding: 0; }

  .gl-toolbar {
    display: flex; gap: .3rem; flex-wrap: wrap;
    padding: .5rem .75rem;
    border-bottom: 1px solid rgba(200,220,255,.06);
    flex-shrink: 0;
  }
  .gl-tbtn {
    background: rgba(200,220,255,.05);
    border: 1px solid rgba(200,220,255,.1);
    color: rgba(200,220,255,.6);
    font-size: .72rem; letter-spacing: .06em;
    padding: .2rem .55rem; border-radius: 2px;
    cursor: pointer; transition: all .15s;
    font-family: 'Cormorant Garamond', serif;
  }
  .gl-tbtn:hover {
    background: rgba(200,220,255,.12);
    color: #f0f0f0;
  }

  #gl-textarea {
    flex: 1;
    background: transparent;
    border: none; outline: none; resize: none;
    color: rgba(240,240,240,.85);
    font-family: 'Noto Serif SC', 'PingFang SC', serif;
    font-size: .9rem; line-height: 1.85;
    padding: 1rem;
    caret-color: #4ade80;
  }
  #gl-textarea::placeholder { color: rgba(200,220,255,.2); }

  /* ── CANVAS PANE ── */
  #gl-canvas-pane { overflow: hidden; }

  .gl-canvas-tools {
    display: flex; align-items: center; gap: .5rem;
    padding: .5rem .75rem;
    border-bottom: 1px solid rgba(200,220,255,.06);
    flex-shrink: 0; flex-wrap: wrap;
  }
  .gl-tool-btn {
    background: rgba(200,220,255,.05);
    border: 1px solid rgba(200,220,255,.1);
    color: rgba(200,220,255,.6);
    font-size: .7rem; padding: .25rem .6rem;
    border-radius: 2px; cursor: pointer;
    transition: all .15s;
  }
  .gl-tool-btn.active, .gl-tool-btn:hover {
    background: rgba(74,222,128,.12);
    border-color: rgba(74,222,128,.4);
    color: #4ade80;
  }
  .gl-color-swatch {
    width: 22px; height: 22px; border-radius: 50%;
    cursor: pointer; border: 2px solid rgba(200,220,255,.2);
    transition: border-color .15s;
  }
  .gl-color-swatch.active { border-color: #4ade80; }
  #gl-stroke-size {
    width: 70px; accent-color: #4ade80;
    vertical-align: middle;
  }
  #gl-canvas {
    flex: 1; display: block;
    width: 100%;
    touch-action: none;
    cursor: crosshair;
    background: #0a0d18;
  }

  /* ── FOOTER ── */
  .gl-panel-foot {
    padding: .65rem 1rem;
    border-top: 1px solid rgba(200,220,255,.06);
    display: flex; gap: .5rem; flex-shrink: 0; flex-wrap: wrap;
  }
  .gl-export-btn {
    flex: 1;
    background: rgba(74,222,128,.08);
    border: 1px solid rgba(74,222,128,.2);
    color: #4ade80;
    font-family: 'Cormorant Garamond', serif;
    font-size: .78rem; letter-spacing: .12em;
    padding: .45rem .6rem; border-radius: 2px;
    cursor: pointer; transition: all .2s; text-align: center;
  }
  .gl-export-btn:hover {
    background: rgba(74,222,128,.16);
    border-color: rgba(74,222,128,.5);
  }
  .gl-export-btn.secondary {
    background: rgba(200,220,255,.04);
    border-color: rgba(200,220,255,.12);
    color: rgba(200,220,255,.5);
  }
  .gl-export-btn.secondary:hover {
    background: rgba(200,220,255,.1);
    color: #f0f0f0;
  }

  /* char count */
  .gl-charcount {
    font-size: .65rem; color: rgba(200,220,255,.2);
    font-family: 'Cormorant Garamond', serif;
    align-self: center; margin-left: auto; white-space: nowrap;
  }

  /* Resize handle */
  #gl-resize-handle {
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 5px;
    cursor: ew-resize;
    background: transparent;
    z-index: 1;
  }
  #gl-resize-handle:hover { background: rgba(74,222,128,.12); }

  /* instant open — skip slide animation on page load restore */
  #gl-note-panel.instant { transition: none !important; }

  @media (max-width: 480px) {
    #gl-note-panel { width: 100vw; max-width: 100vw; right: -100vw; }
    #gl-note-fab { bottom: 5rem; }
  }
  `;
  document.head.appendChild(style);

  /* ── BUILD DOM ── */
  // FAB
  const fab = document.createElement('button');
  fab.id = 'gl-note-fab';
  fab.title = 'Open notes';
  fab.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg><span class="fab-badge"></span>`;
  document.body.appendChild(fab);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'gl-note-panel';
  panel.innerHTML = `
  <div id="gl-resize-handle"></div>
  <div class="gl-panel-head">
    <span class="gl-panel-title">Notes</span>
    <button class="gl-panel-close" id="gl-note-close" title="关闭">✕</button>
  </div>
  <div class="gl-tabs">
    <button class="gl-tab active" data-tab="text">✏ Text</button>
    <button class="gl-tab"        data-tab="canvas">🖊 Canvas</button>
  </div>

  <!-- TEXT PANE -->
  <div class="gl-pane active" id="gl-text-pane">
    <div class="gl-toolbar">
      <button class="gl-tbtn" data-wrap="**" title="加粗">B</button>
      <button class="gl-tbtn" data-wrap="*"  title="斜体"><i>I</i></button>
      <button class="gl-tbtn" data-prefix="## " title="标题">H2</button>
      <button class="gl-tbtn" data-prefix="- "  title="列表">· 列表</button>
      <button class="gl-tbtn" data-prefix="> "  title="引用">❝ 引</button>
      <button class="gl-tbtn" data-prefix="---\n" title="分割线">—</button>
      <button class="gl-tbtn" id="gl-clear-text" title="清空">Clear</button>
    </div>
    <textarea id="gl-textarea" placeholder="在此记录笔记……支持 Markdown 格式
## 标题
**粗体** / *斜体*
- 列表项
> 引用名句

笔记按页面自动保存。"></textarea>
    <div class="gl-panel-foot">
      <button class="gl-export-btn" id="gl-export-md">↓ Export .md</button>
      <button class="gl-export-btn" id="gl-export-txt">↓ Export .txt</button>
      <button class="gl-export-btn secondary" id="gl-copy-text">Copy</button>
      <span class="gl-charcount" id="gl-charcount">0 chars</span>
    </div>
  </div>

  <!-- CANVAS PANE -->
  <div class="gl-pane" id="gl-canvas-pane">
    <div class="gl-canvas-tools">
      <button class="gl-tool-btn active" id="tool-pen">✏ Pen</button>
      <button class="gl-tool-btn" id="tool-eraser">◻ Eraser</button>
      <span style="color:rgba(200,220,255,.2);font-size:.7rem">|</span>
      <span class="gl-color-swatch active" data-color="#f0f0f0" style="background:#f0f0f0" title="白"></span>
      <span class="gl-color-swatch" data-color="#4ade80" style="background:#4ade80" title="绿"></span>
      <span class="gl-color-swatch" data-color="#f0d060" style="background:#f0d060" title="黄"></span>
      <span class="gl-color-swatch" data-color="#7ab0e0" style="background:#7ab0e0" title="蓝"></span>
      <span class="gl-color-swatch" data-color="#e05252" style="background:#e05252" title="红"></span>
      <input type="range" id="gl-stroke-size" min="1" max="20" value="3" title="粗细">
      <button class="gl-tool-btn" id="gl-canvas-clear">Clear</button>
    </div>
    <canvas id="gl-canvas"></canvas>
    <div class="gl-panel-foot">
      <button class="gl-export-btn" id="gl-export-png">↓ Export .png</button>
      <button class="gl-export-btn secondary" id="gl-export-jpg">↓ Export .jpg</button>
    </div>
  </div>
  `;
  document.body.appendChild(panel);

  /* ── STATE ── */
  let isOpen      = false;
  let activeTab   = 'text';
  let drawing     = false;
  let tool        = 'pen';
  let strokeColor = '#f0f0f0';
  let strokeSize  = 3;
  let lastX = 0, lastY = 0;

  const textarea  = document.getElementById('gl-textarea');
  const canvas    = document.getElementById('gl-canvas');
  const ctx       = canvas.getContext('2d');
  const charcount = document.getElementById('gl-charcount');

  /* ── OPEN / CLOSE ── */
  function open()  {
    panel.classList.add('open'); isOpen = true;
    localStorage.setItem(PANEL_OPEN_KEY, '1');
    resizeCanvas();
  }
  function close() {
    panel.classList.remove('open'); isOpen = false;
    localStorage.setItem(PANEL_OPEN_KEY, '0');
  }

  fab.addEventListener('click', () => isOpen ? close() : open());
  document.getElementById('gl-note-close').addEventListener('click', close);

  /* close on Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });

  /* ── RESTORE STATE FROM PREVIOUS PAGE ── */
  (function restoreState() {
    // Restore active tab
    const savedTab = localStorage.getItem(PANEL_TAB_KEY);
    if (savedTab && savedTab !== 'text') {
      activeTab = savedTab;
      document.querySelectorAll('.gl-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.gl-pane').forEach(p => p.classList.remove('active'));
      const tabBtn  = document.querySelector('.gl-tab[data-tab="' + savedTab + '"]');
      const tabPane = document.getElementById('gl-' + savedTab + '-pane');
      if (tabBtn)  tabBtn.classList.add('active');
      if (tabPane) tabPane.classList.add('active');
    }
    // Restore panel open state — instant (no slide animation)
    if (localStorage.getItem(PANEL_OPEN_KEY) === '1') {
      panel.classList.add('instant', 'open');
      isOpen = true;
      // Remove instant class after one frame so future open/close animates
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove('instant')));
      if (activeTab === 'canvas') setTimeout(resizeCanvas, 80);
    }
  })();

  /* ── TABS ── */
  document.querySelectorAll('.gl-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      localStorage.setItem(PANEL_TAB_KEY, activeTab);
      document.querySelectorAll('.gl-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.gl-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('gl-' + activeTab + '-pane').classList.add('active');
      if (activeTab === 'canvas') setTimeout(resizeCanvas, 50);
    });
  });

  /* ── TEXT ── */
  // Load saved
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { textarea.value = saved; updateCharcount(); updateBadge(); }

  textarea.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY, textarea.value);
    updateCharcount();
    updateBadge();
  });

  function updateCharcount() {
    charcount.textContent = textarea.value.length + ' chars';
  }
  function updateBadge() {
    const hasText   = textarea.value.trim().length > 0;
    const hasCanvas = !!localStorage.getItem(CANVAS_KEY);
    fab.classList.toggle('has-content', hasText || hasCanvas);
  }

  // Toolbar buttons
  document.querySelectorAll('.gl-tbtn[data-wrap]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap  = btn.dataset.wrap;
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      const sel   = textarea.value.slice(start, end) || '文字';
      const rep   = wrap + sel + wrap;
      textarea.setRangeText(rep, start, end, 'select');
      textarea.focus();
      textarea.dispatchEvent(new Event('input'));
    });
  });

  document.querySelectorAll('.gl-tbtn[data-prefix]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.dataset.prefix;
      const start  = textarea.selectionStart;
      textarea.setRangeText(prefix, start, start, 'end');
      textarea.focus();
      textarea.dispatchEvent(new Event('input'));
    });
  });

  document.getElementById('gl-clear-text').addEventListener('click', () => {
    if (!textarea.value || confirm('Clear all notes?')) {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
    }
  });

  /* ── TEXT EXPORT ── */
  function pageTitle() {
    return (document.title || 'notes').replace(/[^\u4e00-\u9fa5\w]+/g, '-').slice(0, 40);
  }

  document.getElementById('gl-export-md').addEventListener('click', () => {
    const header = `# ${document.title}\n> 笔记导出 · ${new Date().toLocaleDateString('zh-CN')}\n\n`;
    download(header + textarea.value, pageTitle() + '.md', 'text/markdown');
  });

  document.getElementById('gl-export-txt').addEventListener('click', () => {
    download(textarea.value, pageTitle() + '.txt', 'text/plain');
  });

  document.getElementById('gl-copy-text').addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value).then(() => {
      const btn = document.getElementById('gl-copy-text');
      btn.textContent = '已复制 ✓';
      setTimeout(() => { btn.textContent = '复制'; }, 1800);
    });
  });

  /* ── CANVAS ── */
  function resizeCanvas() {
    const pane = document.getElementById('gl-canvas-pane');
    const rect = pane.getBoundingClientRect();
    // Save current drawing
    const img = canvas.toDataURL();
    canvas.width  = rect.width  || panel.offsetWidth;
    canvas.height = rect.height - 46 - 56; // toolbar + footer
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restore
    const image = new Image();
    image.src = img;
    image.onload = () => ctx.drawImage(image, 0, 0);
    restoreCanvas();
  }

  function restoreCanvas() {
    const saved = localStorage.getItem(CANVAS_KEY);
    if (!saved) return;
    const image = new Image();
    image.src = saved;
    image.onload = () => ctx.drawImage(image, 0, 0);
  }

  function saveCanvas() {
    try { localStorage.setItem(CANVAS_KEY, canvas.toDataURL()); }
    catch(e) { /* storage full */ }
    updateBadge();
  }

  // Tools
  document.getElementById('tool-pen').addEventListener('click', () => {
    tool = 'pen';
    document.getElementById('tool-pen').classList.add('active');
    document.getElementById('tool-eraser').classList.remove('active');
    canvas.style.cursor = 'crosshair';
  });
  document.getElementById('tool-eraser').addEventListener('click', () => {
    tool = 'eraser';
    document.getElementById('tool-eraser').classList.add('active');
    document.getElementById('tool-pen').classList.remove('active');
    canvas.style.cursor = 'cell';
  });

  // Colors
  document.querySelectorAll('.gl-color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      strokeColor = sw.dataset.color;
      document.querySelectorAll('.gl-color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
    });
  });

  // Stroke size
  document.getElementById('gl-stroke-size').addEventListener('input', e => {
    strokeSize = +e.target.value;
  });

  // Clear canvas
  document.getElementById('gl-canvas-clear').addEventListener('click', () => {
    if (confirm('Clear canvas?')) {
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      localStorage.removeItem(CANVAS_KEY);
      updateBadge();
    }
  });

  /* Drawing */
  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    lastX = p.x; lastY = p.y;
    ctx.beginPath();
    ctx.arc(lastX, lastY, (tool === 'eraser' ? strokeSize * 3 : strokeSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#0a0d18' : strokeColor;
    ctx.fill();
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = tool === 'eraser' ? '#0a0d18' : strokeColor;
    ctx.lineWidth   = tool === 'eraser' ? strokeSize * 3 : strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  }

  function stopDraw() {
    if (!drawing) return;
    drawing = false;
    saveCanvas();
  }

  canvas.addEventListener('mousedown',  startDraw);
  canvas.addEventListener('mousemove',  draw);
  canvas.addEventListener('mouseup',    stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove',  draw,      { passive: false });
  canvas.addEventListener('touchend',   stopDraw);

  /* Canvas export */
  document.getElementById('gl-export-png').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = pageTitle() + '-notes.png';
    a.click();
  });

  document.getElementById('gl-export-jpg').addEventListener('click', () => {
    // merge with white background for jpg
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    const tc = tmp.getContext('2d');
    tc.fillStyle = '#0a0d18';
    tc.fillRect(0, 0, tmp.width, tmp.height);
    tc.drawImage(canvas, 0, 0);
    const a = document.createElement('a');
    a.href = tmp.toDataURL('image/jpeg', 0.92);
    a.download = pageTitle() + '-notes.jpg';
    a.click();
  });

  /* ── RESIZE HANDLE ── */
  const handle = document.getElementById('gl-resize-handle');
  let resizing = false, startX = 0, startW = 0;

  handle.addEventListener('mousedown', e => {
    resizing = true;
    startX = e.clientX;
    startW = panel.offsetWidth;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const delta = startX - e.clientX;
    const newW = Math.max(280, Math.min(700, startW + delta));
    panel.style.width = newW + 'px';
    if (activeTab === 'canvas') resizeCanvas();
  });
  document.addEventListener('mouseup', () => {
    if (resizing) { resizing = false; document.body.style.userSelect = ''; }
  });

  /* ── UTIL ── */
  function download(content, filename, type) {
    const blob = new Blob([content], { type: type + ';charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* Init badge */
  updateBadge();

})();
