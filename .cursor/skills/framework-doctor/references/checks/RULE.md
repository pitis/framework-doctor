# What Framework Doctor Checks

Framework Doctor runs multiple tools and rules to produce a 0-100 score with actionable diagnostics.

## By Framework

| Area          | Svelte                                                                  | React                                 |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| **Security**  | {@html}, eval(), new Function(), setTimeout("string"), javascript: URLs | dangerouslySetInnerHTML, eval(), etc. |
| **Framework** | svelte-check (types, a11y, warnings)                                    | typecheck                             |
| **Dead code** | Knip (unused exports, files, dependencies)                              | Knip                                  |
| **Lint**      | oxlint (JS/TS)                                                          | oxlint                                |

## Security Rules

- **{@html}** with unsanitized user content — XSS risk
- **new Function()** — code injection
- **eval()** — arbitrary code execution
- **setTimeout("string")** / **setInterval("string")** — implied eval
- **javascript:** URLs in href — XSS
- **<a href={userInput}>** — validate/sanitize URLs

## Svelte Checks

- svelte-check: TypeScript, a11y, compiler warnings
- Knip: Unused exports, orphan files, unused dependencies
- oxlint: Fast JS/TS linting

## React Checks

- Typecheck: TypeScript
- Knip: Unused exports, orphan files, unused dependencies
- oxlint: Fast JS/TS linting
