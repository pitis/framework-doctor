import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/run-cli.js';

interface RuntimeCall {
  framework: 'svelte' | 'react' | 'vue' | 'angular';
  doctorArguments: string[];
}

interface RuntimeHarness {
  calls: RuntimeCall[];
  logs: string[];
  errors: string[];
}

const createProjectDirectory = (packageJson: Record<string, unknown>): string => {
  const directoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'framework-doctor-cli-'));
  fs.writeFileSync(path.join(directoryPath, 'package.json'), JSON.stringify(packageJson));
  return directoryPath;
};

const cleanupDirectories = (directoryPaths: string[]): void => {
  for (const directoryPath of directoryPaths) {
    fs.rmSync(directoryPath, { recursive: true, force: true });
  }
};

const createRuntimeHarness = (): RuntimeHarness => ({
  calls: [],
  logs: [],
  errors: [],
});

const createRuntime = (
  runtimeHarness: RuntimeHarness,
  watchCalls: Array<{ directoryPath: string }> = [],
) => ({
  log: (message: string) => {
    runtimeHarness.logs.push(message);
  },
  error: (message: string) => {
    runtimeHarness.errors.push(message);
  },
  runDoctor: (
    framework: 'svelte' | 'react' | 'vue' | 'angular',
    doctorArguments: string[],
  ): number => {
    runtimeHarness.calls.push({ framework, doctorArguments });
    return 0;
  },
  wireWatchMode: (directoryPath: string) => {
    watchCalls.push({ directoryPath });
    return {
      close: () => Promise.resolve(),
      on: () => undefined,
      add: () => undefined,
      unwatch: () => undefined,
      removeAllListeners: () => undefined,
      getWatched: () => ({}),
      ref: () => undefined,
      unref: () => undefined,
    };
  },
});

describe('main', () => {
  const directoryPathsToCleanup: string[] = [];

  afterEach(() => {
    cleanupDirectories(directoryPathsToCleanup);
    directoryPathsToCleanup.length = 0;
    vi.restoreAllMocks();
  });

  it('runs detected framework doctor for React project', () => {
    const reactProjectDirectory = createProjectDirectory({
      name: 'react-project',
      dependencies: { react: '^19.0.0' },
    });
    directoryPathsToCleanup.push(reactProjectDirectory);
    const runtimeHarness = createRuntimeHarness();
    const runtime = createRuntime(runtimeHarness);

    const exitCode = main([reactProjectDirectory, '--score'], runtime);

    expect(exitCode).toBe(0);
    expect(runtimeHarness.calls).toHaveLength(1);
    expect(runtimeHarness.calls[0]?.framework).toBe('react');
    expect(runtimeHarness.calls[0]?.doctorArguments[0]).toBe(reactProjectDirectory);
    expect(runtimeHarness.calls[0]?.doctorArguments[1]).toBe('--score');
  });

  it('fails when framework detection is ambiguous', () => {
    const ambiguousProjectDirectory = createProjectDirectory({
      name: 'ambiguous-project',
      dependencies: { react: '^19.0.0', vue: '^3.0.0' },
    });
    directoryPathsToCleanup.push(ambiguousProjectDirectory);
    const runtimeHarness = createRuntimeHarness();
    const runtime = createRuntime(runtimeHarness);

    const exitCode = main([ambiguousProjectDirectory], runtime);

    expect(exitCode).toBe(1);
    expect(runtimeHarness.calls).toHaveLength(0);
    expect(runtimeHarness.errors[0]).toContain('Detected multiple frameworks');
  });

  it('fails on unsupported framework value', () => {
    const runtimeHarness = createRuntimeHarness();
    const runtime = createRuntime(runtimeHarness);

    const exitCode = main(['--framework', 'solid'], runtime);

    expect(exitCode).toBe(1);
    expect(runtimeHarness.calls).toHaveLength(0);
    expect(runtimeHarness.errors[0]).toContain('Unsupported framework "solid"');
  });

  it('runs in watch mode and wires watcher', () => {
    const angularProjectDirectory = createProjectDirectory({
      name: 'angular-project',
      dependencies: { '@angular/core': '^19.0.0' },
    });
    directoryPathsToCleanup.push(angularProjectDirectory);
    const runtimeHarness = createRuntimeHarness();
    const watchCalls: Array<{ directoryPath: string }> = [];
    const runtime = createRuntime(runtimeHarness, watchCalls);

    const exitCode = main([angularProjectDirectory, '--watch'], runtime);

    expect(exitCode).toBe(0);
    expect(runtimeHarness.calls).toHaveLength(1);
    expect(runtimeHarness.calls[0]?.framework).toBe('angular');
    expect(watchCalls).toHaveLength(1);
    expect(watchCalls[0]?.directoryPath).toBe(angularProjectDirectory);
    expect(runtimeHarness.logs[0]).toContain('Watching for changes');
  });
});
