'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartData = [
  {
    month: 'October',
    Sports: 159.98,
    Electronics: 0,
    Fashion: 0,
    'Home & Living': 0
  },
  {
    month: 'November',
    Sports: 1839.77,
    Electronics: 0,
    Fashion: 0,
    'Home & Living': 0
  },
  {
    month: 'December',
    Sports: 719.91,
    Electronics: 0,
    Fashion: 0,
    'Home & Living': 0
  },
  {
    month: 'January',
    Sports: 1519.81,
    Electronics: 0,
    Fashion: 0,
    'Home & Living': 0
  },
  {
    month: 'February',
    Sports: 2479.69,
    Electronics: 241.0,
    Fashion: 0,
    'Home & Living': 2425.0
  },
  {
    month: 'March',
    Sports: 879.89,
    Electronics: 2922.0,
    Fashion: 1482.0,
    'Home & Living': 185.0
  },
  {
    month: 'April',
    Sports: 1839.77,
    Electronics: 733.0,
    Fashion: 1152.0,
    'Home & Living': 0
  }
];

const chartConfig = {
  sales: {
    label: 'Sales'
  },
  Sports: {
    label: 'Sports',
    color: 'var(--primary)'
  },
  Electronics: {
    label: 'Electronics',
    color: 'var(--blue-600)'
  },
  Fashion: {
    label: 'Fashion',
    color: 'var(--pink-600)'
  },
  'Home & Living': {
    label: 'Home & Living',
    color: 'var(--green-600)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>
          Monthly sales breakdown by product category
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillSports' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillElectronics' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--blue-600)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--blue-600)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillFashion' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--pink-600)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--pink-600)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillHomeLiving' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--green-600)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--green-600)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='Sports'
              type='monotone'
              fill='url(#fillSports)'
              stroke='var(--primary)'
              stackId='1'
            />
            <Area
              dataKey='Electronics'
              type='monotone'
              fill='url(#fillElectronics)'
              stroke='var(--blue-600)'
              stackId='1'
            />
            <Area
              dataKey='Fashion'
              type='monotone'
              fill='url(#fillFashion)'
              stroke='var(--pink-600)'
              stackId='1'
            />
            <Area
              dataKey='Home & Living'
              type='monotone'
              fill='url(#fillHomeLiving)'
              stroke='var(--green-600)'
              stackId='1'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Sports category leads with highest total sales
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              October 2023 - April 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
