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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, key, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                {isPending ? (
                  <Skeleton className="mt-1 h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold">
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
