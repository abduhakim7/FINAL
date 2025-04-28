import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai.server';

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

interface SalesData {
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

interface AIResponse {
  trendAnalysis: string;
  categoryInsights: string;
  recommendations: string[];
  risks: string[];
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as SalesData;
    const openai = getOpenAIClient();

    // Prepare the prompt with the sales data
    const prompt = `Analyze the following sales data and provide insights:
Monthly Sales Data:
${data.monthlyData.map((m: MonthlyData) => `${m.name}: Sales ${m.sales}, Prediction ${m.prediction}`).join('\n')}

Category Performance:
${data.categoryData.map((c: CategoryData) => `${c.name}: Current ${c.current}, Previous ${c.previous}`).join('\n')}

Please provide:
1. A trend analysis of the monthly sales
2. Insights about category performance
3. Key recommendations (as a list)
4. Potential risks (as a list)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a business analyst AI that provides concise, actionable insights from sales data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    // Parse the response and structure it according to our interface
    const response = completion.choices[0].message.content || '';
    const sections = response.split('\n\n');

    return NextResponse.json({
      trendAnalysis: sections[0] || '',
      categoryInsights: sections[1] || '',
      recommendations: (sections[2] || '')
        .split('\n')
        .filter((line) => line.trim()),
      risks: (sections[3] || '').split('\n').filter((line) => line.trim())
    });
  } catch (error) {
    console.error('Error in AI insights generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
