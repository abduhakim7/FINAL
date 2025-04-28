import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for data fetching
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecentSales() {
  const { data, error } = await supabase
    .from('sales')
    .select(
      `
      id,
      total_amount,
      quantity,
      created_at,
      status,
      customers (
        name,
        email
      ),
      products (
        name,
        category
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previousThirtyDays = new Date(
    thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const [previousSales, currentSales, currentCustomers] = await Promise.all([
    getSalesByDate(
      previousThirtyDays.toISOString(),
      thirtyDaysAgo.toISOString()
    ),
    getSalesByDate(thirtyDaysAgo.toISOString(), now.toISOString()),
    getCustomers()
  ]);

  // Initialize metrics
  const metrics = {
    totalRevenue: 0,
    totalCustomers: (currentCustomers || []).length,
    activeCustomers: (currentCustomers || []).filter(
      (c) => c.status === 'active'
    ).length,
    previousRevenue: 0
  };

  // Calculate current period revenue
  metrics.totalRevenue = Object.values(currentSales || {}).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Calculate previous period revenue
  metrics.previousRevenue = Object.values(previousSales || {}).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return metrics;
}

export async function getSalesByDate(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('sales')
    .select(
      `
      created_at,
      total_amount,
      products (
        name,
        category
      )
    `
    )
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) throw error;

  interface Sale {
    created_at: string;
    total_amount: number;
    products: {
      name: string;
      category: string;
    }[];
  }

  // Group sales by date
  const salesByDate = ((data as Sale[]) || []).reduce(
    (acc: Record<string, number>, sale) => {
      // Format date to YYYY-MM-DD
      const date = new Date(sale.created_at).toISOString().split('T')[0];

      // Add the total amount for this date
      acc[date] = (acc[date] || 0) + (sale.total_amount || 0);

      return acc;
    },
    {}
  );

  return salesByDate;
}

export async function getSalesByCategory(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('sales')
    .select(
      `
      total_amount,
      products (
        category
      )
    `
    )
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  // Group sales by category
  const salesByCategory = (data || []).reduce(
    (acc: Record<string, number>, sale: any) => {
      const category = sale.products?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(sale.total_amount);
      return acc;
    },
    {
      Electronics: 0,
      Fashion: 0,
      'Home & Living': 0,
      Sports: 0
    }
  );

  return salesByCategory;
}

export async function getCategoryDistribution() {
  const { data, error } = await supabase.from('sales').select(`
      total_amount,
      products:products (
        name,
        category
      )
    `);

  if (error) throw error;

  type SaleWithProduct = {
    total_amount: number;
    products?: {
      category?: string;
    };
  };

  // Calculate distribution by category
  const distribution = ((data as SaleWithProduct[]) || []).reduce(
    (acc: Record<string, number>, sale) => {
      const category = sale.products?.category?.toLowerCase() || 'software';
      acc[category] = (acc[category] || 0) + (sale.total_amount || 0);
      return acc;
    },
    {}
  );

  const total = Object.values(distribution).reduce(
    (sum, value) => sum + value,
    0
  );

  // Convert to percentages
  Object.keys(distribution).forEach((category) => {
    distribution[category] = (distribution[category] / total) * 100;
  });

  return distribution;
}

export async function getAISalesAnalytics() {
  const now = new Date();
  const sevenMonthsAgo = new Date(now.getTime() - 7 * 30 * 24 * 60 * 60 * 1000);

  try {
    // Get monthly sales data
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('sales')
      .select(
        `
        created_at,
        total_amount
      `
      )
      .gte('created_at', sevenMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (monthlyError) throw monthlyError;

    // Get category performance data
    const { data: categoryData, error: categoryError } = await supabase
      .from('sales')
      .select(
        `
        total_amount,
        products (
          category
        )
      `
      )
      .gte('created_at', sevenMonthsAgo.toISOString());

    if (categoryError) throw categoryError;

    // Process monthly data
    const monthlySales = (monthlyData || []).reduce(
      (acc: Record<string, number>, sale: any) => {
        const month = new Date(sale.created_at).toLocaleString('default', {
          month: 'short'
        });
        acc[month] = (acc[month] || 0) + sale.total_amount;
        return acc;
      },
      {}
    );

    // Process category data
    const categorySales = (categoryData || []).reduce(
      (
        acc: Record<string, { current: number; previous: number }>,
        sale: any
      ) => {
        const category = sale.products?.category || 'Uncategorized';

        if (!acc[category]) {
          acc[category] = { current: 0, previous: 0 };
        }

        // For simplicity, we'll consider sales from the last 3 months as current
        const saleDate = new Date(sale.created_at);
        const threeMonthsAgo = new Date(
          now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000
        );

        if (saleDate >= threeMonthsAgo) {
          acc[category].current += sale.total_amount;
        } else {
          acc[category].previous += sale.total_amount;
        }

        return acc;
      },
      {}
    );

    // Format monthly data for charts
    const monthlyChartData = Object.entries(monthlySales).map(
      ([name, sales]) => ({
        name,
        sales,
        // Add a simple prediction (10% increase)
        prediction: Math.round(sales * 1.1)
      })
    );

    // Format category data for charts
    const categoryChartData = Object.entries(categorySales).map(
      ([name, data]) => ({
        name,
        current: data.current,
        previous: data.previous
      })
    );

    return {
      monthlyData: monthlyChartData,
      categoryData: categoryChartData
    };
  } catch (error) {
    console.error('Error fetching AI sales analytics:', error);
    throw error;
  }
}
