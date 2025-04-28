import { Metadata } from 'next';
import CustomersView from '@/features/customers/components/customers-view';
import PageContainer from '@/components/layout/page-container';

export const metadata: Metadata = {
  title: 'Dashboard : Customers'
};

export default function CustomersPage() {
  return (
    <PageContainer scrollable>
      <CustomersView />
    </PageContainer>
  );
}
