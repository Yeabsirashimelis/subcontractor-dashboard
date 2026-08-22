"""
California government contracts enrichment.

Uses San Francisco's Socrata Open Data API (SODA) to search city contract records
and count how many government contracts each subcontractor has been awarded.

Dataset: https://data.sfgov.org/City-Management-and-Ethics/Vendor-Payments-Vouchers-/n9pm-xkyq
"""

import logging
import time

import requests

from ..config import REQUEST_DELAY
from ..db import get_connection

logger = logging.getLogger(__name__)

SF_CONTRACTS_API = "https://data.sfgov.org/resource/p5r5-fd7g.json"


def search_contracts(company_name: str) -> int:
    words = company_name.upper().strip().split()
    if not words:
        return 0

    search_term = words[0] if len(words) == 1 else " ".join(words[:3])
    safe_name = search_term.replace("'", "''")

    params = {
        "$where": f"upper(vendor) LIKE '%{safe_name}%'",
        "$select": "count(*) as contract_count",
    }

    try:
        resp = requests.get(SF_CONTRACTS_API, params=params, timeout=15)
        if resp.status_code == 429:
            logger.warning("SF Open Data rate limited, backing off 30s")
            time.sleep(30)
            return 0
        resp.raise_for_status()

        data = resp.json()
        if data and len(data) > 0:
            return int(data[0].get("contract_count", 0))
        return 0
    except requests.RequestException as e:
        logger.error(f"SF contracts request failed for '{company_name}': {e}")
        return 0


def enrich_all():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id, name FROM subcontractors
                   WHERE govt_contracts_count IS NULL
                   ORDER BY id"""
            )
            rows = cur.fetchall()

        logger.info(f"Found {len(rows)} subcontractors to check for CA govt contracts")
        enriched = 0

        for sub_id, name in rows:
            count = search_contracts(name)
            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE subcontractors
                       SET govt_contracts_count = %s,
                           enriched_at = NOW(), updated_at = NOW()
                       WHERE id = %s""",
                    (count, sub_id),
                )
            conn.commit()

            if count > 0:
                enriched += 1
                logger.info(f"  [{enriched}] {name} -> {count} contracts")

            time.sleep(REQUEST_DELAY)

        logger.info(f"CA govt contracts enrichment complete: {enriched}/{len(rows)} with contracts")
        return enriched

    finally:
        conn.close()
