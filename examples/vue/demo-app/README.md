# Framework Doctor Vue Demo

A minimal Vue 3 + Vite app with **intentional issues** for testing [Framework Doctor](https://github.com/pitis/framework-doctor).

## Run the doctor

From the framework-doctor repo root (after `pnpm install` and `pnpm build`):

```bash
pnpm exec framework-doctor examples/vue/demo-app
# or directly:
pnpm exec vue-doctor examples/vue/demo-app
```

## Intentional issues

- **Security** — `eval()`, `new Function()`, `setTimeout("string")` in `src/lib/SecurityTest.ts`
- **Dead code** — Unused exports in `src/lib/orphanUtils.ts`
- **v-html** — `v-html` with user content in `App.vue`
- **XSS** — `javascript:` URLs in `App.vue`
- **Accessibility** — div with `role="button"` (no keyboard support), empty anchor links

## Develop

```bash
pnpm install
pnpm dev
```
