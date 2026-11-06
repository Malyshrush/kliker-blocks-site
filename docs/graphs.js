const language = localStorage.getItem('kb-locale') === 'en' ? 'en' : 'ru';
const phrases = {
  ru: { catalog: 'Справочник блоков', community: 'Сообщество', kicker: 'KLIKER BLOCKS',
    title: 'База графов', intro: 'Примеры с подсказками и тестовыми файлами, а также графы пользователей из GitHub Discussions.',
    ready: 'Готовые графы', readyIntro: 'Распакуйте архив и откройте Scenario.klb в Kliker Blocks. В комплекте есть инструкция.',
    download: 'Скачать граф ↓', bundle: 'Скачать все семь графов ↓', userGraphs: 'Графы пользователей',
    publish: 'Поделиться графом ↗', all: 'Все обсуждения ↗', loading: 'Загрузка графов…',
    empty: 'Пока нет опубликованных графов. Вы можете поделиться первым.',
    error: 'Список пока недоступен. Откройте обсуждения GitHub.',
    view: 'Открыть обсуждение ↗', copy: 'Копировать код', copied: 'Скопировано' },
  en: { catalog: 'Block catalog', community: 'Community', kicker: 'KLIKER BLOCKS',
    title: 'Graph library', intro: 'Examples with setup hints and test files, plus user graphs from GitHub Discussions.',
    ready: 'Ready-to-use graphs', readyIntro: 'Extract the archive and open Scenario.klb in Kliker Blocks. Setup instructions are included.',
    download: 'Download graph ↓', bundle: 'Download all seven graphs ↓', userGraphs: 'User graphs',
    publish: 'Share a graph ↗', all: 'All discussions ↗', loading: 'Loading graphs…',
    empty: 'No graphs have been published yet. You can share the first one.',
    error: 'The gallery is unavailable. Open GitHub Discussions instead.',
    view: 'Open discussion ↗', copy: 'Copy code', copied: 'Copied' }
}[language];
document.documentElement.lang = language;
document.title = `${phrases.title} · Kliker Blocks`;
for (const [id,key] of Object.entries({ 'catalog-link':'catalog', 'community-link':'community',
  'gallery-kicker':'kicker', 'gallery-title':'title', 'gallery-intro':'intro',
  'publish-link':'publish', 'all-link':'all', 'gallery-status':'loading',
  'ready-title':'ready', 'ready-intro':'readyIntro', 'ready-all':'bundle', 'community-title':'userGraphs' }))
  document.getElementById(id).textContent = phrases[key];
document.getElementById('gallery-language').textContent = language === 'ru' ? 'EN' : 'RU';
document.getElementById('gallery-language').onclick = () => {
  localStorage.setItem('kb-locale', language === 'ru' ? 'en' : 'ru'); location.reload();
};

document.getElementById('ready-all').href =
  `https://github.com/Malyshrush/kliker-blocks/releases/download/v1.2.6/KlikerBlocks-Graphs-1.2.6-${language}.zip`;

async function renderReadyGraphs() {
  const response = await fetch('data/ready-graphs.json');
  if (!response.ok) throw Error(response.status);
  const catalog = await response.json();
  const grid = document.getElementById('ready-grid');
  for (const graph of catalog[language]) {
    if (!/^[a-z0-9-]+\.zip$/.test(graph.file)) continue;
    const card = document.createElement('article');
    card.className = 'gallery-card';
    const section = document.createElement('small'); section.textContent = graph.section;
    const title = document.createElement('h3'); title.textContent = graph.title;
    const description = document.createElement('p'); description.textContent = graph.description;
    const link = document.createElement('a'); link.href = `assets/graphs/${graph.file}`;
    link.textContent = phrases.download;
    card.append(section, title, description, link);
    grid.append(card);
  }
}
renderReadyGraphs().catch(() => { document.getElementById('ready-status').textContent = phrases.error; });

try {
  const response = await fetch('data/community-graphs.json', { cache: 'no-store' });
  if (!response.ok) throw Error(response.status);
  const data = await response.json();
  const graphs = Array.isArray(data.graphs) ? data.graphs : [];
  document.getElementById('gallery-status').textContent = graphs.length ? '' : phrases.empty;
  const grid = document.getElementById('gallery-grid');
  for (const graph of graphs) {
    if (!graph.url?.startsWith('https://github.com/Malyshrush/kliker-blocks-site/discussions/')) continue;
    const card = document.createElement('article'); card.className = 'gallery-card';
    const author = document.createElement('small'); author.textContent = `@${graph.author ?? 'GitHub'}`;
    const title = document.createElement('h2'); title.textContent = graph.title;
    const description = document.createElement('p'); description.textContent = graph.description;
    const actions = document.createElement('div'); actions.className = 'gallery-actions';
    const link = document.createElement('a'); link.href = graph.url; link.textContent = phrases.view;
    link.rel = 'noopener noreferrer';
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = phrases.copy;
    copy.onclick = async () => { await navigator.clipboard.writeText(graph.code); copy.textContent = phrases.copied; };
    actions.append(link, copy); card.append(author, title, description, actions); grid.append(card);
  }
} catch { document.getElementById('gallery-status').textContent = phrases.error; }
