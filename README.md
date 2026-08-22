# Subcontractor Dashboard

A full-stack application that scrapes subcontractor data from [Procore's public network directory](https://network.procore.com/us), stores it in PostgreSQL, and presents it through a searchable, filterable dashboard. Includes enrichment from SAM.gov, USAspending, and NYC Open Data APIs.

## Architecture

```
subcontractor-dashboard/
├── scraper/          # Python scraper + enrichment scripts
│   └── scraper/
│       ├── procore.py            # Procore directory scraper
│       ├── enrichment/
│       │   ├── sam_gov.py        # SAM.gov UEI lookup
│       │   ├── usaspending.py    # Federal awards lookup
│       │   └── nyc_bids.py       # NYC bid records lookup
│       ├── db.py                 # Postgres upsert logic
│       ├── models.py             # Pydantic data models
│       └── main.py               # CLI entry point
├── dashboard/        # Hono + React TypeScript app
│   └── src/
│       ├── server/               # Hono API server
│       │   ├── routes/           # REST endpoints
│       │   ├── middleware/       # Auth middleware
│       │   ├── db/               # Drizzle schema + client
│       │   └── lib/              # better-auth config
│       ├── client/               # React SPA
│       │   ├── pages/            # Dashboard, detail, auth pages
│       │   ├── components/       # Stats, charts, table, filters
│       │   └── hooks/            # React Query data hooks
│       └── shared/               # Shared TypeScript types
└── docker-compose.yml
```

**Key decisions:**
- Two standalone apps (Python scraper + TypeScript dashboard) sharing only the database
- Procore uses Next.js SSR with `__NEXT_DATA__` JSON — structured extraction, no HTML parsing
- Server-side search/filter with Postgres ILIKE and JSONB containment queries
- Debounced search (300ms) with `keepPreviousData` for smooth pagination transitions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM |
| API | Hono |
| Auth | better-auth (email/password) |
| Frontend | React 19, React Router, TanStack React Query |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
| Scraper | Python 3, requests, pydantic |

## Prerequisites

- Node.js 22+ (use `nvm install 22`)
- Python 3.10+
- Docker & Docker Compose

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on port **5433** (mapped from 5432 to avoid conflicts with a host Postgres).

### 2. Set up the dashboard

```bash
cd dashboard
cp ../.env.example .env
npm install --legacy-peer-deps
```

Push the schema to the database:

```bash
npm run db:push
```

Start the dev servers (API on :3000, Vite on :5173):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account, and you'll see an empty dashboard.

### 3. Run the scraper

In a separate terminal:

```bash
cd scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m scraper.main scrape
```

This scrapes ~296 subcontractors from Procore's NY directory and upserts them into Postgres. Refresh the dashboard to see the data.

### 4. Run enrichment (optional)

```bash
python -m scraper.main enrich
```

This runs three enrichment passes sequentially:
1. **SAM.gov** — looks up each company's Unique Entity Identifier (UEI) and registration status
2. **USAspending** — aggregates federal contract award totals
3. **NYC Open Data** — counts bid records from the NYC Current Bids dataset

Each pass is rate-limited (2s between requests) and idempotent — only processes records that haven't been enriched yet.

To scrape and enrich in one command:

```bash
python -m scraper.main all
```

## API Endpoints

All endpoints require authentication (session cookie).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subcontractors` | Paginated list with search/filter/sort |
| GET | `/api/subcontractors/:id` | Single subcontractor detail |
| GET | `/api/stats/overview` | KPI counts (total, cities, trades, types) |
| GET | `/api/stats/trades` | Top 15 trades by count |
| GET | `/api/stats/cities` | Top 10 cities by count |
| GET | `/api/stats/company-types` | Company types by count |
| GET | `/api/filters/options` | Distinct values for filter dropdowns |
| POST | `/api/auth/sign-up/email` | Register |
| POST | `/api/auth/sign-in/email` | Login |

### Query parameters for `/api/subcontractors`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `search` | string | Search name, city, or description (ILIKE) |
| `trade` | string | Filter by trade (JSONB containment) |
| `city` | string | Filter by city (exact match) |
| `companyType` | string | Filter by company type |
| `sortBy` | string | Sort column (default: name) |
| `sortOrder` | string | asc or desc |

## Production Build

```bash
cd dashboard
npm run build
npm start
```

The build bundles the React client with Vite and the Hono server with tsup. The server serves the static client files and the API from a single process on port 3000.
