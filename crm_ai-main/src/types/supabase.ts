export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          company: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          photo_url: string | null;
          price: number;
          stock_quantity: number | null;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          photo_url?: string | null;
          price: number;
          stock_quantity?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          photo_url?: string | null;
          price?: number;
          stock_quantity?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          created_at: string | null;
          customer_id: string | null;
          id: string;
          product_id: string | null;
          quantity: number;
          status: string | null;
          total_amount: number;
        };
        Insert: {
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          product_id?: string | null;
          quantity: number;
          status?: string | null;
          total_amount: number;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string | null;
          id?: string;
          product_id?: string | null;
          quantity?: number;
          status?: string | null;
          total_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'sales_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sales_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      tasks: {
        Row: {
          assigned_to: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          priority: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
