import OpenAI from 'openai';

// Initialize OpenAI client
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  return new OpenAI({
    apiKey
  });
}

export interface AIResponse {
  trendAnalysis: string;
  categoryInsights: string;
  recommendations: string[];
  risks: string[];
}
