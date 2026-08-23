import { useQuery } from "@tanstack/react-query";

interface PublicStats {
  totalSubcontractors: number;
  uniqueCities: number;
  uniqueTrades: number;
}

async function fetchPublicStats(): Promise<PublicStats> {
  const res = await fetch("/api/public/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  return json.data;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public", "stats"],
    queryFn: fetchPublicStats,
    staleTime: 10 * 60 * 1000,
  });
}
