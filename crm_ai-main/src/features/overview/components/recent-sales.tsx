import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentSales } from '@/lib/supabase';

async function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export async function RecentSales() {
  const sales = await getRecentSales();
  const totalSales = sales.length;

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Latest {totalSales} transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {sales.map((sale) => {
            const customerName = sale.customers?.name || 'Unknown';
            const customerEmail = sale.customers?.email || '';
            const productName = sale.products?.name || 'Unknown Product';
            const productCategory = sale.products?.category || 'Uncategorized';
            const amount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(sale.total_amount);

            return (
              <div key={sale.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage
                    src={`https://api.slingacademy.com/public/sample-users/${Math.floor(Math.random() * 5) + 1}.png`}
                    alt='Avatar'
                  />
                  <AvatarFallback>{getInitials(customerName)}</AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {customerName}
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-muted-foreground text-sm'>
                      {productName}
                    </p>
                    <Badge variant='secondary' className='text-xs'>
                      {productCategory}
                    </Badge>
                  </div>
                </div>
                <div className='ml-auto text-right'>
                  <p className='font-medium'>+{amount}</p>
                  <p className='text-muted-foreground text-xs'>
                    Qty: {sale.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
