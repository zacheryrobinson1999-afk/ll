# LTC Engineering Tools

Mobile app and API for LTC crane technicians — browse the fleet, access reference documents, and manage maintenance procedures per crane.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ltc-mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SESSION_SECRET`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native)
- API: Express 5
- File storage: Backblaze B2 (S3-compatible)
- Validation: Zod (`zod/v4`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ltc-mobile/` — Expo mobile app (screens, components, data)
- `artifacts/ltc-mobile/data/craneFleet.ts` — source of truth for crane model library
- `artifacts/api-server/` — Express API (uploads, document serving)
- `artifacts/api-server/public/docs/` — reference PDFs/PPTX served to the mobile app (tracked via Git LFS)

## Architecture decisions

- Crane unit numbers are not baked into the fleet library — they are managed at runtime so the fleet data stays clean between environments.
- Reference documents (PDFs, PPTX) are committed via Git LFS rather than object storage so they version alongside the app.
- B2 is used for user-uploaded photos and files; public/docs is for static reference material.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Metro bundler requires a `_tmp_` blockList entry in `metro.config.js` for pnpm installs — see `.agents/memory/b2-upload-pipeline.md`.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before building the mobile app.
