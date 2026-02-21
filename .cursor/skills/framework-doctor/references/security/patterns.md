# Security Patterns (WRONG vs CORRECT)

Cross-framework security patterns.

## Dynamic Code Execution

```javascript
// WRONG - arbitrary code execution
eval(userInput);
new Function(userCode)();

// WRONG - implied eval
setTimeout("console.log('hi')", 100);
setInterval('doSomething()', 1000);
```

```javascript
// CORRECT - use callback functions
setTimeout(() => console.log('hi'), 100);
setInterval(doSomething, 1000);

// CORRECT - use structured data instead of code strings
const config = JSON.parse(userInput);
```

## URL Validation

User-provided URLs in `href` can be `javascript:...` or malicious. Always validate.

```svelte
<!-- WRONG -->
<a href={userProvidedUrl}>Visit</a>
```

```svelte
<!-- CORRECT -->
<a href={validateUrl(userProvidedUrl) ?? '#'}>Visit</a>
```

Use `node:url` or a URL parser. Reject `javascript:`, `data:`, or invalid URLs.

## HTML Sanitization

If you must render user-provided HTML:

```javascript
// WRONG - raw user HTML
{@html userContent}
```

```javascript
// CORRECT - sanitize first
import DOMPurify from "dompurify";
{@html DOMPurify.sanitize(userContent)}
```

Or use `sanitize-html`. Prefer rendering as text when possible.
