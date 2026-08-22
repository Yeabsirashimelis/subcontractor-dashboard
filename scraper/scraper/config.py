import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://subcontractor:subcontractor@localhost:5433/subcontractor_dashboard",
)

PROCORE_BASE_URL = "https://network.procore.com"
TARGET_STATE = "ca"
MAX_PAGES = 8
PAGE_SIZE = 40
REQUEST_DELAY = 2.0

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
