---
name: framework-doctor
description: |
  Framework Doctor scans Svelte, React, and Vue projects for security, performance, correctness, and architecture issues. Outputs a 0-100 score with actionable diagnostics.

  Use when: reviewing code, finishing a feature, fixing bugs, handling user input or HTML rendering, using eval/dynamic code, or when the user mentions XSS, dead code, svelte-check, knip, oxlint, framework-doctor, react-doctor, svelte-doctor, vue-doctor.

  Triggers on: security patterns, {@html}, v-html, eval(), new Function(), svelte-check, knip, oxlint, Svelte 5 migration, React best practices, Vue/Nuxt patterns.
metadata:
  version: 1.0.0
---

# Framework Doctor

Scans your frontend codebase for security, performance, correctness, and architecture issues. Auto-detects Svelte or React from `package.json`. Outputs a 0-100 score with actionable diagnostics.

**Supported:** Svelte, React, Vue (Angular coming soon)

## IMPORTANT: Run After Making Changes

Run the doctor after refactoring, adding features, or fixing bugs. Fix errors first, then re-run to verify the score improved.

## Quick Decision Trees

### "I need to scan my project"

```
Scan project?
├─ Auto-detect framework → npx -y @framework-doctor/cli . --verbose --diff
├─ Svelte only → npx -y @framework-doctor/svelte . --verbose --diff
├─ React only → npx -y @framework-doctor/react . --verbose --diff
├─ Vue only → npx -y @framework-doctor/vue . --verbose --diff
├─ Flags (verbose, diff, score) → references/cli/commands.md
└─ What gets checked → references/checks/RULE.md
```

### "I'm working with Svelte"

```
Svelte guidance?
├─ Run doctor → npx -y @framework-doctor/svelte . --verbose --diff
├─ Security concerns → references/security/svelte.md
├─ Svelte 5 migration → references/svelte/migration.md
├─ General Svelte patterns → references/svelte/RULE.md
└─ What doctor checks → references/checks/RULE.md
```

### "I'm working with Vue"

```
Vue guidance?
├─ Run doctor → npx -y @framework-doctor/vue . --verbose --diff
├─ Security (v-html) → references/security/vue.md (if exists)
└─ What doctor checks → references/checks/RULE.md
```

### "I'm working with React"

```
React guidance?
├─ Run doctor → npx -y @framework-doctor/react . --verbose --diff
├─ React patterns → references/react/RULE.md
└─ What doctor checks → references/checks/RULE.md
```

### "I'm handling user input or HTML"

```
User input / HTML?
├─ Rendering user content → references/security/patterns.md
├─ {@html} in Svelte → references/security/svelte.md
├─ Dynamic URLs → references/security/patterns.md#url-validation
├─ Dynamic code (eval, new Function) → references/security/patterns.md
└─ Safe patterns overview → references/security/RULE.md
```

## Critical Anti-Patterns

### {@html} with Unsanitized User Content

```svelte
<!-- WRONG - XSS vulnerability -->
{@html userInput}

<!-- CORRECT - render as text -->
{userInput}

<!-- CORRECT - sanitize first if HTML required -->
{@html sanitizeHtml(userProvidedHtml)}
```

See references/security/svelte.md for details.

### String-Based setTimeout/setInterval

```javascript
// WRONG - implied eval
setTimeout('refreshData()', 5000);

// CORRECT - callback function
setTimeout(refreshData, 5000);
```

### Trusting href Without Validation

```svelte
<!-- WRONG -->
<a href={userProvidedUrl}>Visit</a>

<!-- CORRECT -->
<a href={validateUrl(userProvidedUrl) ?? '#'}>Visit</a>
```

## Reference Index

| Topic                                                     | Purpose                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| [cli/RULE.md](./references/cli/RULE.md)                   | Usage overview, unified vs framework-specific CLI             |
| [cli/commands.md](./references/cli/commands.md)           | Flags: --verbose, --diff, --score                             |
| [checks/RULE.md](./references/checks/RULE.md)             | What the doctor checks (security, svelte-check, knip, oxlint) |
| [security/RULE.md](./references/security/RULE.md)         | Security patterns overview                                    |
| [security/svelte.md](./references/security/svelte.md)     | Svelte-specific security ({@html}, javascript: URLs)          |
| [security/patterns.md](./references/security/patterns.md) | WRONG/CORRECT patterns (eval, URLs, sanitization)             |
| [svelte/RULE.md](./references/svelte/RULE.md)             | Svelte guidance overview                                      |
| [svelte/migration.md](./references/svelte/migration.md)   | Svelte 5 migration ($props, $effect, {@render})               |
| [react/RULE.md](./references/react/RULE.md)               | React guidance overview                                       |
