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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CityChart() {
  const { data, isPending } = useCityStats();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
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
        <CardTitle className="text-sm">Top Cities</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
