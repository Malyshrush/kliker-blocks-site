import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is required');

const query = `query {
  repository(owner: "Malyshrush", name: "kliker-blocks-site") {
    discussions(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes { title url createdAt body author { login } category { name } }
    }
  }
}`;
const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
    'User-Agent': 'KlikerBlocks-community-gallery' },
  body: JSON.stringify({ query })
});
if (!response.ok) throw new Error(`GitHub GraphQL returned ${response.status}`);
const data = await response.json();
if (data.errors?.length) throw new Error(data.errors.map(error => error.message).join('; '));
const discussions = data.data?.repository?.discussions?.nodes;
if (!Array.isArray(discussions)) throw new Error('GitHub Discussions response is incomplete');

const graphs = discussions.filter(item => ['Графы пользователей', 'User graphs']
  .includes(item.category?.name)).map(item => {
  const match = item.body.match(/(`{3,})(?:kliker|text)?\s*\n([\s\S]*?)\n\1/i);
  const code = match?.[2]?.trim() ?? '';
  if (!code.startsWith('# Kliker Blocks GRAPH 1') || code.length > 150000) return null;
  const description = item.body.slice(0, match.index).replace(/[#>*_`]/g, '').trim().slice(0, 500);
  return { title: item.title.slice(0, 120), url: item.url,
    author: item.author?.login ?? 'GitHub', createdAt: item.createdAt,
    description, code };
}).filter(Boolean);
const output = path.resolve('docs/data/community-graphs.json');
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify({ updatedAt: new Date().toISOString(), graphs }, null, 2) + '\n');
console.log(`Synced ${graphs.length} user graphs`);
