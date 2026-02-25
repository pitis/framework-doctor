# Framework Doctor Angular Demo

A minimal Angular app with **intentional issues** for testing [Framework Doctor](https://github.com/pitis/framework-doctor).

## Run the doctor

From the framework-doctor repo root (after `pnpm install` and `pnpm build`):

```bash
pnpm exec framework-doctor examples/angular/demo-app
# or directly:
pnpm exec angular-doctor examples/angular/demo-app
```

## Intentional issues

- **Security** — `eval()`, `bypassSecurityTrustHtml()` in `src/lib/security-test.ts`
- **Dead code** — Unused exports (if present)
- **Lint** — Various ESLint / Angular ESLint findings

## Develop

This project was generated with [Angular CLI](https://github.com/angular/angular-cli). To run the dev server:

```bash
ng serve
```

Open `http://localhost:4200/`. For code scaffolding, build, and tests see the [Angular CLI Overview](https://angular.dev/tools/cli).
