"""
USAspending.gov enrichment.

Uses the public USAspending API to look up federal contract awards
by recipient name, aggregating total award amounts.

API docs: https://api.usaspending.gov/docs/endpoints
"""

import logging
import time

import requests

from ..config import REQUEST_DELAY
from ..db import get_connection

logger = logging.getLogger(__name__)

AWARDS_API = "https://api.usaspending.gov/api/v2/search/spending_by_award/"


def search_awards(company_name: str) -> dict | None:
    payload = {
        "filters": {
            "recipient_search_text": [company_name],
            "award_type_codes": ["A", "B", "C", "D"],
            "time_period": [{"start_date": "2019-01-01", "end_date": "2026-12-31"}],
        },
        "fields": ["Award Amount", "Recipient Name", "Award ID", "recipient_id"],
        "page": 1,
        "limit": 10,
        "sort": "Award Amount",
        "order": "desc",
    }

    try:
        resp = requests.post(AWARDS_API, json=payload, timeout=20)
        if resp.status_code == 429:
            logger.warning("USAspending rate limited, backing off 30s")
            time.sleep(30)
            return None
        resp.raise_for_status()

        data = resp.json()
        results = data.get("results", [])
        if not results:
            return None

        total = sum(
            float(r.get("Award Amount", 0) or 0)
            for r in results
        )

        recipient_id = results[0].get("recipient_id")

        return {
            "total_awards": int(total),
            "award_count": len(results),
            "recipient_id": recipient_id,
        }
    except requests.RequestException as e:
        logger.error(f"USAspending request failed for '{company_name}': {e}")
        return None


def enrich_all():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id, name FROM subcontractors
                   WHERE federal_awards_total IS NULL
                   ORDER BY id"""
            )
            rows = cur.fetchall()

        logger.info(f"Found {len(rows)} subcontractors to enrich via USAspending")
        enriched = 0

        for sub_id, name in rows:
            result = search_awards(name)
            if result and result["total_awards"] > 0:
                with conn.cursor() as cur:
                    cur.execute(
                        """UPDATE subcontractors
                           SET federal_awards_total = %s,
                               usaspending_recipient_id = %s,
                               enriched_at = NOW(), updated_at = NOW()
                           WHERE id = %s""",
                        (result["total_awards"], result.get("recipient_id"), sub_id),
                    )
                conn.commit()
                enriched += 1
                logger.info(
                    f"  [{enriched}] {name} -> ${result['total_awards']:,} "
                    f"({result['award_count']} awards)"
                )

            time.sleep(REQUEST_DELAY)

        logger.info(
            f"USAspending enrichment complete: {enriched}/{len(rows)} matched"
        )
        return enriched

    finally:
        conn.close()
