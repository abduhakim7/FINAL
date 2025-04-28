'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const exampleQueries = [
  'What were the total sales in each category last month?',
  'Which are our top 5 best-selling products?',
  'What is most popular product?',
  'High Stock products?',
  'What is the total sales for each product?'
];

interface RecentQuery {
  question: string;
  sql: string;
  timestamp: Date;
}

interface ErrorResponse {
  error: string;
  details?: string;
  hint?: string;
}

export default function NLPToSQLView() {
  const [query, setQuery] = useState('');
  const [sqlResult, setSqlResult] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setQueryResults([]);
    setError(null);
    try {
      const response = await fetch('/api/nlp-to-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: query })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert question to SQL');
      }

      const data = await response.json();
      setSqlResult(data.query);

      // Add to recent queries
      setRecentQueries((prev) =>
        [
          {
            question: query,
            sql: data.query,
            timestamp: new Date()
          },
          ...prev
        ].slice(0, 5)
      ); // Keep only last 5 queries

      // Execute the query
      await executeQuery(data.query);

      toast.success('Successfully converted to SQL!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to convert question to SQL'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async (sql: string) => {
    setIsExecuting(true);
    setError(null);
    try {
      const response = await fetch('/api/nlp-to-sql/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data);
        throw new Error(data.error);
      }

      // Ensure we're setting the results correctly
      if (data.results && Array.isArray(data.results)) {
        setQueryResults(data.results);
        console.log('Query results:', data.results); // Debug log
      } else {
        setQueryResults([]);
        console.log('No results or invalid format:', data); // Debug log
      }
    } catch (error) {
      console.error('Error executing query:', error);

      // If we haven't already set an error from the response
      if (!error) {
        setError({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to execute SQL query',
          hint: 'Check your database connection and try again'
        });
      }

      toast.error(
        error instanceof Error ? error.message : 'Failed to execute SQL query'
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const renderResults = () => {
    if (!queryResults || queryResults.length === 0) {
      return (
        <div className='text-muted-foreground p-4 text-center text-sm'>
          No results to display
        </div>
      );
    }

    // Debug log
    console.log('Rendering results:', queryResults);

    const columns = Object.keys(queryResults[0]);

    return (
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className='whitespace-nowrap'>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {queryResults.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column} className='whitespace-nowrap'>
                    {row[column] === null
                      ? 'NULL'
                      : typeof row[column] === 'object'
                        ? JSON.stringify(row[column])
                        : String(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className='border-destructive/50 mt-4 rounded-lg border p-4'>
        <div className='text-destructive flex items-center gap-2'>
          <Icons.warning className='h-4 w-4' />
          <p className='font-medium'>{error.error}</p>
        </div>
        {error.details && (
          <p className='text-muted-foreground mt-2 text-sm'>
            <span className='font-medium'>Details:</span> {error.details}
          </p>
        )}
        {error.hint && (
          <p className='text-muted-foreground mt-2 text-sm'>
            <span className='font-medium'>Hint:</span> {error.hint}
          </p>
        )}
        <div className='mt-4 flex justify-end'>
          <Button variant='outline' size='sm' onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container space-y-8 p-8 pt-6'>
        <Heading
          title='AI Sales Assistant'
          description='Ask questions about your sales data and get instant insights'
        />

        <div className='grid gap-6 md:grid-cols-12'>
          {/* Input Section */}
          <Card className='col-span-12 p-6 md:col-span-8'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Ask Your Question</h3>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setQuery('');
                    setSqlResult('');
                    setQueryResults([]);
                  }}
                  disabled={!query}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!query || isLoading}
                  size='sm'
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Icons.analytics className='mr-2 h-4 w-4' />
                      Get Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder='Ask any question about your sales data...'
              className='min-h-[120px] resize-none'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className='mt-4'>
              <p className='text-muted-foreground text-sm'>Try asking:</p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {exampleQueries.map((example) => (
                  <Button
                    key={example}
                    variant='outline'
                    size='sm'
                    className='text-xs'
                    onClick={() => setQuery(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Queries Section */}
          <Card className='col-span-12 p-6 md:col-span-4'>
            <h3 className='mb-4 text-lg font-semibold'>Recent Questions</h3>
            <div className='space-y-4'>
              {recentQueries.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No recent questions yet
                </p>
              ) : (
                recentQueries.map((rq, index) => (
                  <div key={index} className='bg-muted rounded-lg p-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-primary text-sm font-medium'>
                        {rq.question}
                      </p>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={() => {
                          setQuery(rq.question);
                          setSqlResult(rq.sql);
                          executeQuery(rq.sql);
                        }}
                      >
                        <Icons.redo2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {new Date(rq.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Results Section */}
          <Card className='col-span-12 p-6'>
            <div className='rounded-lg'>
              {isExecuting ? (
                <div className='flex items-center justify-center p-8'>
                  <Icons.spinner className='h-6 w-6 animate-spin' />
                  <span className='ml-2'>Fetching results...</span>
                </div>
              ) : error ? (
                renderError()
              ) : (
                renderResults()
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
