/**
 * INTENTIONAL SECURITY ISSUES for vue-doctor testing.
 * These are dangerous patterns that should be flagged by linters.
 */

export const dangerousEval = (userInput: string): unknown => eval(userInput);

export const dangerousFunction = (userCode: string): (() => void) =>
  new Function(userCode) as () => void;

export const dangerousTimeout = (): void => {
  setTimeout("console.log('arbitrary code')", 100);
};
