/**
 * Visits History Chart Component
 * Displays a line chart showing visits over time
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import type { VisitHistory } from "@/types/analytics";

interface VisitsHistoryChartProps {
  data: VisitHistory | null;
  days: number;
  loading?: boolean;
  onDaysChange: (days: number) => void;
}

const chartConfig = {
  visits: {
    label: "Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function VisitsHistoryChart({
  data,
  days,
  loading = false,
  onDaysChange,
}: VisitsHistoryChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData =
    data?.data.map((item) => ({
      date: formatDate(item.date),
      fullDate: item.date,
      visits: item.count,
    })) || [];

  // Calculate Y-axis domain based on data
  const visitsValues = chartData.map((item) => item.visits);
  const minVisits = Math.min(...visitsValues, 0);
  const maxVisits = Math.max(...visitsValues, 0);
  // Add some padding to the top (10% of range)
  const padding = (maxVisits - minVisits) * 0.1 || 1;
  const yAxisDomain = [Math.max(0, minVisits - padding), maxVisits + padding];

  return (
    <Card className="gap-0 p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative rounded-full p-2">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "var(--chart-1)",
                opacity: 0.1,
              }}
            />
            <Eye
              className="relative h-5 w-5"
              style={{
                color: "var(--chart-1)",
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold">Visits History</h3>
            <p className="text-sm text-muted-foreground">
              {data?.period || "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {[7, 30, 90, 365].map((d) => (
            <Button
              variant="ghost"
              aria-pressed={days === d}
              key={d}
              onClick={() => onDaysChange(d)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "var(--chart-1)" }}
          />
          <span className="text-sm text-muted-foreground">Total Visits</span>
          <span className="text-sm font-semibold">
            {loading ? "..." : data?.totalVisits.toLocaleString() || "0"}
          </span>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading chart data...
          </div>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              domain={yAxisDomain}
              tick={false}
              tickLine={false}
              axisLine={false}
              width={0}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  hideLabel
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const fullDate = payload[0].payload.fullDate;
                      return new Date(fullDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      });
                    }
                    return value;
                  }}
                />
              }
            />
            <Line
              dataKey="visits"
              type="linear"
              stroke="var(--color-visits)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-visits)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  );
}
