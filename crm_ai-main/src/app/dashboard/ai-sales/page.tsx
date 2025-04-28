import { Metadata } from 'next';
import AISalesView from '@/features/ai-sales/components/ai-sales-view';

export const metadata: Metadata = {
  title: 'Dashboard : AI Sales Analytics'
};

export default function AISalesPage() {
  return <AISalesView />;
}
