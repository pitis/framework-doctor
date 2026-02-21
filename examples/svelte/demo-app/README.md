# Framework Doctor Svelte Demo

A minimal SvelteKit app with **intentional issues** for testing [Framework Doctor](https://github.com/pitis/framework-doctor).

## Run the doctor

From the framework-doctor repo root:

```bash
pnpm exec framework-doctor examples/svelte/demo-app
```

## Intentional issues

- **Security** — `eval()`, `new Function()`, `setTimeout("string")` in `src/lib/SecurityTest.ts`
- **Dead code** — Unused exports in `src/lib/orphanUtils.ts`
- **Legacy Svelte** — `DoctorTestComponent.svelte` uses export let, createEventDispatcher, onMount, slots
- **XSS** — `{@html}` with user content, `javascript:` URLs in `+page.svelte`

## Develop

```bash
pnpm install
pnpm dev
```
