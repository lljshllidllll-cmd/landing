import { copyFile, mkdir } from 'node:fs/promises';

const outputDir = new URL('../dist/', import.meta.url);
await mkdir(outputDir, { recursive: true });
for (const filename of ['payment.html', 'robots.txt', 'sitemap.xml']) {
  await copyFile(new URL(`../${filename}`, import.meta.url), new URL(filename, outputDir));
}
