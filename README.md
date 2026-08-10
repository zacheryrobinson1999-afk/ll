# LTC Engineering Tools

A web app and REST API for LTC crane technicians — deployable as a single service on Render.com.

- **Instrument** — LICCON daily access code generator + pressure, length, and temperature converters
- **Fleet** — browse and filter the crane fleet (Liebherr, Grove, Franna, Demag, Sany, Kobelco)
- **Reference documents** — load charts, service manuals, and diagnostic guides via B2-hosted PDFs
- **Maintenance** — navigate by manufacturer → crane → maintenance docs and file uploads

## Tech stack

| Layer | Technology |
|---|---|
| Web app | React 19, Vite 7, Tailwind CSS 4 |
| API | Express 5, Node.js 24 |
| Language | TypeScript 5.9 |
| File storage | Backblaze B2 (S3-compatible) |
| Monorepo | pnpm workspaces |
| Mobile (legacy) | Expo (React Native) |

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 9+

### Install

```bash
pnpm install
```

### Environment variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Secret for signing sessions |
| `B2_KEY_ID` | Backblaze B2 application key ID |
| `B2_APPLICATION_KEY` | Backblaze B2 application key |
| `B2_BUCKET_NAME` | B2 bucket name |
| `B2_ENDPOINT` | B2 S3-compatible endpoint (e.g. `s3.us-east-005.backblazeb2.com`) |

### Run locally

```bash
# API server (port auto-assigned by Replit, or set PORT manually)
pnpm --filter @workspace/api-server run dev

# React web app (in a separate terminal)
BASE_PATH=/ PORT=5173 pnpm --filter @workspace/web run dev
```

The web app at `http://localhost:5173` will call the API on the same host via `/api/...`.

## Deploy to Render

The `render.yaml` at the repo root defines one web service — Express serves both the API and the built React SPA.

### Steps

1. Push your repo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service** → connect the repo.
3. Render auto-detects `render.yaml` and pre-fills the service settings.
4. Add the five **secret** environment variables in the Render dashboard (Settings → Environment):

   | Key | Value |
   |---|---|
   | `B2_APPLICATION_KEY` | Your B2 application key |
   | `B2_BUCKET_NAME` | Your B2 bucket name |
   | `B2_ENDPOINT` | e.g. `s3.us-east-005.backblazeb2.com` |
   | `B2_KEY_ID` | Your B2 key ID |
   | `SESSION_SECRET` | Any long random string (`openssl rand -hex 32`) |

5. Click **Deploy**. Render builds the libs, API server, and React app, then starts Express.

The deployed URL (e.g. `https://ltc-engineering.onrender.com`) serves the full web app.

## Project structure

```
artifacts/
  api-server/          # Express REST API
    src/
      routes/          # API route handlers (docs, uploads)
      lib/             # B2 storage, metadata store, logger
  ltc-mobile/          # Expo mobile app (legacy)
    app/               # Expo Router screens
    data/              # Fleet + tech docs data
  web/                 # React/Vite web app
    src/
      data/            # craneFleet.ts, techDocs.ts (shared data)
      lib/             # dailyCodes.ts, uploadsApi.ts
      pages/           # Instrument, Fleet, Docs, Maintenance
      components/      # Shared UI components
lib/
  api-client-react/    # Generated React Query hooks
  api-spec/            # OpenAPI spec + codegen
  api-zod/             # Generated Zod schemas
  db/                  # Drizzle ORM schema + migrations
render.yaml            # Single-service Render deployment config
```

## Backblaze B2 document structure

```
<bucket>/
  docs/          # Reference PDFs — served via /api/docs/:filename (1-hour pre-signed URL)
  uploads/       # Technician-uploaded files per crane — served via /api/uploads/:craneId
```

## Licence

Private — all rights reserved.
