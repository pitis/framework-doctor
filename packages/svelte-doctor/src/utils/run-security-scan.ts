import {
  getFrameworkProfile,
  HARDCODED_SECRET_RULES,
  NO_AT_HTML_RULE,
  runProjectSecurityScan,
  runSecurityScan as runSecurityScanCore,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const SVELTE_PLUGIN = 'svelte-doctor';

const SVELTE_SECURITY_RULES = [
  ...UNIVERSAL_SECURITY_RULES,
  ...HARDCODED_SECRET_RULES,
  NO_AT_HTML_RULE,
];

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
  framework?: string,
) => {
  const regexDiagnostics = await runSecurityScanCore(rootDirectory, includePaths, {
    plugin: SVELTE_PLUGIN,
    rules: SVELTE_SECURITY_RULES,
  });
  const profile = framework ? getFrameworkProfile(SVELTE_PLUGIN, framework) : null;
  const projectDiagnostics = profile ? runProjectSecurityScan(rootDirectory, profile) : [];
  return [...regexDiagnostics, ...projectDiagnostics];
};
