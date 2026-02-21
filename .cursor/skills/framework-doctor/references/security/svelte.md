# Svelte Security

Svelte-specific security patterns and anti-patterns.

## {@html} with Unsanitized User Content

```svelte
<!-- WRONG - XSS vulnerability -->
{@html userInput}

<!-- WRONG - still dangerous -->
{@html userProvidedHtml}
```

```svelte
<!-- CORRECT - render as text -->
{userInput}

<!-- CORRECT - sanitize first if HTML required -->
{@html sanitizeHtml(userProvidedHtml)}
```

Use `sanitize-html` or DOMPurify before `{@html}` if HTML is required. Prefer rendering user content as text.

## javascript: URLs and Unsafe href

```svelte
<!-- WRONG - XSS -->
<a href={userInput}>Link</a>
<a href="javascript:alert(1)">Link</a>
```

```svelte
<!-- CORRECT - validate URLs -->
<a href={isValidUrl(userInput) ? userInput : '#'}>Link</a>

<!-- CORRECT - use proper event handlers -->
<button on:click={handleClick}>Action</button>
```

Use `node:url` or a URL parser to validate links. Use `#` or proper click handlers instead of `javascript:` URLs.

## Avoid

- **{@html}** with unsanitized user content — XSS. Sanitize first or use text.
- **new Function()** — code injection. Use structured data instead.
- **eval()** — arbitrary code execution.
- **setTimeout("string")** / **setInterval("string")** — implied eval.
- **javascript:** URLs in href — XSS. Use `#` or proper handlers.
- **<a href={userInput}>** — validate/sanitize URLs.
