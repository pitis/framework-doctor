import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic } from '../types.js';
import { COMMENT_ONLY_LINE_PATTERN } from './constants.js';
import { getFilesToScan, SOURCE_FILE_PATTERN_FULL } from './get-files-to-scan.js';
import type { SecurityRule } from './rule.js';

interface MatchLocation {
  line: number;
  column: number;
}

const findMatches = (
  content: string,
  regex: RegExp,
  skipCommentOnlyLines = false,
): MatchLocation[] => {
  const results: MatchLocation[] = [];
  const lines = content.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (skipCommentOnlyLines && COMMENT_ONLY_LINE_PATTERN.test(line)) {
      continue;
    }
    const regexCopy = new RegExp(regex.source, regex.flags);
    const isGlobalRegex = regexCopy.global || regexCopy.sticky;
    let match: RegExpExecArray | null;
    while ((match = regexCopy.exec(line)) !== null) {
      results.push({ line: lineIndex + 1, column: match.index });
      if (!isGlobalRegex) {
        break;
      }
      if (match[0].length === 0) {
        regexCopy.lastIndex += 1;
      }
    }
  }
  return results;
};

const ruleAppliesToFile = (rule: SecurityRule, filePath: string): boolean => {
  const extension = path.extname(filePath).toLowerCase();
  return rule.fileExtensions.includes(extension);
};

export interface RunSecurityScanOptions {
  plugin: string;
  rules: SecurityRule[];
  filePattern?: RegExp;
}

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
  options: RunSecurityScanOptions,
): Promise<Diagnostic[]> => {
  const pattern = options.filePattern ?? SOURCE_FILE_PATTERN_FULL;
  const files = getFilesToScan(rootDirectory, includePaths, pattern);
  const diagnostics: Diagnostic[] = [];

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const rule of options.rules) {
        if (!ruleAppliesToFile(rule, filePath)) continue;
        const matches = findMatches(content, rule.pattern, rule.skipCommentOnlyLines === true);
        for (const { line, column } of matches) {
          diagnostics.push({
            filePath,
            plugin: options.plugin,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
            help: rule.help,
            line,
            column,
            category: 'security',
          });
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return diagnostics;
};
