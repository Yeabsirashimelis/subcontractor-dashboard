import logging
import sys

from .procore import scrape_all
from .db import upsert_subcontractors

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)


def scrape():
    logger.info("Starting Procore scraper for California state")

    companies = scrape_all()
    logger.info(f"Scraped {len(companies)} unique companies")

    if not companies:
        logger.error("No companies scraped, exiting")
        sys.exit(1)

    inserted, updated = upsert_subcontractors(companies)
    logger.info(f"Database: {inserted} upserted")
    logger.info("Done!")


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


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "scrape"

    if command == "scrape":
        scrape()
    elif command == "detail":
        detail_scrape()
    elif command == "enrich":
        enrich()
    elif command == "all":
        scrape()
        detail_scrape()
        enrich()
    else:
        print(f"Usage: python -m scraper.main [scrape|detail|enrich|all]")
        sys.exit(1)


if __name__ == "__main__":
    main()
