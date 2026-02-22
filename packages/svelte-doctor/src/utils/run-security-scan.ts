import {
  NO_AT_HTML_RULE,
  runSecurityScan as runSecurityScanCore,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const SVELTE_PLUGIN = 'svelte-doctor';

const SVELTE_SECURITY_RULES = [...UNIVERSAL_SECURITY_RULES, NO_AT_HTML_RULE];

export const runSecurityScan = async (rootDirectory: string, includePaths: string[]) =>
  runSecurityScanCore(rootDirectory, includePaths, {
    plugin: SVELTE_PLUGIN,
    rules: SVELTE_SECURITY_RULES,
  });
