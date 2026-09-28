# Kanban

A full-stack Kanban board app: React + Vite client, Express + Prisma server, PostgreSQL database.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)

## Setup

```bash
# 1. Install dependencies (installs client + server via npm workspaces)
npm install

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your DATABASE_URL, JWT_SECRET, PORT, CLIENT_ORIGIN
# Edit client/.env with VITE_API_URL pointing at the server (e.g. http://localhost:4000/api)

# 3. Run database migrations
npm run prisma:migrate -w server

# 4. (Optional) Seed sample data
npm run prisma:seed -w server

# 5. Start both client and server in dev mode
npm run dev
```

The client runs on http://localhost:5173 and the server on the `PORT` set in `server/.env` (default `4000`).

## Production build

```bash
npm run build
```

Builds the server (`server/dist`) and client (`client/dist`). Serve the client's static output with any static host, and run the server with `npm run start -w server` (after setting production environment variables).

## Deploying online (Render)

This repo includes a `render.yaml` blueprint that provisions everything needed to run the app publicly on [Render](https://render.com):

1. Push this repo to GitHub.
2. In the Render dashboard, click **New > Blueprint** and select the GitHub repo.
3. Render reads `render.yaml` and creates three resources automatically:
   - `kanban-db` — a free managed PostgreSQL database.
   - `kanban-server` — the Express API (runs `prisma migrate deploy` on each deploy, sets `DATABASE_URL` from the database and auto-generates `JWT_SECRET`).
   - `kanban-client` — the static Vite build, wired to call the server via `VITE_API_URL`.
4. Click **Apply** to deploy. First deploy takes a few minutes (installs deps, builds, runs migrations).
5. Once live, open the `kanban-client` URL shown in the Render dashboard to use the app.

**Note:** the blueprint assumes the services keep the default names `kanban-server` / `kanban-client` (used to wire `CLIENT_ORIGIN` and `VITE_API_URL` to each other's public URL). If Render appends a suffix because those names are taken, update `CLIENT_ORIGIN` (on `kanban-server`) and `VITE_API_URL` (on `kanban-client`) in the dashboard to match the actual assigned URLs, then redeploy.

To seed sample data on the deployed database, run `npm run prisma:seed -w server` locally with `DATABASE_URL` pointed at the Render database's external connection string (found in the Render dashboard).

## Notes

- This app requires a running Node server and PostgreSQL database — it cannot be hosted as a static site alone (e.g. plain GitHub Pages will not run the API).
- Never commit real `.env` files; only `.env.example` templates are included.
