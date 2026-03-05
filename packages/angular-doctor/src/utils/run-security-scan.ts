import {
  getFrameworkProfile,
  HARDCODED_SECRET_RULES,
  NO_BYPASS_SECURITY_TRUST_RULE,
  NO_INNER_HTML_BINDING_RULE,
  runProjectSecurityScan,
  runSecurityScan as runSecurityScanCore,
  SOURCE_FILE_PATTERN_WITH_ANGULAR,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const ANGULAR_PLUGIN = 'angular-doctor';

const ANGULAR_SECURITY_RULES = [
  ...UNIVERSAL_SECURITY_RULES,
  ...HARDCODED_SECRET_RULES,
  NO_INNER_HTML_BINDING_RULE,
  NO_BYPASS_SECURITY_TRUST_RULE,
];

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
  framework?: string,
) => {
  const regexDiagnostics = await runSecurityScanCore(rootDirectory, includePaths, {
    plugin: ANGULAR_PLUGIN,
    rules: ANGULAR_SECURITY_RULES,
    filePattern: SOURCE_FILE_PATTERN_WITH_ANGULAR,
  });
  const profile = framework ? getFrameworkProfile(ANGULAR_PLUGIN, framework) : null;
  const projectDiagnostics = profile ? runProjectSecurityScan(rootDirectory, profile) : [];
  return [...regexDiagnostics, ...projectDiagnostics];
};
