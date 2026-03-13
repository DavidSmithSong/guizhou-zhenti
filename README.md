# 绿光文学考研 · Green Light Lit

> "So we beat on, boats against the current, borne back ceaselessly into the past."
> ——F. Scott Fitzgerald, *The Great Gatsby*

以文学史为经，真题为纬。面向中国人民大学文学考研的交互式知识地图。

---

## 项目简介

**绿光**是一套纯静态的文学考研讲义站点，覆盖西方文学、中国古代文学、中国现当代文学、文学理论四大模块，附历年真题汇总与交互式知识图谱。

- 零框架依赖，纯 HTML / CSS / JavaScript
- 内置浮动笔记面板（支持文字 + 画布，本地存储）
- 深色 / 浅色主题一键切换
- 全站响应式，移动端可用

---

## 页面目录

### 总览

| 文件 | 页面 |
|------|------|
| `index.html` | 首页 · 知识地图入口 |
| `graph.html` | 文学史知识图谱（交互可视化） |

### 西方文学（26页）

| 文件 | 页面 |
|------|------|
| `liang-xi-chuantong.html` | 两希传统 · 西方文学源头总论 |
| `gu-xila-shenhua.html` | 古希腊神话 |
| `homa-shishi.html` | 荷马史诗 |
| `gu-xila-xiju.html` | 古希腊戏剧 |
| `xiju-duibi.html` | 古希腊戏剧 vs 中国戏剧 |
| `edi-pusi-wang.html` | 俄底浦斯王 |
| `xibo-lai-chuantong.html` | 希伯来传统 |
| `gu-luoma-wenxue.html` | 古罗马文学 |
| `zhongshiji-wenxue.html` | 中世纪文学 |
| `wenyifuxing.html` | 文艺复兴 |
| `moliere.html` | 莫里哀 |
| `xin-gudian-zhuyi.html` | 新古典主义 |
| `qimeng-zhuyi-wenxue.html` | 启蒙主义文学 |
| `langman-zhuyi.html` | 浪漫主义 |
| `huiteman.html` | 惠特曼 |
| `xianshi-zhuyi.html` | 现实主义 |
| `yibusheng.html` | 易卜生 |
| `ziran-zhuyi.html` | 自然主义及其他流派 |
| `ershi-shiji-wenxue.html` | 20世纪文学 |
| `zhuanfuke-1.html` | 专辅课（1）现实主义梳理 |
| `zhuanfuke-3.html` | 专辅课（3）神话与文学 |
| `zhuanfuke-5.html` | 专辅课（5）启蒙与救亡 |
| `zhuanfuke-7.html` | 专辅课（7）再现理论 |

### 中国文学

| 文件 | 页面 |
|------|------|
| `gudai-wenxue.html` | 中国古代文学概览 |
| `gudai-wenlun.html` | 中国古代文论 |
| `xiandai-wenxue.html` | 中国现当代文学 |

### 文学理论 & 真题

| 文件 | 页面 |
|------|------|
| `wenxue-lilun.html` | 文学理论（626考点） |
| `zhenti.html` | 西方文学真题汇总 |
| `zhenti-gudai.html` | 古代文学真题汇总 |
| `zhenti-xiandai.html` | 现当代文学真题汇总 |

---

## 技术架构

```
绿光/
├── index.html          # 首页
├── style.css           # 全局样式（CSS 变量 + 双主题）
├── nav.js              # 侧边栏导航（自动注入所有页面）
├── notes.js            # 浮动笔记面板
├── logo.svg            # 品牌标识
├── 404.html            # 自定义错误页
├── robots.txt          # SEO 配置
└── *.html              # 各章节讲义页面
```

**技术选型**：零依赖，无构建工具，直接用浏览器打开即可运行。

**数据存储**：笔记系统使用 `localStorage`，按页面路径隔离存储，完全本地、无需联网。

**字体**：Noto Serif SC + Cormorant Garamond，通过 `fonts.loli.net` 加载（国内镜像）。

---

## 本地运行

直接在浏览器中打开 `index.html` 即可。如果需要通过本地服务器访问（避免部分浏览器的跨域限制）：

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

然后访问 `http://localhost:8080`。

---

## 笔记系统

每个页面右下角有悬浮笔记按钮（铅笔图标）：

- **文字标签页**：Markdown 风格输入，支持加粗、斜体、标题、列表、引用快捷键
- **画布标签页**：手写涂画，支持 5 色画笔和橡皮擦，可调粗细
- **导出**：支持 `.md` / `.txt` / `.png` / `.jpg` 四种格式
- **存储**：笔记按页面独立保存，刷新不丢失

---

*© 2026 绿光文学考研 · Green Light Lit · 版权所有*
