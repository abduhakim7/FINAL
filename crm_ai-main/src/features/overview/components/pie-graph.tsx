'use client';

import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getCategoryDistribution } from '@/lib/supabase';

const COLORS = {
  Electronics: 'var(--primary)',
  Fashion: 'var(--destructive)',
  'Home & Living': 'var(--warning)',
  Sports: 'var(--success)'
};

export function PieGraph() {
  const [data, setData] = React.useState<
    Array<{ name: string; value: number }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const distribution = await getCategoryDistribution();

        // Convert to chart data format
        const chartData = Object.entries(distribution).map(
          ([category, amount]) => ({
            name: category,
            value: amount
          })
        );

        // Calculate total
        const totalAmount = chartData.reduce(
          (sum, item) => sum + item.value,
          0
        );

        setData(chartData);
        setTotal(totalAmount);
      } catch (error) {
        console.error('Error fetching category distribution:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading category data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Distribution</CardTitle>
        <CardDescription>
          Revenue distribution by product category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex h-[350px] items-center justify-center'>
          <PieChart width={350} height={350}>
            <Pie
              data={data}
              cx={175}
              cy={175}
              innerRadius={60}
              outerRadius={150}
              fill='#8884d8'
              paddingAngle={2}
              dataKey='value'
              label={({ name, value }) =>
                `${name} (${((value / total) * 100).toFixed(1)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className='mt-4 grid grid-cols-2 gap-4'>
          {data.map((item) => (
            <div key={item.name} className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div
                  className='mr-2 h-3 w-3 rounded-full'
                  style={{
                    backgroundColor:
                      COLORS[item.name as keyof typeof COLORS] || '#8884d8'
                  }}
                />
                <span className='text-sm font-medium'>{item.name}</span>
              </div>
              <span className='text-muted-foreground text-sm'>
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
