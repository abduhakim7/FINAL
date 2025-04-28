import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// Supabase Database Types
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  photo_url: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  // Include related data
  customer?: Customer;
  product?: Product;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // Include related data
  assignee?: Customer;
};

// Dashboard specific types
export type DashboardStats = {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
};

export type RecentSale = {
  id: string;
  customer: {
    name: string;
    email: string;
    image?: string;
    initials: string;
  };
  amount: string;
  created_at: string;
};
