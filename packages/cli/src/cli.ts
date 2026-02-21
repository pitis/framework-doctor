import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

type Framework = 'svelte' | 'react' | 'vue' | 'angular' | null;

const detectFramework = (directory: string): Framework => {
  const packagePath = path.join(directory, 'package.json');
  try {
    const require = createRequire(import.meta.url);
    const pkg = require(packagePath) as Record<string, unknown>;
    const deps = {
      ...(pkg.dependencies as Record<string, string>),
      ...(pkg.devDependencies as Record<string, string>),
      ...(pkg.peerDependencies as Record<string, string>),
    } as Record<string, string>;

    if (deps.svelte || deps['@sveltejs/kit']) return 'svelte';
    if (deps.react || deps['next'] || deps['remix']) return 'react';
    if (deps.vue || deps['nuxt']) return 'vue';
    if (deps['@angular/core']) return 'angular';

    return null;
  } catch {
    return null;
  }
};

const resolveDoctorCli = (pkg: string): string => {
  const require = createRequire(import.meta.url);
  const indexPath = require.resolve(pkg);
  return path.join(path.dirname(indexPath), 'cli.js');
};

const runDoctor = (framework: Framework, args: string[]): number => {
  const cwd = process.cwd();
  const dirArg = args[0] ?? cwd;
  const restArgs = args[0] ? args.slice(1) : args;

  if (framework === 'svelte') {
    const cliPath = resolveDoctorCli('@framework-doctor/svelte');
    const fullArgs = [dirArg, ...restArgs];
    const result = spawnSync(process.execPath, [cliPath, ...fullArgs], {
      stdio: 'inherit',
      cwd,
    });
    return result.status ?? 1;
  }

  if (framework === 'react') {
    const cliPath = resolveDoctorCli('@framework-doctor/react');
    const fullArgs = [dirArg, ...restArgs];
    const result = spawnSync(process.execPath, [cliPath, ...fullArgs], {
      stdio: 'inherit',
      cwd,
    });
    return result.status ?? 1;
  }

  if (framework === 'vue' || framework === 'angular') {
    console.error(
      `\n  ${framework} Doctor is coming soon. For now, use the framework-specific package when available.\n`,
    );
    return 1;
  }

  console.error(`
  Could not detect a supported framework in ${dirArg}.

  Supported: Svelte, React, Vue (coming soon), Angular (coming soon)

  Make sure you're in a project root with a package.json that includes:
  - Svelte: "svelte" or "@sveltejs/kit"
  - React: "react", "next", or "remix"
  - Vue: "vue" or "nuxt"
  - Angular: "@angular/core"

  Or run a specific doctor directly:
  - npx @framework-doctor/svelte .
  - npx @framework-doctor/react .
`);
  return 1;
};

const main = (): number => {
  const rawArgs = process.argv.slice(2);
  const dirIndex = rawArgs.findIndex((a) => !a.startsWith('-'));
  const dirArg = dirIndex >= 0 ? path.resolve(process.cwd(), rawArgs[dirIndex]) : process.cwd();
  const restArgs =
    dirIndex >= 0 ? [...rawArgs.slice(0, dirIndex), ...rawArgs.slice(dirIndex + 1)] : rawArgs;

  const framework = detectFramework(dirArg);
  return runDoctor(framework, restArgs.length > 0 ? [dirArg, ...restArgs] : [dirArg]);
};

process.exit(main());
