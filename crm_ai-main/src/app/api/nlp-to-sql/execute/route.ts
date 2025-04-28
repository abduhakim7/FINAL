import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wcasbqkqxfowzymhrfny.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjYXNicWtxeGZvd3p5bWhyZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NDUwODYsImV4cCI6MjA2MTIyMTA4Nn0.9gksJmdqMvlM7Kiy6yWbhXUXcDFtFgzlI_Oqp5D4SZA';

// Function to check if a query is read-only
function isReadOnlyQuery(query: string): boolean {
  // Remove markdown SQL formatting if present
  const cleanedQuery = query.replace(/^```sql\s*/i, '').replace(/```\s*$/g, '');

  // Normalize the query: remove extra whitespace and convert to lowercase
  const normalizedQuery = cleanedQuery
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  // Allow queries that start with these keywords
  const allowedStartKeywords = [
    'select',
    'with',
    'explain',
    'show',
    'describe',
    'desc'
  ];

  // First word of the query
  const firstWord = normalizedQuery.split(' ')[0];

  // Check if query starts with allowed keywords
  const startsWithAllowed = allowedStartKeywords.includes(firstWord);

  // Disallow any data modification keywords
  const disallowedKeywords = [
    'insert',
    'update',
    'delete',
    'drop',
    'truncate',
    'alter',
    'create',
    'replace',
    'grant',
    'revoke'
  ];

  const containsDisallowed = disallowedKeywords.some((keyword) =>
    // Check for whole words only using word boundaries
    new RegExp(`\\b${keyword}\\b`).test(normalizedQuery)
  );

  return startsWithAllowed && !containsDisallowed;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'SQL query is required and must be a string' },
        { status: 400 }
      );
    }

    // Clean the query
    const cleanQuery = query.trim();

    // Initialize Supabase client with anon key
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Execute the query
    try {
      // Check if the query is read-only
      if (!isReadOnlyQuery(cleanQuery)) {
        return NextResponse.json(
          {
            error: 'Only read-only queries are allowed',
            hint: 'For security reasons, only SELECT, WITH, and other read operations are permitted'
          },
          { status: 400 }
        );
      }

      // Execute the query using RPC
      const { data, error } = await supabase.rpc('exec_sql', {
        query_text: cleanQuery
      });

      if (error) {
        console.error('Error executing SQL query:', {
          error,
          query: cleanQuery,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        return NextResponse.json(
          {
            error: 'Failed to execute SQL query',
            details: error.message,
            hint:
              error.hint ||
              'Check if the query syntax is correct and all tables/columns exist'
          },
          { status: 500 }
        );
      }

      // Ensure we always return an array of results
      const results = Array.isArray(data) ? data : [];

      return NextResponse.json({
        results,
        metadata: {
          rowCount: results.length,
          query: cleanQuery
        }
      });
    } catch (queryError) {
      console.error('Query execution threw an error:', queryError);
      return NextResponse.json(
        {
          error: 'Error during query execution',
          details:
            queryError instanceof Error ? queryError.message : 'Unknown error',
          hint: 'Verify that the query is valid and all referenced tables/columns exist'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in SQL execution:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check the server logs for more information'
      },
      { status: 500 }
    );
  }
}
