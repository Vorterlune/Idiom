import { spawnSync } from 'node:child_process';
import {
  accessSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error('Run this check with pnpm run verify:package.');

function run(args, cwd = root) {
  const env = { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' };
  const inheritedPath =
    Object.entries(env).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? '';
  for (const key of Object.keys(env)) {
    if (key.toLowerCase() === 'path' || key === 'NODE_PATH') delete env[key];
  }
  env.PATH = [
    join(cwd, 'node_modules', '.bin'),
    ...inheritedPath.split(delimiter).filter((entry) => !entry.includes('node_modules')),
  ].join(delimiter);
  const result = spawnSync(process.execPath, [pnpmCli, ...args], {
    cwd,
    stdio: 'inherit',
    env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pnpm ${args.join(' ')} failed (${result.status}).`);
}

function version(name) {
  return require(`${name}/package.json`).version;
}

function write(directory, name, contents) {
  writeFileSync(join(directory, name), contents);
}

const artifacts = join(root, '.artifacts');
mkdirSync(artifacts, { recursive: true });
const packDirectory = mkdtempSync(join(artifacts, 'package-'));
run(['--filter', '@idiom/ui', 'pack', '--pack-destination', packDirectory]);
const archive = readdirSync(packDirectory).find((name) => name.endsWith('.tgz'));
if (!archive) throw new Error('Package build did not produce a tarball.');

// An external directory prevents the fixture from resolving workspace node_modules.
const consumer = mkdtempSync(join(tmpdir(), 'idiom-consumer-'));
if (resolve(consumer).startsWith(resolve(root) + sep)) {
  throw new Error('Consumer verification must run outside the repository.');
}
console.log(`Clean consumer: ${consumer}`);
const dependencies = Object.fromEntries(
  [
    'expo',
    '@expo/ui',
    'expo-build-properties',
    'react',
    'react-dom',
    'react-native',
    'react-native-safe-area-context',
  ].map((name) => [name, version(name)]),
);
dependencies['@idiom/ui'] = `file:${join(packDirectory, archive).replaceAll('\\', '/')}`;
write(
  consumer,
  'package.json',
  JSON.stringify(
    {
      name: 'idiom-consumer-verification',
      private: true,
      version: '1.0.0',
      main: 'index.js',
      packageManager: JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).packageManager,
      dependencies,
      devDependencies: Object.fromEntries(
        ['typescript', '@types/react', '@babel/core', 'babel-preset-expo'].map((name) => [
          name,
          version(name),
        ]),
      ),
    },
    null,
    2,
  ),
);
write(
  consumer,
  'pnpm-workspace.yaml',
  'packages: ["."]\nnodeLinker: hoisted\nautoInstallPeers: false\nallowBuilds:\n  unrs-resolver: true\n',
);
write(
  consumer,
  'app.json',
  JSON.stringify({
    expo: {
      name: 'Idiom consumer',
      slug: 'idiom-consumer',
      platforms: ['ios', 'android'],
      ios: { bundleIdentifier: 'dev.vorterlune.idiom.consumer' },
      android: { package: 'dev.vorterlune.idiom.consumer' },
      plugins: [['expo-build-properties', { ios: { enableSceneSupport: true } }]],
    },
  }),
);
write(consumer, 'babel.config.cjs', "module.exports = { presets: ['babel-preset-expo'] };\n");
write(
  consumer,
  'tsconfig.json',
  JSON.stringify({
    extends: 'expo/tsconfig.base',
    compilerOptions: { strict: true, noEmit: true },
    include: ['App.tsx'],
  }),
);
write(
  consumer,
  'index.js',
  "import { registerRootComponent } from 'expo';\nimport App from './App';\nregisterRootComponent(App);\n",
);
write(
  consumer,
  'App.tsx',
  `import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { EmptyState, IdiomProvider, SearchBar, Settings } from '@idiom/ui';
import type { SettingsPickerOption, SettingsToggleProps } from '@idiom/ui';

const options: readonly SettingsPickerOption<'system' | 'dark'>[] = [{label:'System',value:'system'}, {label:'Dark',value:'dark'}];
function PreferencesSection({ value, onValueChange }: Pick<SettingsToggleProps, 'value' | 'onValueChange'>) {
  return <Settings.Section title="Wrapped section"><><Settings.Toggle label="Wrapped toggle" value={value} onValueChange={onValueChange} /></></Settings.Section>;
}

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [query, setQuery] = useState('');
  const [appearance, setAppearance] = useState<'system' | 'dark'>('system');
  return <SafeAreaProvider><IdiomProvider appearance={appearance}>
    <Settings.Screen title="Consumer" header={<SearchBar value={query} onChangeText={setQuery} />}>
      <Settings.Section title="Preferences">
        <Settings.Toggle icon="notifications" label="Notifications" value={enabled} onValueChange={setEnabled} />
        <Settings.Picker label="Appearance" value={appearance} options={options} onValueChange={setAppearance} />
        <Settings.Link label="Details" onPress={() => setQuery('details')} />
        <Settings.Value label="Version" value="0.1.0" />
        <Settings.Row label="Read only" trailing={<Text>Custom content</Text>} />
      </Settings.Section>
      <PreferencesSection value={enabled} onValueChange={setEnabled} />
      {query ? <EmptyState title="No results" action={{label:'Clear',onPress:() => setQuery('')}} /> : null}
    </Settings.Screen>
  </IdiomProvider></SafeAreaProvider>;
}
`,
);
run(['install', '--ignore-workspace'], consumer);
const consumerRequire = createRequire(join(consumer, 'package.json'));
const installedPackage = dirname(realpathSync(consumerRequire.resolve('@idiom/ui/package.json')));
if (!installedPackage.startsWith(realpathSync(consumer) + sep)) {
  throw new Error('Consumer resolved the library outside its own installation.');
}
for (const file of [
  'src/index.ts',
  'dist/index.js',
  'dist/index.d.ts',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
]) {
  accessSync(join(installedPackage, file));
}
run(['exec', 'tsc', '--noEmit'], consumer);
run(['exec', 'expo', 'export', '--platform', 'ios', '--platform', 'android'], consumer);
write(
  artifacts,
  'consumer-verification.json',
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      consumer,
      archive: join(packDirectory, archive),
      checks: ['install', 'public-types', 'ios-bundle', 'android-bundle'],
      nativeBuilds: 'Not run: use the native verification checklist.',
    },
    null,
    2,
  ),
);
console.log('Packed consumer installation, public types, and iOS/Android bundling passed.');
console.log('Native compilation and device behavior require the separate native release gates.');
