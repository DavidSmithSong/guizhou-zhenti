/* ═══════════════════════════════════════════════
   西方文学讲义 · 导航与主题逻辑
   ═══════════════════════════════════════════════ */

/* ── Sidebar nav data ── */
const NAV = [
  {
    era: 'cn1', label: '中国古代文学', color: '#c8a96e',
    pages: [
      { title: '古代文学概览', href: 'gudai-wenxue.html' },
      { title: '古代文论', href: 'gudai-wenlun.html' },
      { title: '文学理论（626）', href: 'wenxue-lilun.html' },
      { title: '古代文学真题', href: 'zhenti-gudai.html' },
    ]
  },
  {
    era: 'cn2', label: '中国现当代文学', color: '#5ba87a',
    pages: [
      { title: '现当代文学概览', href: 'xiandai-wenxue.html' },
      { title: '现当代文学真题', href: 'zhenti-xiandai.html' },
    ]
  },
  {
    era: 1, label: '古典时期', color: 'var(--c1)',
    pages: [
      { title: '两希传统', href: 'liang-xi-chuantong.html' },
      { title: '希伯来传统', href: 'xibo-lai-chuantong.html' },
      { title: '古希腊神话', href: 'gu-xila-shenhua.html' },
      { title: '荷马史诗', href: 'homa-shishi.html' },
      { title: '古希腊戏剧', href: 'gu-xila-xiju.html' },
      { title: '古希腊戏剧 vs 中国戏剧', href: 'xiju-duibi.html' },
      { title: '古罗马文学', href: 'gu-luoma-wenxue.html' },
      { title: '俄底浦斯王', href: 'edi-pusi-wang.html' },
    ]
  },
  {
    era: 2, label: '中世纪', color: 'var(--c2)',
    pages: [
      { title: '中世纪文学', href: 'zhongshiji-wenxue.html' },
    ]
  },
  {
    era: 3, label: '文艺复兴', color: 'var(--c3)',
    pages: [
      { title: '文艺复兴', href: 'wenyifuxing.html' },
      { title: '莫里哀', href: 'moliere.html' },
    ]
  },
  {
    era: 4, label: '新古典·启蒙', color: 'var(--c4)',
    pages: [
      { title: '新古典主义', href: 'xin-gudian-zhuyi.html' },
      { title: '启蒙主义文学', href: 'qimeng-zhuyi-wenxue.html' },
    ]
  },
  {
    era: 5, label: '浪漫主义', color: 'var(--c5)',
    pages: [
      { title: '浪漫主义', href: 'langman-zhuyi.html' },
      { title: '惠特曼', href: 'huiteman.html' },
    ]
  },
  {
    era: 6, label: '现实主义', color: 'var(--c6)',
    pages: [
      { title: '现实主义', href: 'xianshi-zhuyi.html' },
      { title: '易卜生', href: 'yibusheng.html' },
    ]
  },
  {
    era: 7, label: '现代主义·自然主义', color: 'var(--c7)',
    pages: [
      { title: '自然主义及其他流派', href: 'ziran-zhuyi.html' },
      { title: '20世纪文学', href: 'ershi-shiji-wenxue.html' },
    ]
  },
  {
    era: 8, label: '讲义 · 真题', color: 'var(--c8)',
    pages: [
      { title: '人大真题', href: 'zhenti.html' },
      { title: '古代文学真题', href: 'zhenti-gudai.html' },
      { title: '现当代文学真题', href: 'zhenti-xiandai.html' },
      { title: '专辅课（1）现实主义梳理', href: 'zhuanfuke-1.html' },
      { title: '专辅课（3）神话与文学', href: 'zhuanfuke-3.html' },
      { title: '专辅课（5）启蒙与救亡', href: 'zhuanfuke-5.html' },
      { title: '专辅课（7）再现理论', href: 'zhuanfuke-7.html' },
    ]
  },
];

/* ── Build sidebar HTML ── */
function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  let html = `<div id="sidebar-inner">
    <a class="sidebar-logo" href="index.html">
      <span class="sidebar-logo-en">Western Literature · 西方文学</span>
      <span class="sidebar-logo-zh">文学史讲义地图</span>
    </a>
    <a href="index.html" class="sidebar-links" style="display:block;text-decoration:none;font-size:.82rem;color:var(--muted);padding:.3rem .4rem;border-radius:2px;transition:color .2s,background .2s;margin-bottom:.6rem;" onmouseover="this.style.color='var(--text)';this.style.background='var(--surface2)'" onmouseout="this.style.color='var(--muted)';this.style.background=''">← 真题地图首页</a>
    <div class="sidebar-section-title">文学史讲义</div>`;

  for (const group of NAV) {
    html += `<div class="sidebar-era-group">
      <div class="sidebar-era-label" style="color:${group.color}">
        <span class="sidebar-era-dot" style="border-color:${group.color}"></span>
        ${group.label}
      </div>
      <div class="sidebar-links">`;

    for (const page of group.pages) {
      const isActive = currentPage === page.href;
      html += `<a href="${page.href}"${isActive ? ' class="active"' : ''}>${page.title}</a>`;
    }

    html += `</div></div>`;
  }

  html += `</div>`;
  sidebar.innerHTML = html;
}

/* ── Theme toggle ── */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  if (!btn) return;

  function applyTheme(theme) {
    root.dataset.theme = theme;
    btn.textContent = theme === 'light' ? '☾ 暗' : '☀ 明';
    localStorage.setItem('theme', theme);
  }

  applyTheme(localStorage.getItem('theme') || 'dark');

  btn.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
  });
}

/* ── Mobile sidebar toggle ── */
function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    toggle.textContent = sidebar.classList.contains('open') ? '✕' : '≡';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggle) {
      sidebar.classList.remove('open');
      toggle.textContent = '≡';
    }
  });
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  initTheme();
  initSidebarToggle();
});
