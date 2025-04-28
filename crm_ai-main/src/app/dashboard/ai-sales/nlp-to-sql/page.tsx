import { Metadata } from 'next';
import NLPToSQLView from '@/features/ai-sales/components/nlp-to-sql-view';

export const metadata: Metadata = {
  title: 'Dashboard : NLP to SQL Converter'
};

export default function NLPToSQLPage() {
  return (
    <div className='h-[calc(100vh-65px)]'>
      <NLPToSQLView />
    </div>
  );
}
