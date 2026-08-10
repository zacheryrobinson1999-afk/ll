---
name: Render.com build for the web artifact
description: How to build the pnpm monorepo web + API server for Render.com without building the Expo mobile app.
---

## The rule
Do NOT use `pnpm -r --if-present run build` for the Render build command — it tries to build every artifact including the Expo mobile app, which fails on Render.

Instead, build only the needed packages:
```
pnpm install && pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && BASE_PATH=/ PORT=3000 pnpm --filter @workspace/web run build
```

**Why:** `pnpm -r` targets all workspace packages. The `artifacts/ltc-mobile` (Expo) package has a build script that fails outside of Expo's environment.

**How to apply:** Any time the Render build command or a CI/CD config needs to build this monorepo, use the selective filter approach above.

## Vite build requirements
The `artifacts/web` Vite config (`vite.config.ts`) throws if `PORT` and `BASE_PATH` are not set at build time. During `vite build` these only affect dev server config (not the output), so any value works — e.g. `BASE_PATH=/ PORT=3000`.

## Lib build ordering
`artifacts/web` imports from `@workspace/api-client-react` (declared in tsconfig `references`). This composite lib must be built before the Vite build:
```
pnpm run typecheck:libs   # compiles all lib/* composite packages including api-client-react
```

## Express static serving path
At runtime, `artifacts/api-server/dist/index.mjs` serves the web SPA from:
```
path.resolve(__dirname, "../../web/dist/public")
```
Which resolves to `artifacts/web/dist/public/` — correct when running from the monorepo root.
