import { copyFile, mkdir } from 'node:fs/promises';

const outputDir = new URL('../dist/', import.meta.url);
await mkdir(outputDir, { recursive: true });
await copyFile(new URL('../payment.html', import.meta.url), new URL('payment.html', outputDir));
