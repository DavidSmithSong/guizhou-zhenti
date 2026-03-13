/* ═══════════════════════════════════════════════
   绿光文学考研 · 互动功能模块
   功能一：思维导图模式（从 h2/h3 自动生成）
   功能二：名词解释闪卡（表格转可翻转卡片）
   ═══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   功能一：思维导图
   ══════════════════════════════════════════════ */

function initMindMap() {
  const article = document.querySelector('.article-body');
  const meta    = document.querySelector('.page-meta');
  if (!article || !meta) return;

  /* ── 提取 h2/h3 结构 ── */
  function extractTree() {
    const nodes = [];
    let currentH2 = null;
    article.querySelectorAll('h2, h3').forEach(el => {
      const text = el.textContent.trim().replace(/^[一二三四五六七八九十]+[、．.]\s*/, '');
      if (el.tagName === 'H2') {
        currentH2 = { label: text, children: [] };
        nodes.push(currentH2);
      } else if (el.tagName === 'H3' && currentH2) {
        currentH2.children.push({ label: text });
      }
    });
    return nodes;
  }

  /* ── SVG 思维导图渲染 ── */
  function renderMindMap(tree) {
    const W  = 900;
    const BRANCH_Y = 54;
    const LEAF_Y   = 36;
    const COL_W    = 300;
    const ROOT_X   = 40;
    const BRANCH_X = 200;
    const LEAF_X   = 460;

    // 计算总高度
    let totalRows = 0;
    tree.forEach(b => { totalRows += Math.max(1, b.children.length); });
    const H = Math.max(420, totalRows * BRANCH_Y + 80);

    let svgContent = '';
    let branchCursor = 40;

    tree.forEach(branch => {
      const childCount = Math.max(1, branch.children.length);
      const branchSpan = childCount * BRANCH_Y;
      const branchCY   = branchCursor + branchSpan / 2;

      // 主节点 → 分支连线
      svgContent += `<line x1="${ROOT_X + 120}" y1="${H/2}" x2="${BRANCH_X}" y2="${branchCY}"
        class="mm-line mm-line-branch"/>`;

      // 分支节点
      svgContent += `<g class="mm-node mm-branch" transform="translate(${BRANCH_X},${branchCY})">
        <rect x="-4" y="${-BRANCH_Y*0.4}" width="${COL_W - 20}" height="${BRANCH_Y*0.8}" rx="4"/>
        <text x="${(COL_W-20)/2}" y="5">${escSvg(branch.label)}</text>
      </g>`;

      // 叶节点
      let leafCursor = branchCursor;
      branch.children.forEach(leaf => {
        const leafCY = leafCursor + BRANCH_Y / 2;
        svgContent += `<line x1="${BRANCH_X + COL_W - 20}" y1="${branchCY}" x2="${LEAF_X}" y2="${leafCY}"
          class="mm-line mm-line-leaf"/>`;
        svgContent += `<g class="mm-node mm-leaf" transform="translate(${LEAF_X},${leafCY})">
          <rect x="-4" y="${-LEAF_Y*0.42}" width="${COL_W + 60}" height="${LEAF_Y*0.84}" rx="3"/>
          <text x="${(COL_W+60)/2 - 4}" y="5">${escSvg(leaf.label)}</text>
        </g>`;
        leafCursor += BRANCH_Y;
      });

      // 无子节点时占位
      if (branch.children.length === 0) leafCursor += BRANCH_Y;
      branchCursor += branchSpan;
    });

    // 根节点（页面标题）
    const rootLabel = document.querySelector('.page-title')?.textContent.trim() || '思维导图';
    svgContent += `<g class="mm-node mm-root" transform="translate(${ROOT_X},${H/2})">
      <rect x="-4" y="-22" width="128" height="44" rx="6"/>
      <text x="60" y="5">${escSvg(rootLabel)}</text>
    </g>`;

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
      style="width:100%;height:auto;display:block">${svgContent}</svg>`;
  }

  function escSvg(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── 模态框 ── */
  function openModal() {
    const tree = extractTree();
    if (tree.length === 0) {
      alert('本页暂无可提取的章节结构。');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'mm-overlay';
    overlay.innerHTML = `
      <div id="mm-modal">
        <div id="mm-toolbar">
          <span id="mm-title">导图模式</span>
          <button id="mm-close">✕ 关闭</button>
        </div>
        <div id="mm-canvas">${renderMindMap(tree)}</div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('mm-close').addEventListener('click', closeModal);
  }

  function closeModal() {
    document.getElementById('mm-overlay')?.remove();
  }

  /* ── 注入按钮 ── */
  const btn = document.createElement('button');
  btn.className = 'obs-btn mm-trigger-btn';
  btn.textContent = '⬡ 导图模式';
  btn.addEventListener('click', openModal);
  meta.appendChild(btn);
}


/* ══════════════════════════════════════════════
   功能二：名词解释闪卡
   ══════════════════════════════════════════════ */

function initFlashcards() {
  const article = document.querySelector('.article-body');
  if (!article) return;

  const h2s = Array.from(article.querySelectorAll('h2'));

  h2s.forEach(h2 => {
    if (!h2.textContent.includes('名词解释')) return;

    // 找紧随其后的 .table-wrap > table
    let el = h2.nextElementSibling;
    while (el && !el.matches('.table-wrap, table')) el = el.nextElementSibling;
    if (!el) return;

    const table = el.matches('table') ? el : el.querySelector('table');
    if (!table) return;

    // 提取词条（跳过 thead）
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) return;

    const cards = rows.map(tr => {
      const cells = tr.querySelectorAll('td');
      return {
        term: cells[0]?.innerHTML.trim() || '',
        def:  cells[1]?.innerHTML.trim() || '',
      };
    }).filter(c => c.term);

    if (cards.length === 0) return;

    // 替换 table-wrap 为闪卡组件
    const wrap = el.matches('.table-wrap') ? el : el.closest('.table-wrap') || el;
    const deck = buildFlashcardDeck(cards);
    wrap.replaceWith(deck);
  });
}

function buildFlashcardDeck(cards) {
  let current = 0;
  let flipped  = false;

  const deck = document.createElement('div');
  deck.className = 'fc-deck';

  // 进度条
  const progress = document.createElement('div');
  progress.className = 'fc-progress';
  progress.innerHTML = `<span class="fc-count">1 / ${cards.length}</span>
    <span class="fc-hint">点击卡片翻转</span>
    <span class="fc-score">已掌握 <b>0</b> / ${cards.length}</span>`;
  deck.appendChild(progress);

  const scoreEl = progress.querySelector('.fc-score b');
  let mastered  = 0;

  // 卡片区
  const cardWrap = document.createElement('div');
  cardWrap.className = 'fc-card-wrap';

  const card = document.createElement('div');
  card.className = 'fc-card';
  card.innerHTML = `<div class="fc-face fc-front">
      <div class="fc-label">术语</div>
      <div class="fc-term">${cards[0].term}</div>
    </div>
    <div class="fc-face fc-back">
      <div class="fc-label">释义</div>
      <div class="fc-def">${cards[0].def}</div>
    </div>`;
  cardWrap.appendChild(card);
  deck.appendChild(cardWrap);

  card.addEventListener('click', () => {
    flipped = !flipped;
    card.classList.toggle('fc-flipped', flipped);
  });

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    flipped = false;
    card.classList.remove('fc-flipped');
    card.querySelector('.fc-term').innerHTML = cards[current].term;
    card.querySelector('.fc-def').innerHTML  = cards[current].def;
    progress.querySelector('.fc-count').textContent = `${current + 1} / ${cards.length}`;
  }

  // 按钮行
  const btns = document.createElement('div');
  btns.className = 'fc-btns';
  btns.innerHTML = `
    <button class="fc-btn fc-prev">← 上一条</button>
    <button class="fc-btn fc-know">✓ 已掌握</button>
    <button class="fc-btn fc-next">下一条 →</button>`;
  deck.appendChild(btns);

  btns.querySelector('.fc-prev').addEventListener('click', () => goTo(current - 1));
  btns.querySelector('.fc-next').addEventListener('click', () => goTo(current + 1));
  btns.querySelector('.fc-know').addEventListener('click', () => {
    mastered = Math.min(mastered + 1, cards.length);
    scoreEl.textContent = mastered;
    goTo(current + 1);
  });

  // 键盘支持（仅当 deck 在视口内）
  document.addEventListener('keydown', e => {
    const rect = deck.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === ' ') { e.preventDefault(); card.click(); }
  });

  return deck;
}


/* ══════════════════════════════════════════════
   初始化
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initMindMap();
  initFlashcards();
});
