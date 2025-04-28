'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Heading } from '@/components/heading';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { CustomerFormDialog } from './customer-form-dialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Customer = Database['public']['Tables']['customers']['Row'] & {
  total_spent?: number;
  order_count?: number;
  last_order?: string;
};

type FilterState = {
  status: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  minOrders: number | undefined;
  minSpent: number | undefined;
};

type FilterKey = keyof FilterState;
type FilterValue<K extends FilterKey> = FilterState[K];

export default function CustomersView() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: { from: undefined, to: undefined },
    minOrders: undefined,
    minSpent: undefined
  });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
    customerRetention: 0
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer>();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);

      // Fetch customers with their sales data in a single query
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(
          `
          *,
          sales:sales(
            id,
            total_amount,
            created_at
          )
        `
        )
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast.error('Failed to fetch customers: ' + customersError.message);
        return;
      }

      if (!customersData) {
        toast.error('No data received from the server');
        return;
      }

      // Process the data to match our UI needs
      const processedCustomers = customersData.map((customer: any) => {
        const sales = customer.sales || [];
        const total_spent = sales.reduce(
          (sum: number, sale: any) => sum + (sale.total_amount || 0),
          0
        );
        const order_count = sales.length;
        const last_order =
          sales.length > 0
            ? new Date(
                Math.max(
                  ...sales.map((s: any) => new Date(s.created_at).getTime())
                )
              )
                .toISOString()
                .split('T')[0]
            : undefined;

        return {
          ...customer,
          total_spent,
          order_count,
          last_order,
          sales: undefined // Remove the sales data as it's no longer needed
        };
      });

      setCustomers(processedCustomers);
    } catch (error) {
      console.error('Error processing customer data:', error);
      toast.error('Error processing customer data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      // Fetch all required stats in parallel
      const [customersResponse, salesResponse] = await Promise.all([
        supabase.from('customers').select('status'),
        supabase
          .from('sales')
          .select('total_amount, created_at')
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ) // Last 30 days
      ]);

      if (customersResponse.error) throw customersResponse.error;
      if (salesResponse.error) throw salesResponse.error;

      const customersData = customersResponse.data || [];
      const salesData = salesResponse.data || [];

      // Calculate stats
      const totalCustomers = customersData.length;
      const activeCustomers = customersData.filter(
        (c) => c.status === 'active'
      ).length;

      // Calculate sales metrics
      const totalSales = salesData.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );
      const averageOrderValue =
        salesData.length > 0 ? totalSales / salesData.length : 0;

      // Calculate retention (active customers / total customers)
      const customerRetention =
        totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

      setStats({
        totalCustomers,
        activeCustomers,
        averageOrderValue,
        customerRetention
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching statistics');
    }
  }

  // Add useEffect for real-time updates
  useEffect(() => {
    // Subscribe to customers table changes
    const customersSubscription = supabase
      .channel('customers-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          fetchCustomers();
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to sales table changes
    const salesSubscription = supabase
      .channel('sales-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        () => {
          fetchCustomers();
          fetchStats();
        }
      )
      .subscribe();

    // Initial fetch
    fetchCustomers();
    fetchStats();

    // Cleanup subscriptions
    return () => {
      customersSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, []);

  async function handleDeleteCustomer(customer: Customer) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast.success('Customer deleted successfully');
      fetchCustomers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Error deleting customer');
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(undefined);
    }
  }

  function handleEdit(customer: Customer) {
    setSelectedCustomer(customer);
    setFormOpen(true);
  }

  function handleAdd() {
    setSelectedCustomer(undefined);
    setFormOpen(true);
  }

  function handleDelete(customer: Customer) {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  }

  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(customer.status);

    // Date range filter
    const customerDate = new Date(customer.created_at);
    const matchesDateRange =
      (!filters.dateRange.from || customerDate >= filters.dateRange.from) &&
      (!filters.dateRange.to || customerDate <= filters.dateRange.to);

    // Order count filter
    const matchesOrderCount =
      !filters.minOrders || (customer.order_count || 0) >= filters.minOrders;

    // Total spent filter
    const matchesSpent =
      !filters.minSpent || (customer.total_spent || 0) >= filters.minSpent;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateRange &&
      matchesOrderCount &&
      matchesSpent
    );
  });

  function handleFilterChange<K extends FilterKey>(
    key: K,
    value: FilterValue<K>
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  const statsCards = [
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      name: 'Active Customers',
      value: stats.activeCustomers.toString(),
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      name: 'Average Order Value',
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      change: '+23%',
      changeType: 'positive' as const
    },
    {
      name: 'Customer Retention',
      value: `${stats.customerRetention.toFixed(1)}%`,
      change: '-2%',
      changeType: 'negative' as const
    }
  ];

  return (
    <div className='mx-auto flex w-full max-w-[1600px] flex-col'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <Heading
            title='Customers'
            description='Manage and analyze your customer base'
          />
          <Button onClick={handleAdd}>
            <Icons.add className='mr-2 h-4 w-4' />
            Add Customer
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {statsCards.map((stat) => (
            <Card key={stat.name} className='p-4'>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>{stat.name}</p>
                <Badge
                  variant={
                    stat.changeType === 'positive' ? 'default' : 'destructive'
                  }
                  className='text-xs'
                >
                  {stat.change}
                </Badge>
              </div>
              <p className='mt-2 text-2xl font-bold'>{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className='mt-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4 border-b pb-4'>
              <Input
                placeholder='Search customers...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='max-w-sm'
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>
                    <Icons.filter className='mr-2 h-4 w-4' />
                    Filter
                    {Object.values(filters).some(
                      (value) =>
                        (Array.isArray(value) && value.length > 0) ||
                        (typeof value === 'object' &&
                          (value as { from?: Date; to?: Date }).from !==
                            undefined &&
                          (value as { from?: Date; to?: Date }).to !==
                            undefined) ||
                        (typeof value === 'number' && value > 0)
                    ) && (
                      <Badge
                        variant='secondary'
                        className='ml-2 rounded-sm px-1'
                      >
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[280px] p-4' align='end'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>Status</Label>
                      <div className='space-y-2'>
                        {['active', 'inactive'].map((status) => (
                          <div
                            key={status}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={status}
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                handleFilterChange(
                                  'status',
                                  checked
                                    ? [...filters.status, status]
                                    : filters.status.filter((s) => s !== status)
                                );
                              }}
                            />
                            <Label htmlFor={status} className='capitalize'>
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>Date Range</Label>
                      <div className='flex flex-col space-y-2'>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              className={cn(
                                'justify-start text-left font-normal',
                                !filters.dateRange.from &&
                                  'text-muted-foreground'
                              )}
                            >
                              {filters.dateRange.from ? (
                                format(filters.dateRange.from, 'PPP')
                              ) : (
                                <span>Pick a start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={filters.dateRange.from}
                              onSelect={(date) =>
                                handleFilterChange('dateRange', {
                                  ...filters.dateRange,
                                  from: date
                                })
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              className={cn(
                                'justify-start text-left font-normal',
                                !filters.dateRange.to && 'text-muted-foreground'
                              )}
                            >
                              {filters.dateRange.to ? (
                                format(filters.dateRange.to, 'PPP')
                              ) : (
                                <span>Pick an end date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={filters.dateRange.to}
                              onSelect={(date) =>
                                handleFilterChange('dateRange', {
                                  ...filters.dateRange,
                                  to: date
                                })
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>Minimum Orders</Label>
                      <Input
                        type='number'
                        value={filters.minOrders || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'minOrders',
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        placeholder='Enter minimum orders'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Minimum Total Spent</Label>
                      <Input
                        type='number'
                        value={filters.minSpent || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'minSpent',
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        placeholder='Enter minimum amount'
                      />
                    </div>

                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() =>
                        setFilters({
                          status: [],
                          dateRange: { from: undefined, to: undefined },
                          minOrders: undefined,
                          minSpent: undefined
                        })
                      }
                    >
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className='-mx-6 mt-4'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar>
                              <AvatarFallback>
                                {customer.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium'>{customer.name}</p>
                              <p className='text-muted-foreground text-sm'>
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.order_count || 0}</TableCell>
                        <TableCell>
                          ${customer.total_spent?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          {customer.last_order || 'No orders'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <Icons.ellipsis className='h-4 w-4' />
                                <span className='sr-only'>Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => handleEdit(customer)}
                              >
                                Edit customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive'
                                onClick={() => handleDelete(customer)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={selectedCustomer}
        onSuccess={() => {
          fetchCustomers();
          fetchStats();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                customerToDelete && handleDeleteCustomer(customerToDelete)
              }
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
