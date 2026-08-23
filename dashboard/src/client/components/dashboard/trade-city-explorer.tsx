import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useTradesByCity,
  useTradeStats,
  useCityStats,
} from "@/hooks/use-stats";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function TradeCityExplorer() {
  const [mode, setMode] = useState<"by-city" | "by-trade">("by-city");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedTrade, setSelectedTrade] = useState<string>("");
  const isMobile = useIsMobile();

  const { data: tradesData } = useTradeStats();
  const { data: citiesData } = useCityStats();

  const trades = (tradesData?.data ?? []).map((t) => t.trade);
  const cities = (citiesData?.data ?? []).map((c) => c.city);

  const { data: results, isPending } = useTradesByCity(
    mode === "by-city" ? selectedCity : undefined,
    mode === "by-trade" ? selectedTrade : undefined
  );

  const chartData = results?.data ?? [];
  const hasSelection =
    (mode === "by-city" && selectedCity) ||
    (mode === "by-trade" && selectedTrade);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm">Trade &times; City Explorer</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as "by-city" | "by-trade");
              setSelectedCity("");
              setSelectedTrade("");
            }}
          >
            <TabsList className="h-7">
              <TabsTrigger value="by-city" className="text-xs px-2 h-5">
                Pick City
              </TabsTrigger>
              <TabsTrigger value="by-trade" className="text-xs px-2 h-5">
                Pick Trade
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {mode === "by-city" ? (
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-7 w-[160px] text-xs">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="text-xs">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="h-7 w-[200px] text-xs">
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {trades.map((trade) => (
                  <SelectItem key={trade} value={trade} className="text-xs">
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {!hasSelection ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px]">
            {mode === "by-city"
              ? "Select a city to see its trade breakdown"
              : "Select a trade to see which cities have it"}
          </div>
        ) : isPending ? (
          <Skeleton className="h-[250px] w-full sm:h-[300px]" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px]">
            No data found
          </div>
        ) : (
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
                dataKey="name"
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
                name={mode === "by-city" ? "Trades" : "Companies"}
                fill="hsl(var(--chart-4))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
