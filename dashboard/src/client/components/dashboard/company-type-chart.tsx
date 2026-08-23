import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useCompanyTypeStats } from "@/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210, 60%, 55%)",
  "hsl(340, 55%, 55%)",
  "hsl(160, 50%, 45%)",
];

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export function CompanyTypeChart() {
  const { data, isPending } = useCompanyTypeStats();
  const [view, setView] = useState<"pie" | "bar">("pie");
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

  const raw = data?.data ?? [];
  const PRIMARY_TYPES = [
    "Specialty Contractor",
    "General Contractor",
    "Supplier",
    "Consultant",
    "Architect",
    "Owner Real Estate Developer",
    "Engineer",
  ];

  const grouped = new Map<string, number>();
  for (const row of raw) {
    const types = (row.companyType ?? "Other").split(",").map((s) => s.trim());
    const primary = types.find((t) => PRIMARY_TYPES.includes(t)) ?? "Other";
    grouped.set(primary, (grouped.get(primary) ?? 0) + Number(row.count));
  }

  const chartData = Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Company Types</CardTitle>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "pie" | "bar")}
        >
          <TabsList className="h-7">
            <TabsTrigger value="pie" className="text-xs px-2 h-5">
              Pie
            </TabsTrigger>
            <TabsTrigger value="bar" className="text-xs px-2 h-5">
              Bar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
          {view === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 80 : 100}
                paddingAngle={2}
                dataKey="value"
                label={isMobile ? false : ({ name, value }) =>
                  `${name} (${Math.round((value / total) * 100)}%)`
                }
                labelLine={!isMobile}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                  "Count",
                ]}
              />
              {isMobile && <Legend />}
            </PieChart>
          ) : (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 100 : 140}
                fontSize={isMobile ? 10 : 11}
                tickFormatter={(v: string) => {
                  const max = isMobile ? 14 : 20;
                  return v.length > max ? `${v.slice(0, max)}...` : v;
                }}
              />
              <Tooltip
                formatter={(value) => [
                  `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                  "Count",
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
