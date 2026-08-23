# Subcontractor Directory Dashboard

A full-stack tool that scrapes subcontractor data from [Procore's public network directory](https://network.procore.com/us/ca), enriches it with government contract data, and serves it through a searchable dashboard.

**Live:** [subcontractor-dashboard.onrender.com](https://subcontractor-dashboard.onrender.com) (free tier — first load may take ~30s to wake)

## What It Does

- Scrapes **221 California subcontractors** from Procore — name, contact, trades, company info, Procore activity, and GPS coordinates
- Enriches records from **3 public government APIs**: SAM.gov (entity registration), USAspending (federal awards), SF Open Data (CA govt contracts)
- **Landing page** with animated stats (react-countup), value props, and OG meta tags for link previews
- Dashboard with **search, filter by trade/city/type**, stats cards, and **interactive charts** (pie/bar toggle for company types, trade × city explorer, enrichment coverage)
- **Company detail pages** with contact info, Leaflet map, Procore Activity stats, trades, market sectors, business classifications, and government data
- Dark/light/system theme, mobile-responsive, route-level code splitting

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router v7, React Query v5, Recharts, react-leaflet, react-countup |
| UI | shadcn/ui, Tailwind CSS v4 |
| API | Hono |
| Auth | better-auth (email/password) |
| Database | PostgreSQL 16, Drizzle ORM |
| Scraper | Python 3, requests, pydantic, tenacity |
| Deployment | Render (Docker + managed Postgres) |

## Quick Start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Dashboard
cd dashboard
npm install --legacy-peer-deps
npm run db:push
npm run dev                # API :3000, Vite :5173

# 3. Scraper (separate terminal) — full pipeline
cd scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m scraper.main all
```

Requires Node.js 22+ and Python 3.10+.

## Scraper CLI

The scraper is self-contained — one command runs the full pipeline, and it can target any Postgres database.

```
python -m scraper.main {scrape,detail,enrich,all,seed} [--db URL] [--target-db URL] [--state STATE]
```

| Command | What it does |
|---------|-------------|
| `all` | Full pipeline: scrape listings → fetch detail pages → enrich with govt data |
| `scrape` | Pull listing pages from Procore |
| `detail` | Fetch detail pages for phone, lat/lng, Procore activity, claimed status |
| `enrich` | Query SAM.gov, USAspending, and SF Open Data APIs |
| `seed` | Copy data from local DB to a remote DB (`--target-db` required) |

```bash
# Scrape California into local DB
python -m scraper.main all

# Scrape Texas into a remote DB
python -m scraper.main all --state tx --db "postgresql://user:pass@host/db"

# Seed local data to production
python -m scraper.main seed --target-db "postgresql://user:pass@host/db"
```

### How the scraper works

1. **Listing pages** — Extracts `__NEXT_DATA__` JSON from Procore's Next.js SSR pages (no HTML parsing)
2. **Detail pages** — Visits each company's page for extra fields: phone, GPS coordinates, project counts, join date, claimed status
3. **Enrichment** — Queries SAM.gov for entity IDs, USAspending for federal award totals, and SF Open Data for government contract counts

All passes are rate-limited, retry on failure with exponential backoff, and are idempotent.

## Project Structure

```
scraper/                    # Python scraper + enrichment
  scraper/
    main.py                 # CLI (argparse)
    procore.py              # Procore listing scraper
    detail_scraper.py       # Procore detail page scraper
    enrichment/
      sam_gov.py            # SAM.gov entity lookup
      usaspending.py        # Federal awards lookup
      ca_contracts.py       # SF Open Data contracts
    db.py                   # Postgres upsert logic
    models.py               # Pydantic models
    config.py               # Config + runtime overrides

dashboard/                  # Hono + React monorepo
  src/
    server/                 # Hono API + Drizzle + better-auth
    client/                 # React SPA (pages, components, hooks)
    shared/                 # TypeScript types
```

## Deployment

Push to `main` triggers auto-deploy on Render via `render.yaml` blueprint. The Dockerfile runs `drizzle-kit push --force` on startup to sync the schema.

```bash
git push origin main
# Then seed production:
python -m scraper.main seed --target-db "$REMOTE_DATABASE_URL"
```
