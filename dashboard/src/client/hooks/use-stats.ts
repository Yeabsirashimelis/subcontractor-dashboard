import { useQuery } from "@tanstack/react-query";
import type {
  StatsOverview,
  TradeCount,
  CityCount,
  FilterOptions,
} from "@shared/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function useOverviewStats() {
  return useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () => fetchJson<{ data: StatsOverview }>("/api/stats/overview"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTradeStats() {
  return useQuery({
    queryKey: ["stats", "trades"],
    queryFn: () => fetchJson<{ data: TradeCount[] }>("/api/stats/trades"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCityStats() {
  return useQuery({
    queryKey: ["stats", "cities"],
    queryFn: () =>
      fetchJson<{ data: CityCount[] }>("/api/stats/cities"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompanyTypeStats() {
  return useQuery({
    queryKey: ["stats", "company-types"],
    queryFn: () =>
      fetchJson<{ data: { companyType: string; count: number }[] }>(
        "/api/stats/company-types"
      ),
    staleTime: 10 * 60 * 1000,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filters", "options"],
    queryFn: () =>
      fetchJson<{ data: FilterOptions }>("/api/filters/options"),
    staleTime: 10 * 60 * 1000,
  });
}
