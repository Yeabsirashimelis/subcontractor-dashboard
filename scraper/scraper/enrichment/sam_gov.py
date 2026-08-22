"""
SAM.gov entity search enrichment.

Uses the public SAM.gov Entity API to look up subcontractors by name
and retrieve their Unique Entity Identifier (UEI) and registration status.

API docs: https://open.gsa.gov/api/entity-api/
"""

import logging
import os
import time

import requests

from ..config import REQUEST_DELAY
from ..db import get_connection

logger = logging.getLogger(__name__)

SAM_API_BASE = "https://sam.gov/api/prod/entity-information/v3/entities"
SAM_API_KEY = os.getenv("SAM_API_KEY", "")


def search_entity(company_name: str) -> dict | None:
    params = {
        "legalBusinessName": company_name,
        "samRegistered": "Yes",
        "includeSections": "entityRegistration",
        "api_key": SAM_API_KEY,
    }

    try:
        resp = requests.get(SAM_API_BASE, params=params, timeout=15)
        if resp.status_code in (429, 403):
            logger.warning("SAM.gov rate limited or key issue, backing off 30s")
            time.sleep(30)
            return None
        if resp.status_code != 200:
            logger.debug(f"SAM.gov returned {resp.status_code} for '{company_name}'")
            return None

        data = resp.json()
        total = data.get("totalRecords", 0)
        if total == 0:
            return None

        entity = data["entityData"][0]
        registration = entity.get("entityRegistration", {})

        return {
            "uei": registration.get("ueiSAM"),
            "status": registration.get("registrationStatus"),
            "expiration": registration.get("registrationExpirationDate"),
        }
    except requests.RequestException as e:
        logger.error(f"SAM.gov request failed for '{company_name}': {e}")
        return None


def enrich_all():
    if not SAM_API_KEY:
        logger.warning("SAM_API_KEY not set, skipping SAM.gov enrichment")
        return 0

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name FROM subcontractors WHERE sam_uei IS NULL ORDER BY id"
            )
            rows = cur.fetchall()

        logger.info(f"Found {len(rows)} subcontractors to enrich via SAM.gov")
        enriched = 0

        for sub_id, name in rows:
            result = search_entity(name)
            if result and result["uei"]:
                with conn.cursor() as cur:
                    cur.execute(
                        """UPDATE subcontractors
                           SET sam_uei = %s, sam_status = %s,
                               enriched_at = NOW(), updated_at = NOW()
                           WHERE id = %s""",
                        (result["uei"], result["status"], sub_id),
                    )
                conn.commit()
                enriched += 1
                logger.info(f"  [{enriched}] {name} -> UEI: {result['uei']}")

            time.sleep(REQUEST_DELAY)

        logger.info(f"SAM.gov enrichment complete: {enriched}/{len(rows)} matched")
        return enriched

    finally:
        conn.close()
