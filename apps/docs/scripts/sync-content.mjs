import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(app, '../..');
const contentRoot = resolve(app, 'src/content/docs');
const base = '/Idiom';
const sourceRoutes = new Map([
  ['docs/architecture.md', `${base}/docs/concepts/architecture/`],
  ['docs/semantic-layer.md', `${base}/docs/concepts/semantic-layer/`],
  ['docs/verification.md', `${base}/docs/status/verification/`],
  ['README.md', `${base}/docs/guides/expo-comparison/`],
  ['CONTRIBUTING.md', 'https://github.com/Vorterlune/Idiom/blob/main/CONTRIBUTING.md'],
]);

function rewriteLinks(markdown, source) {
  return markdown.replace(/\]\(([^)]+)\)/g, (match, href) => {
    if (/^https?:/.test(href)) return match;
    if (source === 'README.md') {
      const fragments = {
        '#install-in-an-application': `${base}/docs/installation/`,
        '#application-setup': `${base}/docs/installation/`,
        '#composition-and-custom-content': `${base}/docs/guides/appearance-and-composition/`,
      };
      if (fragments[href]) return `](${fragments[href]})`;
    }
    if (href.startsWith('#')) return match;
    const [path, hash] = href.split('#');
    const resolved = resolve(repository, dirname(source), path);
    const key = resolved.slice(repository.length + 1);
    const route = sourceRoutes.get(key);
    return route ? `](${route}${hash ? `#${hash}` : ''})` : match;
  });
}

async function generatedPage(destination, title, source, body) {
  const target = resolve(contentRoot, destination);
  await mkdir(dirname(target), { recursive: true });
  const editUrl = `https://github.com/Vorterlune/Idiom/edit/main/${source}`;
  await writeFile(
    target,
    `---\ntitle: ${title}\neditUrl: ${editUrl}\n---\n\n${rewriteLinks(body, source)}\n`,
  );
}

for (const [source, destination, title] of [
  ['docs/architecture.md', 'docs/concepts/architecture.md', 'Architecture'],
  ['docs/semantic-layer.md', 'docs/concepts/semantic-layer.md', 'The semantic layer'],
  ['docs/verification.md', 'docs/status/verification.md', 'Verification and limits'],
]) {
  const markdown = await readFile(resolve(repository, source), 'utf8');
  await generatedPage(destination, title, source, markdown.replace(/^# [^\n]+\n/, ''));
}

const readme = await readFile(resolve(repository, 'README.md'), 'utf8');
const start = readme.indexOf('## Expo UI and Idiom, compared');
const end = readme.indexOf('## How it fits your development workflow');
if (start < 0 || end <= start) throw new Error('README comparison section was not found.');
await generatedPage(
  'docs/guides/expo-comparison.md',
  'Expo UI and Idiom',
  'README.md',
  readme.slice(start, end).trim(),
);

const types = await readFile(resolve(repository, 'packages/ui/src/types.ts'), 'utf8');
await generatedPage(
  'docs/reference/public-api.md',
  'Public TypeScript API',
  'packages/ui/src/types.ts',
  'Import components and types through `@idiom/ui`. This reference is generated from the public source on every docs build.\n\n```ts\n' +
    types.trim() +
    '\n```',
);
console.log('Synced architecture, semantic layer, verification, comparisons, and public types.');
