'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const chartConfig = {
  views: {
    label: 'Requested'
  },
  totalRequests: {
    label: 'Total Requested',
    color: 'hsl(30, 90%, 56%)'
  }
} satisfies ChartConfig;

type TimeRange = 'yesterday' | '7days' | '1month' | '6months' | '1year';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '1month', label: 'Last Month' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' }
];

function getDateThreshold(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case 'yesterday':
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
    case '7days':
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
    case '1month':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
    case '6months':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
    case '1year':
      return new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
  }
}

export function BarGraph({
  chartData
}: {
  chartData: Array<{ date: string; totalRequests: number }>;
}) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('1month');

  const filteredData = React.useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    return chartData.filter((item) => new Date(item.date) >= threshold);
  }, [chartData, timeRange]);

  const total = React.useMemo(
    () => ({
      totalRequests: filteredData.reduce(
        (acc, curr) => acc + curr.totalRequests,
        0
      )
    }),
    [filteredData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Requested Documents</CardTitle>
          <CardDescription>
            Showing total of student requesting academic documents
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Total Requested
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.totalRequests.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="mb-4 flex items-center justify-end">
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as TimeRange)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey="totalRequests"
              fill="var(--color-totalRequests)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        {filteredData.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
