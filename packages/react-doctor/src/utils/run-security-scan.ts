import {
  DANGEROUSLY_SET_INNER_HTML_RULE,
  getFrameworkProfile,
  HARDCODED_SECRET_RULES,
  runProjectSecurityScan,
  runSecurityScan as runSecurityScanCore,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const REACT_PLUGIN = 'react-doctor';

const REACT_SECURITY_RULES = [
  ...UNIVERSAL_SECURITY_RULES,
  ...HARDCODED_SECRET_RULES,
  DANGEROUSLY_SET_INNER_HTML_RULE,
];

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
  framework?: string,
) => {
  const regexDiagnostics = await runSecurityScanCore(rootDirectory, includePaths, {
    plugin: REACT_PLUGIN,
    rules: REACT_SECURITY_RULES,
  });
  const profile = framework ? getFrameworkProfile(REACT_PLUGIN, framework) : null;
  const projectDiagnostics = profile ? runProjectSecurityScan(rootDirectory, profile) : [];
  return [...regexDiagnostics, ...projectDiagnostics];
};
