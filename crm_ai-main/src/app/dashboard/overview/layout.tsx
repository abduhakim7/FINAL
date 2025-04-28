'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    previousRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const stats = await getDashboardStats();
        setMetrics(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Calculate growth rate
  const growthRate =
    metrics.previousRevenue > 0
      ? ((metrics.totalRevenue - metrics.previousRevenue) /
          metrics.previousRevenue) *
        100
      : 0;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {loading ? 'Loading...' : formatCurrency(metrics.totalRevenue)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {metrics.totalRevenue > metrics.previousRevenue ? (
                    <IconTrendingUp />
                  ) : (
                    <IconTrendingDown />
                  )}
                  {(
                    ((metrics.totalRevenue - metrics.previousRevenue) /
                      metrics.previousRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {metrics.totalRevenue > metrics.previousRevenue
                  ? 'Trending up'
                  : 'Trending down'}{' '}
                this month{' '}
                {metrics.totalRevenue > metrics.previousRevenue ? (
                  <IconTrendingUp className='size-4' />
                ) : (
                  <IconTrendingDown className='size-4' />
                )}
              </div>
              <div className='text-muted-foreground'>
                Revenue for the last 30 days
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>New Customers</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {loading ? 'Loading...' : metrics.totalCustomers}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  New
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Total registered customers <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Customer acquisition metrics
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Active Accounts</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {loading ? 'Loading...' : metrics.activeCustomers}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Currently active users <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Active user engagement
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Growth Rate</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {loading ? 'Loading...' : `${growthRate.toFixed(1)}%`}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {growthRate >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                  {growthRate.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {growthRate >= 0 ? 'Positive' : 'Negative'} growth trend{' '}
                {growthRate >= 0 ? (
                  <IconTrendingUp className='size-4' />
                ) : (
                  <IconTrendingDown className='size-4' />
                )}
              </div>
              <div className='text-muted-foreground'>
                30-day revenue growth rate
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
