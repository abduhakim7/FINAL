'use client';

import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useEffect, useState } from 'react';
import { getAISalesAnalytics } from '@/lib/supabase';
import { toast } from 'sonner';

interface MonthlyData {
  name: string;
  sales: number;
  prediction: number;
}

interface CategoryData {
  name: string;
  current: number;
  previous: number;
}

export function SalesCharts() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAISalesAnalytics();
        setMonthlyData(data.monthlyData);
        setCategoryData(data.categoryData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        toast.error('Failed to load sales analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Card className='p-6'>
          <h3 className='mb-6 text-lg font-semibold'>Sales Prediction</h3>
          <div className='flex h-[350px] items-center justify-center'>
            Loading...
          </div>
        </Card>
        <Card className='p-6'>
          <h3 className='mb-6 text-lg font-semibold'>Category Performance</h3>
          <div className='flex h-[350px] items-center justify-center'>
            Loading...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className='p-6'>
        <h3 className='mb-6 text-lg font-semibold'>Sales Prediction</h3>
        <div className='h-[350px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
              <XAxis
                dataKey='name'
                stroke='currentColor'
                strokeOpacity={0.5}
                fontSize={12}
              />
              <YAxis stroke='currentColor' strokeOpacity={0.5} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type='monotone'
                dataKey='sales'
                stroke='var(--primary)'
                name='Actual Sales'
                strokeWidth={2}
              />
              <Line
                type='monotone'
                dataKey='prediction'
                stroke='var(--primary)'
                name='AI Prediction'
                strokeDasharray='5 5'
                strokeOpacity={0.5}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className='p-6'>
        <h3 className='mb-6 text-lg font-semibold'>Category Performance</h3>
        <div className='h-[350px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
              <XAxis
                dataKey='name'
                stroke='currentColor'
                strokeOpacity={0.5}
                fontSize={12}
              />
              <YAxis stroke='currentColor' strokeOpacity={0.5} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey='current'
                fill='var(--primary)'
                name='Current Period'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='previous'
                fill='var(--primary)'
                fillOpacity={0.4}
                name='Previous Period'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
