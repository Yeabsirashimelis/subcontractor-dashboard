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


def main():
    logger.info("Starting Procore scraper for New York state")

    companies = scrape_all()
    logger.info(f"Scraped {len(companies)} unique companies")

    if not companies:
        logger.error("No companies scraped, exiting")
        sys.exit(1)

    inserted, updated = upsert_subcontractors(companies)
    logger.info(f"Database: {inserted} upserted")
    logger.info("Done!")


if __name__ == "__main__":
    main()
