const language = localStorage.getItem('kb-locale') === 'en' ? 'en' : 'ru';
const phrases = {
  ru: { catalog: 'Справочник блоков', community: 'Сообщество', kicker: 'СООБЩЕСТВО',
    title: 'Графы пользователей', intro: 'Открытые графы Kliker Blocks из GitHub Discussions. Просмотрите код перед запуском: графы пользователей могут работать с файлами, окнами и сетью.',
    publish: 'Поделиться графом ↗', all: 'Все обсуждения ↗', loading: 'Загрузка графов…',
    empty: 'Пока нет опубликованных графов. Вы можете поделиться первым.',
    error: 'Список пока недоступен. Откройте обсуждения GitHub.',
    view: 'Открыть обсуждение ↗', copy: 'Копировать код', copied: 'Скопировано' },
  en: { catalog: 'Block catalog', community: 'Community', kicker: 'COMMUNITY',
    title: 'User graphs', intro: 'Public Kliker Blocks graphs from GitHub Discussions. Review code before running it: user graphs can access files, windows and the network.',
    publish: 'Share a graph ↗', all: 'All discussions ↗', loading: 'Loading graphs…',
    empty: 'No graphs have been published yet. You can share the first one.',
    error: 'The gallery is unavailable. Open GitHub Discussions instead.',
    view: 'Open discussion ↗', copy: 'Copy code', copied: 'Copied' }
}[language];
document.documentElement.lang = language;
document.title = `${phrases.title} · Kliker Blocks`;
for (const [id,key] of Object.entries({ 'catalog-link':'catalog', 'community-link':'community',
  'gallery-kicker':'kicker', 'gallery-title':'title', 'gallery-intro':'intro',
  'publish-link':'publish', 'all-link':'all', 'gallery-status':'loading' }))
  document.getElementById(id).textContent = phrases[key];
document.getElementById('gallery-language').textContent = language === 'ru' ? 'EN' : 'RU';
document.getElementById('gallery-language').onclick = () => {
  localStorage.setItem('kb-locale', language === 'ru' ? 'en' : 'ru'); location.reload();
};

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
