import {
  getFrameworkProfile,
  HARDCODED_SECRET_RULES,
  NO_V_HTML_RULE,
  runProjectSecurityScan,
  runSecurityScan as runSecurityScanCore,
  SOURCE_FILE_PATTERN_WITH_VUE,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const VUE_PLUGIN = 'vue-doctor';

const VUE_SECURITY_RULES = [...UNIVERSAL_SECURITY_RULES, ...HARDCODED_SECRET_RULES, NO_V_HTML_RULE];

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
  framework?: string,
) => {
  const regexDiagnostics = await runSecurityScanCore(rootDirectory, includePaths, {
    plugin: VUE_PLUGIN,
    rules: VUE_SECURITY_RULES,
    filePattern: SOURCE_FILE_PATTERN_WITH_VUE,
  });
  const profile = framework ? getFrameworkProfile(VUE_PLUGIN, framework) : null;
  const projectDiagnostics = profile ? runProjectSecurityScan(rootDirectory, profile) : [];
  return [...regexDiagnostics, ...projectDiagnostics];
};
