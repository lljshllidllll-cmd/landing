import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const feedUrl = 'https://rss.blog.naver.com/1986fitness3.xml';
const outputPath = resolve('public/data/blog-posts.json');
const postLimit = 4;

const decodeXml = (value) => value
  .replace(/^\s*<!\[CDATA\[/, '')
  .replace(/\]\]>\s*$/, '')
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .trim();

function readTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) throw new Error(`RSS item is missing <${tag}>`);
  return decodeXml(match[1]);
}

function formatDate(value) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const response = await fetch(feedUrl, {
  headers: { 'user-agent': '1986fitness-jungsan-site-refresh/1.0' }
});
if (!response.ok) throw new Error(`Naver RSS request failed: ${response.status} ${response.statusText}`);

const xml = await response.text();
const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .slice(0, postLimit)
  .map((match) => match[1]);
if (itemBlocks.length !== postLimit) throw new Error(`Expected ${postLimit} RSS items, received ${itemBlocks.length}`);

const posts = itemBlocks.map((block) => {
  const title = readTag(block, 'title');
  const url = readTag(block, 'guid');
  const description = readTag(block, 'description');
  const imageMatch = description.match(/<img\s+[^>]*src="([^"]+)"/i);
  if (!imageMatch) throw new Error(`RSS post has no thumbnail: ${title}`);

  const image = decodeXml(imageMatch[1]);
  if (!url.startsWith('https://blog.naver.com/1986fitness3/')) throw new Error(`Unexpected blog URL: ${url}`);
  if (!image.startsWith('https://blogthumb.pstatic.net/')) throw new Error(`Unexpected thumbnail URL: ${image}`);

  return {
    title,
    url,
    image,
    published: formatDate(readTag(block, 'pubDate'))
  };
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ source: feedUrl, generatedAt: new Date().toISOString(), posts }, null, 2)}\n`, 'utf8');
console.log(`Updated ${posts.length} blog posts from ${feedUrl}`);
