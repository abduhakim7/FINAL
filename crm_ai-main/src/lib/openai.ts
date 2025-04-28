import { AIResponse } from './openai.server';

interface SalesData {
  monthlyData: Array<{ name: string; sales: number; prediction: number }>;
  categoryData: Array<{ name: string; current: number; previous: number }>;
}

export async function generateSalesInsights(
  data: SalesData
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights');
    }

    const result = await response.json();

    // If there's an error in the response, throw it
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}
