import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { Subcontractor, PaginatedResponse } from "@shared/types";

export interface SubcontractorFilters {
  page?: number;
  limit?: number;
  search?: string;
  trade?: string;
  city?: string;
  companyType?: string;
  sortBy?: string;
  sortOrder?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function useSubcontractors(filters: SubcontractorFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  return useQuery({
    queryKey: ["subcontractors", filters],
    queryFn: () =>
      fetchJson<PaginatedResponse<Subcontractor>>(
        `/api/subcontractors?${params}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useSubcontractor(id: number) {
  return useQuery({
    queryKey: ["subcontractor", id],
    queryFn: () =>
      fetchJson<{ data: Subcontractor }>(`/api/subcontractors/${id}`),
    enabled: !!id,
  });
}
