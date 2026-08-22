import { useState, useEffect } from "react";
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

export function TradeChart() {
  const { data, isPending } = useTradeStats();
  const isMobile = useIsMobile();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
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
        <CardTitle className="text-sm">Top Trades</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={11} />
            <YAxis
              type="category"
              dataKey="trade"
              width={isMobile ? 100 : 160}
              fontSize={isMobile ? 10 : 11}
              tickFormatter={(v: string) => {
                const max = isMobile ? 14 : 22;
                return v.length > max ? `${v.slice(0, max)}...` : v;
              }}
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
