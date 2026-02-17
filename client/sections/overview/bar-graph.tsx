'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
    color: 'hsl(221, 83%, 53%)'
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

const TRANSACTION_STATUSES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Transactions' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READYTOPICKUP', label: 'Ready to Pick Up' },
  { value: 'OUTFORDELIVERY', label: 'Out for Delivery' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
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
  chartData: Array<{ date: string; totalRequests: number; status: string }>;
}) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('1month');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  const filteredData = React.useMemo(() => {
    const threshold = getDateThreshold(timeRange);

    // Filter by time range
    let data = chartData.filter((item) => new Date(item.date) >= threshold);

    // Filter by transaction status
    if (statusFilter !== 'ALL') {
      data = data.filter((item) => item.status === statusFilter);
    }

    // Aggregate by date (sum totalRequests for the same date)
    const aggregated: Record<string, number> = {};
    data.forEach((item) => {
      aggregated[item.date] = (aggregated[item.date] || 0) + item.totalRequests;
    });

    return Object.entries(aggregated)
      .map(([date, totalRequests]) => ({ date, totalRequests }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [chartData, timeRange, statusFilter]);

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
          <CardTitle>Requested Documents</CardTitle>
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
        <div className="mb-4 flex items-center justify-end gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <LineChart
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
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
            <Line
              dataKey="totalRequests"
              type="monotone"
              stroke="var(--color-totalRequests)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-totalRequests)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
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
