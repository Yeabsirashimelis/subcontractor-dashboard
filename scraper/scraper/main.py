import argparse
import logging
import sys

import psycopg2
from psycopg2.extras import Json

from . import config
from .procore import scrape_all
from .db import upsert_subcontractors, get_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)

SEED_COLUMNS = [
    "id", "procore_slug", "name", "address", "city", "state", "zip_code",
    "phone", "email", "website", "company_type", "description",
    "employee_count", "avg_contract_size", "logo_url", "trades",
    "market_sectors", "business_classifications", "service_areas",
    "total_projects", "active_projects", "sam_uei", "sam_status",
    "federal_awards_total", "usaspending_recipient_id", "govt_contracts_count",
    "source_url", "scraped_at", "enriched_at", "created_at", "updated_at",
    "procore_users", "joined_at", "claimed", "latitude", "longitude",
]

JSONB_COLS = {"trades", "market_sectors", "business_classifications", "service_areas"}


def scrape():
    logger.info("Starting Procore scraper for %s state", config.TARGET_STATE)
    companies = scrape_all()
    logger.info(f"Scraped {len(companies)} unique companies")

    if not companies:
        logger.error("No companies scraped, exiting")
        sys.exit(1)

    inserted, updated = upsert_subcontractors(companies)
    logger.info(f"Database: {inserted} upserted")


def detail_scrape():
    from .detail_scraper import enrich_all as detail_enrich
    logger.info("Starting detail-page scraper")
    detail_enrich()
    logger.info("Detail-page scrape complete")


def enrich():
    from .enrichment.sam_gov import enrich_all as enrich_sam
    from .enrichment.usaspending import enrich_all as enrich_awards
    from .enrichment.ca_contracts import enrich_all as enrich_contracts

    logger.info("Starting enrichment pipeline")

    logger.info("--- SAM.gov ---")
    enrich_sam()

    logger.info("--- USAspending ---")
    enrich_awards()

    logger.info("--- CA Govt Contracts ---")
    enrich_contracts()

    logger.info("Enrichment pipeline complete")


def seed(target_db: str):
    logger.info("Seeding data to target database")

    source = get_connection()
    target = psycopg2.connect(target_db, sslmode="require")

    try:
        with source.cursor() as cur:
            cur.execute(f"SELECT {', '.join(SEED_COLUMNS)} FROM subcontractors ORDER BY id")
            rows = cur.fetchall()
        logger.info(f"Read {len(rows)} rows from source DB")

        if not rows:
            logger.error("No data to seed")
            sys.exit(1)

        with target.cursor() as cur:
            cur.execute("DELETE FROM subcontractors")
            logger.info("Cleared target subcontractors table")

            placeholders = ", ".join(["%s"] * len(SEED_COLUMNS))
            insert_sql = f"INSERT INTO subcontractors ({', '.join(SEED_COLUMNS)}) VALUES ({placeholders})"

            for i, row in enumerate(rows):
                converted = []
                for col, val in zip(SEED_COLUMNS, row):
                    if col in JSONB_COLS and val is not None:
                        converted.append(Json(list(val)))
                    else:
                        converted.append(val)
                cur.execute(insert_sql, converted)
                if (i + 1) % 50 == 0:
                    logger.info(f"  Inserted {i + 1}/{len(rows)}")

            cur.execute("SELECT setval('subcontractors_id_seq', (SELECT MAX(id) FROM subcontractors))")

        target.commit()
        logger.info(f"Successfully seeded {len(rows)} rows")

    finally:
        source.close()
        target.close()


def build_parser():
    parser = argparse.ArgumentParser(
        prog="python -m scraper.main",
        description="Procore subcontractor scraper — scrape, enrich, and seed data.",
    )
    parser.add_argument(
        "command",
        choices=["scrape", "detail", "enrich", "all", "seed"],
        help=(
            "scrape: pull listings from Procore. "
            "detail: fetch extra fields from detail pages. "
            "enrich: enrich with govt data (SAM.gov, USAspending, CA contracts). "
            "all: run scrape + detail + enrich end-to-end. "
            "seed: copy data from local DB to a remote DB (requires --target-db)."
        ),
    )
    parser.add_argument(
        "--db",
        metavar="URL",
        help="Override the database URL for scraping/enrichment (default: DATABASE_URL env var).",
    )
    parser.add_argument(
        "--target-db",
        metavar="URL",
        help="Target database URL for the seed command.",
    )
    parser.add_argument(
        "--state",
        default=None,
        help="US state code to scrape (default: ca).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.db:
        config.override_db(args.db)

    if args.state:
        config.TARGET_STATE = args.state

    if args.command == "scrape":
        scrape()
    elif args.command == "detail":
        detail_scrape()
    elif args.command == "enrich":
        enrich()
    elif args.command == "all":
        scrape()
        detail_scrape()
        enrich()
    elif args.command == "seed":
        if not args.target_db:
            parser.error("seed command requires --target-db URL")
        seed(args.target_db)


if __name__ == "__main__":
    main()
