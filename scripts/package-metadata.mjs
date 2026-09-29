import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

for (const name of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  copyFileSync(
    fileURLToPath(new URL(`../${name}`, import.meta.url)),
    fileURLToPath(new URL(`../packages/ui/${name}`, import.meta.url)),
  );
}
