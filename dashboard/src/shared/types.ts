export interface Subcontractor {
  id: number;
  procoreSlug: string | null;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  companyType: string | null;
  description: string | null;
  employeeCount: string | null;
  avgContractSize: string | null;
  logoUrl: string | null;
  trades: string[];
  marketSectors: string[];
  businessClassifications: string[];
  serviceAreas: string[];
  totalProjects: number | null;
  activeProjects: number | null;
  samUei: string | null;
  samStatus: string | null;
  federalAwardsTotal: number | null;
  nycBidsCount: number | null;
  sourceUrl: string | null;
  scrapedAt: string | null;
  enrichedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatsOverview {
  totalSubcontractors: number;
  uniqueCities: number;
  uniqueTrades: number;
  uniqueCompanyTypes: number;
}

export interface TradeCount {
  trade: string;
  count: number;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface FilterOptions {
  trades: string[];
  cities: string[];
  companyTypes: string[];
}
