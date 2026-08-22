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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TradeChart() {
  const { data, isPending } = useTradeStats();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (data?.data ?? []).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top Trades</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
