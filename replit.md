# LTC Engineering Tools

Web application and API for qualified LTC crane technicians. The web application is the primary product. It provides the crane fleet library, technical reference documents, maintenance procedures, technician tools, and related services.

## Primary Application

The primary application is the React/Vite web application in:

- `artifacts/web/`

The Express API is in:

- `artifacts/api-server/`

The Expo application in:

- `artifacts/ltc-mobile/`

is **legacy/archived code**. Do not add new features to `ltc-mobile` unless explicitly requested.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/web run dev` — run the web application
- `pnpm run typecheck` — full typecheck across packages
- `pnpm run build` — typecheck and build packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Required Environment

The production API requires:

- `SESSION_SECRET`
- `B2_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_BUCKET_NAME`
- `B2_ENDPOINT`

Never commit secret values to the repository.

## Stack

- pnpm workspaces
- Node.js 24
- TypeScript 5.9
- React / Vite web application
- Express 5 API
- Backblaze B2 object storage
- Zod validation
- esbuild

## Repository Layout

- `artifacts/web/` — primary React/Vite web application
- `artifacts/api-server/` — Express API
- `artifacts/web/src/pages/` — web application pages
- `artifacts/web/src/lib/` — shared web application logic
- `artifacts/ltc-mobile/` — legacy Expo application; do not extend unless explicitly requested
- `lib/db/` — database schema and database-related code
- `scripts/` — project scripts

## Document Storage

Backblaze B2 is the authoritative storage location for technical reference documents.

Reference documents must not be added to the repository as normal application assets or accumulated under:

`artifacts/api-server/public/docs/`

Do not introduce Git LFS as the primary document-storage system.

Documents should be represented by application metadata and a B2 object key. The API is responsible for authorising access and generating temporary signed URLs for document retrieval.

The browser may use an appropriate local/PWA cache for controlled offline access where supported.

## Architecture Decisions

- The web application is the primary LTC Engineering Tools client.
- `ltc-mobile` is legacy and should not receive new features unless explicitly requested.
- Backblaze B2 is the source of truth for technical reference documents.
- Document metadata belongs in the application's data layer rather than being hard-coded into UI components.
- Temporary signed URLs should be used when retrieving protected B2 documents.
- Secrets must remain in environment variables and must never be committed to Git.
- Upload and document-management endpoints must require appropriate authentication and authorisation.

## Security Requirements

Any future document upload functionality must include appropriate:

- authentication
- role/permission checks
- file-size limits
- file-type validation
- filename sanitisation
- malware/security scanning where available
- secure B2 object keys
- audit logging

Do not expose administrative upload or document-management functionality to unauthenticated users.

## Development Rules

Before making architectural changes:

1. Inspect the existing implementation.
2. Preserve working routes and existing API contracts unless the change specifically requires them.
3. Run the relevant typecheck/build after changes.
4. Do not reintroduce Git LFS or local document storage for the technical document library.
5. Do not extend the legacy mobile application unless explicitly requested.

## Gotchas

- Keep Node.js aligned with the version specified by the root `package.json`.
- Render uses the root `package.json` Node engine requirement.
- Run API code generation after changing the OpenAPI specification.
- Preserve the existing B2 endpoint configuration when modifying document storage.
- Avoid committing generated secrets, credentials, or temporary files.
