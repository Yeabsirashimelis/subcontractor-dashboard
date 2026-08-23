"""
Second-pass scraper: fetches individual company detail pages from Procore
to pull fields not available on listing pages (phone, metrics, join date, claimed).
"""

import json
import logging
import re
import time

import requests
from tenacity import retry, wait_exponential, stop_after_attempt

from .config import PROCORE_BASE_URL, REQUEST_DELAY, USER_AGENT
from .db import get_connection

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml",
}


@retry(wait=wait_exponential(min=2, max=30), stop=stop_after_attempt(3))
def _fetch_page(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.text


def fetch_detail_page(slug: str) -> dict | None:
    url = f"{PROCORE_BASE_URL}/p/{slug}"
    try:
        html = _fetch_page(url)
        match = re.search(
            r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
            html,
        )
        if not match:
            return None

        data = json.loads(match.group(1))
        return data["props"]["pageProps"]
    except Exception as e:
        logger.error(f"Failed to fetch detail for {slug}: {e}")
        return None


def extract_detail_fields(page_props: dict) -> dict:
    biz = page_props.get("business") or {}
    metrics = page_props.get("metrics") or {}

    phone = biz.get("phone")
    claimed = biz.get("claimed")
    joined_at = biz.get("createdAt")

    total_projects = (
        metrics.get("freemiumTotalProjects")
        or metrics.get("totalProjects")
    )
    active_projects = (
        metrics.get("freemiumTotalActiveProjects")
        or metrics.get("activeProjects")
    )
    procore_users = metrics.get("freemiumNumOfEmployees")

    lat_lng = biz.get("latLng") or {}
    latitude = lat_lng.get("lat")
    longitude = lat_lng.get("lng")

    return {
        "phone": phone,
        "claimed": claimed,
        "joined_at": joined_at,
        "total_projects": total_projects,
        "active_projects": active_projects,
        "procore_users": procore_users,
        "latitude": latitude,
        "longitude": longitude,
    }


def enrich_all():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, procore_slug FROM subcontractors ORDER BY id"
            )
            rows = cur.fetchall()

        logger.info(f"Detail scraping {len(rows)} companies")
        updated = 0

        for sub_id, slug in rows:
            page_props = fetch_detail_page(slug)
            if not page_props:
                time.sleep(REQUEST_DELAY)
                continue

            fields = extract_detail_fields(page_props)
            updates = {k: v for k, v in fields.items() if v is not None}

            if updates:
                set_sql = ", ".join(f"{k} = %s" for k in updates) + ", updated_at = NOW()"
                params = list(updates.values()) + [sub_id]

                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE subcontractors SET {set_sql} WHERE id = %s",
                        params,
                    )
                conn.commit()
                updated += 1
                logger.info(f"  [{updated}] {slug} -> phone={fields['phone']}, projects={fields['total_projects']}")

            time.sleep(REQUEST_DELAY)

        logger.info(f"Detail scrape complete: {updated}/{len(rows)} updated")
        return updated

    finally:
        conn.close()
