# Setup Guide (Public Release)

This guide helps you run and publish the project so anyone can use it.

## 1. What this app does
- Creates/updates/deletes events on two calendars:
  - The logged-in user's Google calendar (primary by default)
  - An admin calendar (e.g. admin@gmail.com) using a Service Account
- Sync is bidirectional. If you edit/delete on either calendar, changes propagate (via periodic polling).

## 2. Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)
- A Google Cloud project with Calendar API enabled

## 3. Clone and install
```
git clone <your-repo>
cd <your-repo>
pnpm install
```

## 4. Create env files from examples
- Root `.env` (or use per-app envs below) based on `./.env.example`
- Web: copy `apps/web/.env.example` to `apps/web/.env.local`
- API: copy `apps/api/.env.example` to `apps/api/.env`

Fill values:
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (OAuth web client)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON private key as a single-line with \n)
- `GOOGLE_CALENDAR_ID_ADMIN` (the admin calendar to mirror events to)
- `DATABASE_URL` (your Postgres URL)
- `POLL_ENABLED=true` and `POLL_INTERVAL_MS=60000` (for auto sync every 1 min)

## 5. Google Cloud configuration (for public release)
1) Enable Calendar API.
2) OAuth consent screen:
   - User type: External
   - App info and support email
   - Scopes: only `calendar.events` (plus `openid email profile`)
   - Privacy Policy URL + Terms of Service URL (you can fork `docs/PRIVACY.md` & `docs/TERMS.md` and host them)
3) Create OAuth Client ID (Web application):
   - Authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://<your-domain>/api/auth/callback/google`
4) Create a Service Account and download a JSON key:
   - Put its email into `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Put the JSON private key into `GOOGLE_SERVICE_ACCOUNT_KEY` (escaped with \n)
5) Share the admin calendar with the Service Account email with permission: "Make changes to events".

## 6. Database
```
cd apps/api
npx prisma db push
```

## 7. Run locally
- API: `pnpm --filter api dev` or `pnpm -C apps/api dev`
- Web: `pnpm --filter web dev` or `pnpm -C apps/web dev`
- Open `http://localhost:3000`

## 8. Deploy
- API (Render/Fly/Railway): set environment variables from `apps/api/.env.example`
- Web (Vercel): set `NEXT_PUBLIC_API_BASE_URL` to the API URL, `NEXTAUTH_URL` to your web URL
- Add production redirect URI to the OAuth client

## 9. Verification (no test users needed)
To allow anyone to sign in without pre-adding email addresses, submit your app for Google OAuth verification:
- Provide the app homepage, privacy policy, and terms URLs
- Explain why `calendar.events` scope is needed (create/update/delete/read events)
- Upload a short demo video (sign-in → create/edit/delete → calendar reflects changes)
- Provide a contact email

## 10. Security & tips
- Never commit `.env` or private keys. `.gitignore` is configured.
- Keep scopes minimal (`calendar.events`).
- Use polling first; you can switch to webhooks later if you have a public inbound URL.

## 11. Troubleshooting
- If admin sync fails, verify calendar sharing to the Service Account.
- If user sync fails, sign out/in to refresh tokens and ensure `calendar.events` is granted.
- Check server logs for `[poller]` messages to confirm periodic sync.
