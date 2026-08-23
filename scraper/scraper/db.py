import json
import logging

import psycopg2
from psycopg2.extras import execute_values

from . import config
from .models import Subcontractor

logger = logging.getLogger(__name__)


def get_connection():
    return psycopg2.connect(config.DATABASE_URL)


def upsert_subcontractors(companies: list[Subcontractor]) -> tuple[int, int]:
    if not companies:
        return 0, 0

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            values = [
                (
                    c.procore_slug,
                    c.name,
                    c.address,
                    c.city,
                    c.state,
                    c.zip_code,
                    c.phone,
                    c.email,
                    c.website,
                    c.company_type,
                    c.description,
                    c.employee_count,
                    c.avg_contract_size,
                    c.logo_url,
                    json.dumps(c.trades),
                    json.dumps(c.market_sectors),
                    json.dumps(c.business_classifications),
                    json.dumps(c.service_areas),
                    c.total_projects,
                    c.active_projects,
                    c.source_url,
                )
                for c in companies
            ]

            sql = """
                INSERT INTO subcontractors (
                    procore_slug, name, address, city, state, zip_code,
                    phone, email, website, company_type, description,
                    employee_count, avg_contract_size, logo_url,
                    trades, market_sectors, business_classifications,
                    service_areas, total_projects, active_projects,
                    source_url, scraped_at
                ) VALUES %s
                ON CONFLICT (procore_slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    address = EXCLUDED.address,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    zip_code = EXCLUDED.zip_code,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    website = EXCLUDED.website,
                    company_type = EXCLUDED.company_type,
                    description = EXCLUDED.description,
                    employee_count = EXCLUDED.employee_count,
                    avg_contract_size = EXCLUDED.avg_contract_size,
                    logo_url = EXCLUDED.logo_url,
                    trades = EXCLUDED.trades,
                    market_sectors = EXCLUDED.market_sectors,
                    business_classifications = EXCLUDED.business_classifications,
                    service_areas = EXCLUDED.service_areas,
                    total_projects = EXCLUDED.total_projects,
                    active_projects = EXCLUDED.active_projects,
                    source_url = EXCLUDED.source_url,
                    scraped_at = NOW(),
                    updated_at = NOW()
            """

            template = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())"
            execute_values(cur, sql, values, template=template)

            inserted = cur.rowcount
            conn.commit()

            logger.info(f"Upserted {inserted} records")
            return inserted, len(companies) - inserted

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
