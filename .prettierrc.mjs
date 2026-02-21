/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-svelte'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  arrowParens: 'always',
  endOfLine: 'lf',
};
