import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTradeStats } from "@/hooks/use-stats";

export function TradeChart() {
  const { data, isPending } = useTradeStats();

  if (isPending) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-[300px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const chartData = (data?.data ?? []).slice(0, 10);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">Top Trades</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 0, right: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" fontSize={12} />
          <YAxis
            type="category"
            dataKey="trade"
            width={160}
            fontSize={11}
            tickFormatter={(v: string) =>
              v.length > 22 ? `${v.slice(0, 22)}...` : v
            }
          />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="hsl(var(--chart-1))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
