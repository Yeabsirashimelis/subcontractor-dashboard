import { Building2, MapPin, Wrench, Building } from "lucide-react";
import { useOverviewStats } from "@/hooks/use-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, key, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-md bg-primary/10 p-1.5 sm:p-2">
                <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {label}
                </p>
                {isPending ? (
                  <Skeleton className="mt-1 h-6 w-12 sm:h-7 sm:w-16" />
                ) : (
                  <p className="text-xl font-bold sm:text-2xl">
                    {stats?.[key]?.toLocaleString() ?? "—"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
