import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useSubcontractors,
  type SubcontractorFilters,
} from "@/hooks/use-subcontractors";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TradeChart } from "@/components/dashboard/trade-chart";
import { CityChart } from "@/components/dashboard/city-chart";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { SubcontractorTable } from "@/components/dashboard/subcontractor-table";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<SubcontractorFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isPending } = useSubcontractors(filters);

  const handleFilterChange = useCallback(
    (update: Partial<SubcontractorFilters>) => {
      setFilters((prev) => ({ ...prev, ...update }));
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Subcontractor Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <TradeChart />
          <CityChart />
        </div>

        <div className="space-y-4">
          <SearchFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <SubcontractorTable
            data={data}
            isPending={isPending}
            page={filters.page ?? 1}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        </div>
      </main>
    </div>
  );
}
