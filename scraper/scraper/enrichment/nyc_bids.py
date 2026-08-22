"""
NYC Open Data — Current NYC Bids enrichment.

Uses the Socrata Open Data API (SODA) to search NYC bid records
and count how many bids each subcontractor has participated in.

Dataset: https://data.cityofnewyork.us/City-Government/Current-NYC-Bids/tf3b-tk9r
"""

import logging
import time

import requests

from ..config import REQUEST_DELAY
from ..db import get_connection

logger = logging.getLogger(__name__)

NYC_BIDS_API = "https://data.cityofnewyork.us/resource/tf3b-tk9r.json"


def search_bids(company_name: str) -> int:
    params = {
        "$where": f"upper(vendor_name) LIKE '%{company_name.upper().replace("'", "''")}%'",
        "$select": "count(*) as bid_count",
    }

    try:
        resp = requests.get(NYC_BIDS_API, params=params, timeout=15)
        if resp.status_code == 429:
            logger.warning("NYC Open Data rate limited, backing off 30s")
            time.sleep(30)
            return 0
        resp.raise_for_status()

        data = resp.json()
        if data and len(data) > 0:
            return int(data[0].get("bid_count", 0))
        return 0
    except requests.RequestException as e:
        logger.error(f"NYC bids request failed for '{company_name}': {e}")
        return 0


def enrich_all():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id, name FROM subcontractors
                   WHERE nyc_bids_count IS NULL
                     AND state = 'NY'
                   ORDER BY id"""
            )
            rows = cur.fetchall()

        logger.info(f"Found {len(rows)} NY subcontractors to check for NYC bids")
        enriched = 0

        for sub_id, name in rows:
            count = search_bids(name)
            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE subcontractors
                       SET nyc_bids_count = %s,
                           enriched_at = NOW(), updated_at = NOW()
                       WHERE id = %s""",
                    (count, sub_id),
                )
            conn.commit()

            if count > 0:
                enriched += 1
                logger.info(f"  [{enriched}] {name} -> {count} bids")

            time.sleep(REQUEST_DELAY)

        logger.info(f"NYC bids enrichment complete: {enriched}/{len(rows)} with bids")
        return enriched

    finally:
        conn.close()
