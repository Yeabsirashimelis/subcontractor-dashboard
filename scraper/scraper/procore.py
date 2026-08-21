import json
import re
import time
import logging

import requests
from tenacity import retry, wait_exponential, stop_after_attempt

from .config import PROCORE_BASE_URL, TARGET_STATE, MAX_PAGES, REQUEST_DELAY, USER_AGENT
from .models import Subcontractor

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml",
}


@retry(wait=wait_exponential(min=2, max=30), stop=stop_after_attempt(3))
def fetch_page(url: str) -> str:
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return response.text


def extract_next_data(html: str) -> dict:
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
    )
    if not match:
        raise ValueError("Could not find __NEXT_DATA__ in page")
    return json.loads(match.group(1))


def parse_company(raw: dict) -> Subcontractor:
    primary = raw.get("primaryAddress") or {}
    display = primary.get("display") or {}
    services = raw.get("providedServices") or []
    coverage = raw.get("coverageAreas") or []

    return Subcontractor(
        procore_slug=raw["primarySlug"],
        name=raw["name"],
        address=display.get("address"),
        city=primary.get("city"),
        state=primary.get("province"),
        zip_code=display.get("postalCode") or primary.get("postalCode1"),
        phone=raw.get("phone"),
        website=raw.get("website"),
        company_type=", ".join(raw.get("businessTypes") or []) or None,
        description=raw.get("about"),
        employee_count=raw.get("companySize"),
        avg_contract_size=raw.get("avgContractSize"),
        logo_url=raw.get("logoUrl") or None,
        trades=[s["name"] for s in services],
        market_sectors=raw.get("constructionSectors") or [],
        business_classifications=[
            c["name"] if isinstance(c, dict) else c
            for c in (raw.get("classifications") or [])
        ],
        service_areas=[c.get("locality", "") for c in coverage if c.get("locality")],
        source_url=f"{PROCORE_BASE_URL}/p/{raw['primarySlug']}",
    )


def scrape_listing_page(page: int) -> list[Subcontractor]:
    url = f"{PROCORE_BASE_URL}/us/{TARGET_STATE}?page={page}"
    logger.info(f"Fetching page {page}: {url}")

    html = fetch_page(url)
    data = extract_next_data(html)
    props = data["props"]["pageProps"]
    results = props.get("initialResults", {}).get("results", [])

    companies = []
    for raw in results:
        try:
            companies.append(parse_company(raw))
        except Exception as e:
            logger.warning(f"Failed to parse company: {e}")

    logger.info(f"Page {page}: parsed {len(companies)} companies")
    return companies


def scrape_all(max_pages: int = MAX_PAGES) -> list[Subcontractor]:
    all_companies: list[Subcontractor] = []
    seen_slugs: set[str] = set()

    for page in range(1, max_pages + 1):
        try:
            companies = scrape_listing_page(page)
        except Exception as e:
            logger.error(f"Failed to fetch page {page}: {e}")
            break

        new_count = 0
        for company in companies:
            if company.procore_slug not in seen_slugs:
                seen_slugs.add(company.procore_slug)
                all_companies.append(company)
                new_count += 1

        logger.info(
            f"Page {page}: {new_count} new, {len(all_companies)} total"
        )

        if not companies:
            logger.info("No more results, stopping")
            break

        if page < max_pages:
            time.sleep(REQUEST_DELAY)

    return all_companies
