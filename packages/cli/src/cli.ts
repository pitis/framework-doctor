import chokidar from 'chokidar';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { WATCH_DEBOUNCE_MS } from './constants.js';

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

  if (framework === 'vue') {
    const cliPath = resolveDoctorCli('@framework-doctor/vue');
    const fullArgs = [dirArg, ...restArgs];
    const result = spawnSync(process.execPath, [cliPath, ...fullArgs], {
      stdio: 'inherit',
      cwd,
    });
    return result.status ?? 1;
  }

  if (framework === 'angular') {
    const cliPath = resolveDoctorCli('@framework-doctor/angular');
    const fullArgs = [dirArg, ...restArgs];
    const result = spawnSync(process.execPath, [cliPath, ...fullArgs], {
      stdio: 'inherit',
      cwd,
    });
    return result.status ?? 1;
  }

  console.error(`
  Could not detect a supported framework in ${dirArg}.

  Supported: Svelte, React, Vue, Angular

  Make sure you're in a project root with a package.json that includes:
  - Svelte: "svelte" or "@sveltejs/kit"
  - React: "react", "next", or "remix"
  - Vue: "vue" or "nuxt"
  - Angular: "@angular/core"

  Or run a specific doctor directly:
  - npx @framework-doctor/svelte .
  - npx @framework-doctor/react .
  - npx @framework-doctor/vue .
`);
  return 1;
};

const filterWatchArgs = (args: string[]): { args: string[]; watch: boolean } => {
  const watchIndex = args.findIndex((a) => a === '--watch' || a === '-w');
  const watch = watchIndex >= 0;
  const argsWithoutWatch =
    watchIndex >= 0 ? [...args.slice(0, watchIndex), ...args.slice(watchIndex + 1)] : args;
  return { args: argsWithoutWatch, watch };
};

const main = (): number => {
  const rawArgs = process.argv.slice(2);
  const { args: processedArgs, watch } = filterWatchArgs(rawArgs);
  const dirIndex = processedArgs.findIndex((a) => !a.startsWith('-'));
  const dirArg =
    dirIndex >= 0 ? path.resolve(process.cwd(), processedArgs[dirIndex]) : process.cwd();
  const restArgs =
    dirIndex >= 0
      ? [...processedArgs.slice(0, dirIndex), ...processedArgs.slice(dirIndex + 1)]
      : processedArgs;
  const doctorArgs = restArgs.length > 0 ? [dirArg, ...restArgs] : [dirArg];

  const framework = detectFramework(dirArg);
  if (!framework) {
    console.error(`
  Could not detect a supported framework in ${dirArg}.

  Supported: Svelte, React, Vue, Angular

  Make sure you're in a project root with a package.json that includes:
  - Svelte: "svelte" or "@sveltejs/kit"
  - React: "react", "next", or "remix"
  - Vue: "vue" or "nuxt"
  - Angular: "@angular/core"

  Or run a specific doctor directly:
  - npx @framework-doctor/svelte .
  - npx @framework-doctor/react .
  - npx @framework-doctor/vue .
`);
    return 1;
  }

  if (!watch) {
    return runDoctor(framework, doctorArgs);
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const runScan = () => {
    runDoctor(framework, doctorArgs);
  };

  runScan();
  console.log('\nWatching for changes... (Ctrl+C to stop)\n');

  const watcher = chokidar.watch(dirArg, {
    ignored: [
      /(^|[/\\])\../,
      /node_modules/,
      /dist/,
      /\.git/,
      /\.turbo/,
      /coverage/,
      /\.next/,
      /\.svelte-kit/,
    ],
  });

  watcher.on('change', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runScan();
    }, WATCH_DEBOUNCE_MS);
  });

  watcher.on('add', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runScan();
    }, WATCH_DEBOUNCE_MS);
  });

  watcher.on('unlink', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runScan();
    }, WATCH_DEBOUNCE_MS);
  });

  return 0;
};

process.exit(main());
