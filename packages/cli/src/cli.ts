import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { WATCH_DEBOUNCE_MS } from './constants.js';

type Framework = 'svelte' | 'react' | 'vue' | 'angular';

interface FrameworkDefinition {
  doctorPackage: string;
  frameworkLabel: string;
  dependencyIndicators: string[];
}

interface FrameworkDetectionResult {
  detectedFramework: Framework | null;
  matchedFrameworks: Framework[];
}

interface ParsedCliArguments {
  directoryPath: string;
  doctorArguments: string[];
  shouldWatch: boolean;
  forcedFramework: Framework | null;
}

const FRAMEWORK_DEFINITIONS: Record<Framework, FrameworkDefinition> = {
  svelte: {
    doctorPackage: '@framework-doctor/svelte',
    frameworkLabel: 'Svelte',
    dependencyIndicators: ['svelte', '@sveltejs/kit'],
  },
  react: {
    doctorPackage: '@framework-doctor/react',
    frameworkLabel: 'React',
    dependencyIndicators: ['react', 'next', 'remix'],
  },
  vue: {
    doctorPackage: '@framework-doctor/vue',
    frameworkLabel: 'Vue',
    dependencyIndicators: ['vue', 'nuxt'],
  },
  angular: {
    doctorPackage: '@framework-doctor/angular',
    frameworkLabel: 'Angular',
    dependencyIndicators: ['@angular/core'],
  },
};

const readPackageDependencies = (directoryPath: string): Record<string, string> | null => {
  const packagePath = path.join(directoryPath, 'package.json');
  try {
    const require = createRequire(import.meta.url);
    const packageJson = require(packagePath) as Record<string, unknown>;
    return {
      ...(packageJson.dependencies as Record<string, string>),
      ...(packageJson.devDependencies as Record<string, string>),
      ...(packageJson.peerDependencies as Record<string, string>),
    };
  } catch {
    return null;
  }
};

const detectFramework = (directoryPath: string): FrameworkDetectionResult => {
  const dependencyMap = readPackageDependencies(directoryPath);
  if (!dependencyMap) {
    return { detectedFramework: null, matchedFrameworks: [] };
  }

  const matchedFrameworks = (Object.keys(FRAMEWORK_DEFINITIONS) as Framework[]).filter(
    (frameworkName) =>
      FRAMEWORK_DEFINITIONS[frameworkName].dependencyIndicators.some(
        (dependencyName) => dependencyMap[dependencyName] !== undefined,
      ),
  );

  if (matchedFrameworks.length !== 1) {
    return { detectedFramework: null, matchedFrameworks };
  }

  return {
    detectedFramework: matchedFrameworks[0],
    matchedFrameworks,
  };
};

const resolveDoctorCli = (pkg: string): string => {
  const require = createRequire(import.meta.url);
  const indexPath = require.resolve(pkg);
  return path.join(path.dirname(indexPath), 'cli.js');
};

const runDoctor = (framework: Framework, doctorArguments: string[]): number => {
  const cwd = process.cwd();
  const frameworkDefinition = FRAMEWORK_DEFINITIONS[framework];
  const cliPath = resolveDoctorCli(frameworkDefinition.doctorPackage);
  const result = spawnSync(process.execPath, [cliPath, ...doctorArguments], {
    stdio: 'inherit',
    cwd,
  });
  return result.status ?? 1;
};

const isFramework = (frameworkValue: string): frameworkValue is Framework =>
  (Object.keys(FRAMEWORK_DEFINITIONS) as Framework[]).includes(frameworkValue as Framework);

const parseFrameworkArgument = (rawArguments: string[]): string | null => {
  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const currentArgument = rawArguments[argumentIndex];
    if (currentArgument === '--framework') {
      return rawArguments[argumentIndex + 1] ?? null;
    }
    if (currentArgument.startsWith('--framework=')) {
      return currentArgument.slice('--framework='.length);
    }
  }
  return null;
};

const parseCliArguments = (rawArguments: string[]): ParsedCliArguments => {
  const forcedFrameworkValue = parseFrameworkArgument(rawArguments);
  const forcedFramework =
    forcedFrameworkValue && isFramework(forcedFrameworkValue) ? forcedFrameworkValue : null;

  const shouldWatch = rawArguments.includes('--watch') || rawArguments.includes('-w');

  const argumentsWithoutCliFlags: string[] = [];
  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const currentArgument = rawArguments[argumentIndex];
    if (currentArgument === '--watch' || currentArgument === '-w') {
      continue;
    }
    if (currentArgument === '--framework') {
      argumentIndex += 1;
      continue;
    }
    if (currentArgument.startsWith('--framework=')) {
      continue;
    }
    argumentsWithoutCliFlags.push(currentArgument);
  }

  const directoryIndex = argumentsWithoutCliFlags.findIndex(
    (currentArgument) => !currentArgument.startsWith('-'),
  );
  const directoryPath =
    directoryIndex >= 0
      ? path.resolve(process.cwd(), argumentsWithoutCliFlags[directoryIndex])
      : process.cwd();
  const doctorOptions =
    directoryIndex >= 0
      ? [
          ...argumentsWithoutCliFlags.slice(0, directoryIndex),
          ...argumentsWithoutCliFlags.slice(directoryIndex + 1),
        ]
      : argumentsWithoutCliFlags;

  return {
    directoryPath,
    doctorArguments: [directoryPath, ...doctorOptions],
    shouldWatch,
    forcedFramework,
  };
};

const printUnsupportedFrameworkValue = (frameworkValue: string): void => {
  const supportedFrameworkNames = (Object.keys(FRAMEWORK_DEFINITIONS) as Framework[]).join(', ');
  console.error(
    `Unsupported framework "${frameworkValue}". Supported values: ${supportedFrameworkNames}.`,
  );
};

const printFrameworkDetectionError = (
  directoryPath: string,
  matchedFrameworks: Framework[],
): void => {
  const hasAmbiguousMatch = matchedFrameworks.length > 1;
  const matchedFrameworkLabels = matchedFrameworks
    .map((frameworkName) => FRAMEWORK_DEFINITIONS[frameworkName].frameworkLabel)
    .join(', ');

  const detectionMessage = hasAmbiguousMatch
    ? `Detected multiple frameworks in ${directoryPath}: ${matchedFrameworkLabels}.`
    : `Could not detect a supported framework in ${directoryPath}.`;

  console.error(`
  ${detectionMessage}

  Supported: Svelte, React, Vue, Angular

  Make sure you're in a project root with a package.json that includes:
  - Svelte: "svelte" or "@sveltejs/kit"
  - React: "react", "next", or "remix"
  - Vue: "vue" or "nuxt"
  - Angular: "@angular/core"

  You can also force a framework:
  - npx @framework-doctor/cli . --framework svelte
  - npx @framework-doctor/cli . --framework react
  - npx @framework-doctor/cli . --framework vue
  - npx @framework-doctor/cli . --framework angular

  Or run a specific doctor directly:
  - npx @framework-doctor/svelte .
  - npx @framework-doctor/react .
  - npx @framework-doctor/vue .
  - npx @framework-doctor/angular .
`);
};

const wireWatchMode = (directoryPath: string, runScan: () => void): FSWatcher => {
  const watcher = chokidar.watch(directoryPath, {
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

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  watcher.on('all', (eventName) => {
    if (eventName !== 'add' && eventName !== 'change' && eventName !== 'unlink') {
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runScan();
    }, WATCH_DEBOUNCE_MS);
  });

  return watcher;
};

const main = (): number => {
  const rawArgs = process.argv.slice(2);
  const forcedFrameworkValue = parseFrameworkArgument(rawArgs);
  if (forcedFrameworkValue && !isFramework(forcedFrameworkValue)) {
    printUnsupportedFrameworkValue(forcedFrameworkValue);
    return 1;
  }

  const { directoryPath, doctorArguments, forcedFramework, shouldWatch } =
    parseCliArguments(rawArgs);
  const detectionResult = detectFramework(directoryPath);
  const frameworkToRun = forcedFramework ?? detectionResult.detectedFramework;

  if (!frameworkToRun) {
    printFrameworkDetectionError(directoryPath, detectionResult.matchedFrameworks);
    return 1;
  }

  if (!shouldWatch) {
    return runDoctor(frameworkToRun, doctorArguments);
  }

  const runScan = () => {
    runDoctor(frameworkToRun, doctorArguments);
  };

  runScan();
  console.log('\nWatching for changes... (Ctrl+C to stop)\n');
  wireWatchMode(directoryPath, runScan);
  return 0;
};

process.exit(main());
