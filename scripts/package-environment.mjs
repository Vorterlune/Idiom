import { delimiter, isAbsolute, join, relative, resolve, sep } from 'node:path';

export function packageEnvironment(cwd, workspaceRoot, inherited = process.env) {
  const env = { ...inherited, CI: '1', EXPO_NO_TELEMETRY: '1' };
  const inheritedPath =
    Object.entries(env).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? '';
  for (const key of Object.keys(env)) {
    if (['path', 'node_path'].includes(key.toLowerCase())) delete env[key];
  }
  env.PATH = [
    join(cwd, 'node_modules', '.bin'),
    ...inheritedPath.split(delimiter).filter((entry) => {
      if (!entry) return false;
      const location = relative(resolve(workspaceRoot), resolve(entry));
      // Exclude workspace binaries without removing external package-manager installs.
      // pnpm/action-setup itself installs pnpm under setup-pnpm/node_modules/.bin.
      return location === '..' || location.startsWith(`..${sep}`) || isAbsolute(location);
    }),
  ].join(delimiter);
  return env;
}
