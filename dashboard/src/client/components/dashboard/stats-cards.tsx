import { Building2, MapPin, Wrench, Building } from "lucide-react";
import { useOverviewStats } from "@/hooks/use-stats";

const cards = [
  { label: "Total Subcontractors", key: "totalSubcontractors", icon: Building2 },
  { label: "Cities", key: "uniqueCities", icon: MapPin },
  { label: "Trades", key: "uniqueTrades", icon: Wrench },
  { label: "Company Types", key: "uniqueCompanyTypes", icon: Building },
] as const;

export function StatsCards() {
  const { data, isPending } = useOverviewStats();
  const stats = data?.data;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, key, icon: Icon }) => (
        <div
          key={key}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {isPending ? (
                <div className="mt-1 h-7 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-bold">
                  {stats?.[key]?.toLocaleString() ?? "—"}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
