import {
  NO_BYPASS_SECURITY_TRUST_RULE,
  NO_INNER_HTML_BINDING_RULE,
  runSecurityScan as runSecurityScanCore,
  SOURCE_FILE_PATTERN_WITH_ANGULAR,
  UNIVERSAL_SECURITY_RULES,
} from '@framework-doctor/core';

const ANGULAR_PLUGIN = 'angular-doctor';

const ANGULAR_SECURITY_RULES = [
  ...UNIVERSAL_SECURITY_RULES,
  NO_INNER_HTML_BINDING_RULE,
  NO_BYPASS_SECURITY_TRUST_RULE,
];

export const runSecurityScan = async (rootDirectory: string, includePaths: string[]) =>
  runSecurityScanCore(rootDirectory, includePaths, {
    plugin: ANGULAR_PLUGIN,
    rules: ANGULAR_SECURITY_RULES,
    filePattern: SOURCE_FILE_PATTERN_WITH_ANGULAR,
  });
