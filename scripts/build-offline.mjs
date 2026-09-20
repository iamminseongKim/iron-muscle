import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const assets = (await readdir('dist/assets')).filter(name => /\.(js|css|woff2?)$/.test(name)).map(name => `assets/${name}`);
const core = ['index.html', 'manifest.json', 'brand-mark.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.ico', ...assets];
// Fail the build for missing assets instead of shipping an unusable offline install.
await Promise.all(core.map(path => readFile(`dist/${path}`)));
const hash = createHash('sha256').update(await readFile('dist/index.html')).digest('hex').slice(0, 16);
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
const template = await readFile('scripts/offline-worker.js', 'utf8');
await writeFile('dist/sw.js', `const CACHE_NAME = ${JSON.stringify(`iron-offline-${version}-${hash}`)};\nconst CORE = ${JSON.stringify(core)};\n${template}`);
console.log(`Offline shell: ${core.length} assets, v${version}`);
