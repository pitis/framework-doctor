/**
 * INTENTIONAL SECURITY ISSUES for svelte-doctor testing.
 * These are dangerous patterns that should be flagged by linters.
 */

// SECURITY: eval() - arbitrary code execution, oxlint no-eval should catch
export function dangerousEval(userInput: string): unknown {
  return eval(userInput);
}

// SECURITY: new Function() - code injection, oxlint no-implied-eval should catch
export function dangerousFunction(userCode: string): () => void {
  return new Function(userCode) as () => void;
}

// SECURITY: setTimeout with string - implied eval, oxlint should catch
export function dangerousTimeout(): void {
  setTimeout("console.log('arbitrary code')", 100);
}
