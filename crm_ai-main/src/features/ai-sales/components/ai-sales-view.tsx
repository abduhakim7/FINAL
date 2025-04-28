'use client';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { SalesCharts } from './sales-charts';
import { useEffect, useState } from 'react';
import { getAISalesAnalytics } from '@/lib/supabase';
import { generateSalesInsights } from '@/lib/openai';
import { toast } from 'sonner';

interface Insight {
  title: string;
  content: string | string[];
  type: 'text' | 'list';
}

export default function AISalesView() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateInsights() {
      try {
        const data = await getAISalesAnalytics();

        // Get AI-powered insights
        const aiInsights = await generateSalesInsights(data);

        // Transform AI insights into our UI format
        const newInsights: Insight[] = [
          {
            title: 'Sales Trend Analysis',
            content: aiInsights.trendAnalysis,
            type: 'text'
          },
          {
            title: 'Category Performance',
            content: aiInsights.categoryInsights,
            type: 'text'
          },
          {
            title: 'AI Recommendations',
            content: aiInsights.recommendations,
            type: 'list'
          },
          {
            title: 'Risk Assessment',
            content: aiInsights.risks,
            type: 'list'
          }
        ];

        setInsights(newInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
        toast.error('Failed to generate AI insights');

        // Fallback to basic insights if AI fails
        const data = await getAISalesAnalytics();
        const currentTotal = data.categoryData.reduce(
          (sum, cat) => sum + cat.current,
          0
        );
        const previousTotal = data.categoryData.reduce(
          (sum, cat) => sum + cat.previous,
          0
        );
        const growthPercentage = (
          ((currentTotal - previousTotal) / previousTotal) *
          100
        ).toFixed(1);

        const topCategories = data.categoryData
          .map((cat) => ({
            name: cat.name,
            growth: ((cat.current - cat.previous) / cat.previous) * 100
          }))
          .sort((a, b) => b.growth - a.growth)
          .filter((cat) => cat.growth > 0)
          .slice(0, 2)
          .map((cat) => cat.name);

        const fallbackInsights: Insight[] = [
          {
            title: 'Growth Trend',
            content: `${growthPercentage}% ${parseFloat(growthPercentage) >= 0 ? 'increase' : 'decrease'} in sales compared to the previous period. ${
              topCategories.length > 0
                ? `Key growth categories are ${topCategories.join(' and ')}.`
                : ''
            }`,
            type: 'text'
          },
          {
            title: 'Recommendations',
            content: [
              ...topCategories.map(
                (cat) => `Increase inventory for ${cat} category by 20%`
              ),
              'Optimize pricing strategy for underperforming categories',
              'Consider seasonal promotions for growth categories'
            ],
            type: 'list'
          }
        ];

        setInsights(fallbackInsights);
      } finally {
        setLoading(false);
      }
    }

    generateInsights();
  }, []);

  return (
    <div className='h-[calc(100vh-65px)] overflow-y-auto'>
      <div className='container space-y-8 p-8 pt-6'>
        <Heading
          title='AI Sales Analytics'
          description='Advanced sales analytics powered by AI'
        />

        <div className='grid gap-6 md:grid-cols-2'>
          <SalesCharts />

          <Card className='p-6 md:col-span-2'>
            <h3 className='mb-4 text-lg font-semibold'>AI Insights</h3>
            <div className='space-y-4'>
              {loading ? (
                <div className='bg-muted rounded-lg p-4'>
                  Generating AI insights...
                </div>
              ) : (
                insights.map((insight, index) => (
                  <div key={index} className='bg-muted rounded-lg p-4'>
                    <h4 className='text-primary font-medium'>
                      {insight.title}
                    </h4>
                    {insight.type === 'text' ? (
                      <p className='mt-2 text-sm'>{insight.content}</p>
                    ) : (
                      <ul className='mt-2 list-inside list-disc space-y-1 text-sm'>
                        {(insight.content as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
