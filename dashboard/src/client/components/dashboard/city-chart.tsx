import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useCityStats } from "@/hooks/use-stats";

export function CityChart() {
  const { data, isPending } = useCityStats();

  if (isPending) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-[300px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const chartData = (data?.data ?? []).slice(0, 10);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">Top Cities</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="city"
            fontSize={11}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
