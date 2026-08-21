from pydantic import BaseModel


class Subcontractor(BaseModel):
    procore_slug: str
    name: str
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    company_type: str | None = None
    description: str | None = None
    employee_count: str | None = None
    avg_contract_size: str | None = None
    logo_url: str | None = None
    trades: list[str] = []
    market_sectors: list[str] = []
    business_classifications: list[str] = []
    service_areas: list[str] = []
    total_projects: int | None = None
    active_projects: int | None = None
    source_url: str | None = None
