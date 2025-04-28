'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps } from 'recharts';
import { format, subMonths } from 'date-fns';

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
import { getSalesByCategory } from '@/lib/supabase';

const chartConfig = {
  Electronics: {
    label: 'Electronics',
    color: 'var(--primary)'
  },
  Fashion: {
    label: 'Fashion',
    color: 'var(--destructive)'
  },
  'Home & Living': {
    label: 'Home & Living',
    color: 'var(--warning)'
  },
  Sports: {
    label: 'Sports',
    color: 'var(--success)'
  }
} satisfies ChartConfig;

interface ChartData {
  date: string;
  [key: string]: string | number;
}

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('Electronics');
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [total, setTotal] = React.useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Get data for the last 3 months
        const endDate = new Date();
        const startDate = subMonths(endDate, 3);

        // Get monthly data
        const monthlyData = await Promise.all(
          Array.from({ length: 3 }, async (_, i) => {
            const monthEnd = subMonths(endDate, i);
            const monthStart = new Date(
              monthEnd.getFullYear(),
              monthEnd.getMonth(),
              1
            );
            return {
              date: format(monthEnd, 'MMM yyyy'),
              data: await getSalesByCategory(
                monthStart.toISOString(),
                monthEnd.toISOString()
              )
            };
          })
        );

        // Calculate totals
        const totals = Object.keys(chartConfig).reduce(
          (acc, category) => {
            acc[category] = monthlyData.reduce(
              (sum, month) => sum + (month.data[category] || 0),
              0
            );
            return acc;
          },
          {} as Record<string, number>
        );

        // Format chart data
        const formattedData = monthlyData.reverse().map((month) => ({
          date: month.date,
          ...month.data
        }));

        setChartData(formattedData);
        setTotal(totals);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className='@container/card !pt-3'>
        <CardHeader>
          <CardTitle>Loading sales data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Total sales for the last 3 months by product category
            </span>
            <span className='@[540px]/card:hidden'>Last 3 months</span>
          </CardDescription>
        </div>
        <div className='flex flex-wrap'>
          {Object.entries(chartConfig).map(([key, config]) => {
            if (total[key] === 0) return null;
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-6 sm:py-4'
                onClick={() => setActiveChart(key as keyof typeof chartConfig)}
              >
                <span className='text-muted-foreground text-xs'>
                  {config.label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-2xl'>
                  ${total[key]?.toLocaleString() || '0'}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 12
              }}
            />
            <Bar
              dataKey={activeChart}
              fill={chartConfig[activeChart].color}
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={({ active, payload }: TooltipProps<number, string>) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as ChartData;
                const value = data[activeChart];
                return (
                  <ChartTooltipContent>
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold'>
                        $
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : '0'}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {data.date}
                      </span>
                    </div>
                  </ChartTooltipContent>
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
