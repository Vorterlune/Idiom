import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';

import { packageEnvironment } from './package-environment.mjs';

test('keeps runner-installed pnpm while isolating the external consumer from workspace bins', () => {
  const runner = join(tmpdir(), 'runner');
  const workspace = join(runner, 'work', 'Idiom');
  const consumer = join(runner, 'consumer');
  const pnpmHome = join(runner, 'setup-pnpm', 'node_modules', '.bin');
  const nodeBin = join(runner, 'node', 'bin');
  const siblingBin = join(runner, 'work', 'Idiom-tools', 'bin');
  const inherited = {
    Path: [
      join(workspace, 'node_modules', '.bin'),
      join(workspace, 'packages', 'ui', 'node_modules', '.bin'),
      workspace,
      pnpmHome,
      nodeBin,
      siblingBin,
      '',
    ].join(delimiter),
    NODE_PATH: join(workspace, 'node_modules'),
    PNPM_HOME: pnpmHome,
  };

  const env = packageEnvironment(consumer, workspace, inherited);

  assert.deepEqual(env.PATH.split(delimiter), [
    join(consumer, 'node_modules', '.bin'),
    pnpmHome,
    nodeBin,
    siblingBin,
  ]);
  assert.equal(env.Path, undefined);
  assert.equal(env.NODE_PATH, undefined);
  assert.equal(env.PNPM_HOME, pnpmHome);
  assert.equal(env.CI, '1');
  assert.equal(env.EXPO_NO_TELEMETRY, '1');
  assert.equal(inherited.NODE_PATH, join(workspace, 'node_modules'));
});

test('packing retains the workspace build binaries and external pnpm', () => {
  const workspace = join(tmpdir(), 'Idiom');
  const pnpmHome = join(tmpdir(), 'setup-pnpm', 'node_modules', '.bin');
  const env = packageEnvironment(workspace, workspace, {
    PATH: [join(workspace, 'node_modules', '.bin'), pnpmHome].join(delimiter),
  });
  assert.deepEqual(env.PATH.split(delimiter), [join(workspace, 'node_modules', '.bin'), pnpmHome]);
});
