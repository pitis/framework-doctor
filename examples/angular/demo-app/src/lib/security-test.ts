/**
 * INTENTIONAL SECURITY ISSUES for angular-doctor testing.
 * These are dangerous patterns that should be flagged by linters.
 */

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export const dangerousEval = (userInput: string): unknown => eval(userInput);

export const dangerousFunction = (userCode: string): (() => void) =>
  new Function(userCode) as () => void;

export const dangerousTimeout = (): void => {
  setTimeout("console.log('arbitrary code')", 100);
};

export const dangerousBypass = (sanitizer: DomSanitizer, html: string): SafeHtml =>
  sanitizer.bypassSecurityTrustHtml(html);
