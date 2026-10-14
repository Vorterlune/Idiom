import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const origin = 'https://vorterlune.github.io';
const base = '/Idiom/';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return results.flat();
}

const files = await htmlFiles(output);
const documents = new Map(
  await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
);
let checked = 0;
for (const [file, html] of documents) {
  const relative = file.slice(output.length + 1).replace(/index\.html$/, '');
  const page = new URL(base + relative, origin);
  for (const match of html.matchAll(
    /<(?:a|link|img|script)\b[^>]*\b(?:href|src)="([^"]+)"[^>]*>/g,
  )) {
    // GitHub Pages serves the error document as 404.html, unlike Astro's canonical /404/.
    if (file.endsWith('/404.html') && match[0].includes('rel="canonical"')) continue;
    const target = new URL(match[1].replaceAll('&amp;', '&'), page);
    if (target.origin !== origin) continue;
    assert(target.pathname.startsWith(base), `${file}: URL escapes the Pages base: ${target.href}`);
    const pathname = decodeURIComponent(target.pathname.slice(base.length));
    const destination = resolve(
      output,
      !pathname || pathname.endsWith('/') ? `${pathname}index.html` : pathname,
    );
    assert(destination.startsWith(output + '/'), `Path escapes build output: ${target.href}`);
    await access(destination).catch(() => {
      throw new Error(`${file}: missing local destination ${target.href}`);
    });
    if (target.hash && documents.has(destination)) {
      const id = decodeURIComponent(target.hash.slice(1));
      const ids = new Set(
        [...documents.get(destination).matchAll(/\bid="([^"]+)"/g)].map((item) => item[1]),
      );
      assert(ids.has(id), `${file}: missing heading ${target.href}`);
    }
    checked++;
  }
}
await access(join(output, 'pagefind/pagefind.js'));
await access(join(output, 'docs/quick-start/index.html'));
await access(join(output, 'docs/components/confirmation-dialog/index.html'));
console.log(
  `Verified ${files.length} HTML pages, ${checked} local URLs/anchors, and the static search bundle.`,
);
