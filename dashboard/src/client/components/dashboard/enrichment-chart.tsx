import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useEnrichmentStats } from "@/hooks/use-stats";
import { useIsMobile } from "@/hooks/use-mobile";
import { CHART_COLORS } from "@/lib/chart-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function formatDollar(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function EnrichmentChart() {
  const { data, isPending } = useEnrichmentStats();
  const [view, setView] = useState<"coverage" | "awards" | "sam">("coverage");
  const isMobile = useIsMobile();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full sm:h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  const stats = data?.data;
  if (!stats) return null;

  const coverageData = [
    { name: "SAM.gov Registered", value: stats.coverage.samRegistered },
    { name: "Federal Awards", value: stats.coverage.hasFederalAwards },
    { name: "SF Vendor Payments", value: stats.coverage.hasSfContracts },
    {
      name: "No Govt Data",
      value:
        stats.coverage.total -
        Math.max(
          stats.coverage.samRegistered,
          stats.coverage.hasFederalAwards,
          stats.coverage.hasSfContracts
        ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Government Data</CardTitle>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "coverage" | "awards" | "sam")}
        >
          <TabsList className="h-7">
            <TabsTrigger value="coverage" className="text-xs px-2 h-5">
              Coverage
            </TabsTrigger>
            <TabsTrigger value="awards" className="text-xs px-2 h-5">
              Awards
            </TabsTrigger>
            <TabsTrigger value="sam" className="text-xs px-2 h-5">
              SAM
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
          {view === "coverage" ? (
            <PieChart>
              <Pie
                data={coverageData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 80 : 100}
                paddingAngle={2}
                dataKey="value"
                label={
                  isMobile
                    ? false
                    : ({ name, value }) => `${name}: ${value}`
                }
                labelLine={!isMobile}
              >
                {coverageData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {isMobile && <Legend />}
            </PieChart>
          ) : view === "awards" ? (
            <BarChart
              data={stats.awardRanges}
              margin={{ bottom: isMobile ? 50 : 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="range"
                fontSize={isMobile ? 9 : 11}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis fontSize={11} width={30} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "total") return [formatDollar(Number(value)), "Total Value"];
                  return [value, "Companies"];
                }}
              />
              <Bar
                dataKey="count"
                name="Companies"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <BarChart
              data={stats.samStatus}
              margin={{ bottom: isMobile ? 20 : 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" fontSize={11} />
              <YAxis fontSize={11} width={30} />
              <Tooltip />
              <Bar
                dataKey="count"
                name="Entities"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
