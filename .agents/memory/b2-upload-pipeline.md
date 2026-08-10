---
name: B2 upload pipeline
description: How Backblaze B2 uploads work in this project, and the Metro fix needed when installing new Expo packages.
---

## Upload architecture
- API server uses `@aws-sdk/client-s3` + `@aws-sdk/lib-storage` + `@aws-sdk/s3-request-presigner`
- `forcePathStyle: true` is required for Backblaze B2 S3-compatible endpoint
- Files are buffered in memory via `multer` (memoryStorage, 50 MB limit) then streamed to B2
- Download URLs are pre-signed (1 h TTL) generated at list/upload time — bucket does NOT need to be public
- Metadata stored in `artifacts/api-server/data/uploads.json` (simple flat JSON array)
- Routes: `GET/POST /api/uploads/:craneId`, `DELETE /api/uploads/:craneId/:docId`

## Metro / pnpm temp-dir crash
pnpm creates `package_tmp_NNN` directories during install that disappear before Metro finishes its initial scan, causing `ENOENT: watch … _tmp_NNN`. Fix: add `/_tmp_\d+/` to Metro's `resolver.blockList` in `metro.config.js`.

**Why:** This hits every time a new Expo-native package (expo-document-picker, aws-sdk, etc.) is installed at workspace root because pnpm hoists and creates temp dirs that Metro scans.

**How to apply:** Any time an install causes the Expo workflow to crash with `ENOENT … _tmp_`, the blockList in `artifacts/ltc-mobile/metro.config.js` already covers it — just restart the workflow.
