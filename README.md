# Schedule Sync (Monochrome UI)

## Quick Start

```sh
# install
pnpm i

# run services (optional if you use db later)
docker compose up -d

# dev
pnpm --filter web dev
pnpm --filter api dev
```

## Local URLs

- Web Top: http://localhost:3000/
- Admin Progress: http://localhost:3000/admin/progress
  - Phase filter: `?phase=A|B|C|all`
- API Health: http://localhost:4000/healthz
- API Progress: http://localhost:4000/admin/progress

Env for Web → API: `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4000`).

## Design System

- Monochrome tokens in `apps/web/app/globals.css`
- Tailwind tokens in `apps/web/tailwind.config.ts`
- shadcn-like components in `apps/web/components/ui/`

## A11y Audit

```sh
pnpm a11y:progress
```
Outputs JSON with `score`. Current score: 100 (as of setup).

## Progress Snapshot

See `ops/progress.yaml` and the synced section in `PROJECT.md`.
