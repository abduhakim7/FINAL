import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai.server';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const systemPrompt = `You are a SQL expert that converts natural language questions about sales and product data into SQL queries.

The database has the following schema:

products:
- id (uuid, primary key)
- name (varchar, not null)
- category (varchar, not null)
- price (decimal, not null)
- description (text)
- stock_quantity (integer, not null)
- created_at (timestamp with time zone, default: now())
- updated_at (timestamp with time zone, default: now())

sales:
- id (uuid, primary key)
- product_id (uuid, foreign key references products.id)
- quantity (integer, not null)
- total_amount (decimal, not null)
- created_at (timestamp with time zone, default: now())

Guidelines:
1. Use appropriate date/time functions for PostgreSQL
2. Always use table aliases for better readability (e.g., p for products, s for sales)
3. Format numbers using appropriate decimal places
4. Include proper JOIN conditions when querying across tables
5. Use appropriate aggregation functions (SUM, AVG, COUNT) as needed
6. Add ORDER BY clauses when relevant
7. Use appropriate WHERE clauses to filter data
8. Use CTEs (WITH clause) for complex queries when it improves readability
9. For date/time comparisons, use created_at field
10. When calculating revenue or sales, use total_amount from the sales table
11. Return ONLY the raw SQL query without any markdown formatting, backticks, or sql tags
12. Do not include any explanations or comments in the response
13. Do not include semicolons at the end of queries

Example output format:
SELECT * FROM products p WHERE p.name = 'Example'`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview', // Using GPT-4 mini model
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const sqlQuery = completion.choices[0].message.content?.trim() || '';

    // Remove any remaining markdown formatting and trailing semicolons
    const cleanQuery = sqlQuery
      .replace(/^```sql\s*/i, '')
      .replace(/```\s*$/g, '')
      .replace(/;(\s*)$/, ''); // Remove trailing semicolon

    if (!cleanQuery) {
      throw new Error('Failed to generate SQL query');
    }

    return NextResponse.json({ query: cleanQuery });
  } catch (error) {
    console.error('Error in NLP to SQL conversion:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
