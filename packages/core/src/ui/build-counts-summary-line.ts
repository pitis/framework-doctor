import type { Diagnostic } from '../types.js';
import { formatElapsedTime } from './format-elapsed-time.js';
import { highlighter } from './highlighter.js';

const collectAffectedFiles = (diagnostics: Diagnostic[]): Set<string> =>
  new Set(diagnostics.map((d) => d.filePath));

export const buildCountsSummaryLine = (
  diagnostics: Diagnostic[],
  totalSourceFileCount: number,
  elapsedMs: number,
): { plain: string; rendered: string } => {
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const affectedCount = collectAffectedFiles(diagnostics).size;
  const elapsed = formatElapsedTime(elapsedMs);

  const plainParts: string[] = [];
  const renderedParts: string[] = [];

  if (errorCount > 0) {
    const text = `✗ ${errorCount} error${errorCount === 1 ? '' : 's'}`;
    plainParts.push(text);
    renderedParts.push(highlighter.error(text));
  }
  if (warningCount > 0) {
    const text = `⚠ ${warningCount} warning${warningCount === 1 ? '' : 's'}`;
    plainParts.push(text);
    renderedParts.push(highlighter.warn(text));
  }

  const fileSuffix = affectedCount === 1 ? '' : 's';
  const fileText =
    totalSourceFileCount > 0
      ? `across ${affectedCount}/${totalSourceFileCount} files`
      : `across ${affectedCount} file${fileSuffix}`;
  const timeText = `in ${elapsed}`;
  plainParts.push(fileText, timeText);
  renderedParts.push(highlighter.dim(fileText), highlighter.dim(timeText));

  return { plain: plainParts.join('  '), rendered: renderedParts.join('  ') };
};
