import {
  DANGEROUSLY_SET_INNER_HTML_RULE,
  runSecurityScan as runSecurityScanCore,
} from '@framework-doctor/core';

const REACT_PLUGIN = 'react-doctor';

const REACT_SECURITY_RULES = [DANGEROUSLY_SET_INNER_HTML_RULE];

export const runSecurityScan = async (rootDirectory: string, includePaths: string[]) =>
  runSecurityScanCore(rootDirectory, includePaths, {
    plugin: REACT_PLUGIN,
    rules: REACT_SECURITY_RULES,
  });
