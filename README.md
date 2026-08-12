# LTC Engineering Tools

A web application and REST API for qualified LTC crane technicians.

The web application is the primary LTC Engineering Tools product. It provides technician tools, crane fleet information, maintenance procedures, and controlled access to technical reference documents.

## Features

- **Instrument** — LICCON daily access code generator and pressure, length, and temperature converters
- **Fleet** — browse and filter the crane fleet
- **Reference documents** — technical manuals, load charts, service information, and diagnostic guides
- **Maintenance** — navigate by manufacturer → crane → maintenance documentation and authorised file uploads

## Tech stack

| Layer | Technology |
|---|---|
| Web app | React 19, Vite 7, Tailwind CSS 4 |
| API | Express 5, Node.js 24 |
| Language | TypeScript 5.9 |
| File storage | Backblaze B2 (S3-compatible) |
| Monorepo | pnpm workspaces |
| Mobile | Expo / React Native (legacy) |

## Prerequisites

- Node.js 24
- pnpm 9+

The required Node version is also defined in the root `package.json`.

## Install

```bash
pnpm install
