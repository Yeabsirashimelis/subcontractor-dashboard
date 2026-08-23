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
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CityChart() {
  const { data, isPending } = useCityStats();
  const isMobile = useIsMobile();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full sm:h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (data?.data ?? []).slice(0, isMobile ? 7 : 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top Cities</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={chartData} margin={{ bottom: isMobile ? 50 : 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="city"
              fontSize={isMobile ? 10 : 11}
              angle={-45}
              textAnchor="end"
              interval={0}
              tickFormatter={(v: string) => {
                const max = isMobile ? 10 : 20;
                return v.length > max ? `${v.slice(0, max)}...` : v;
              }}
            />
            <YAxis fontSize={11} width={30} />
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
