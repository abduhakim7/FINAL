'use client';

import { searchParamsCache } from '@/lib/searchparams';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function ProductListingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, category, page]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .order('category');

      if (error) throw error;

      // Get unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((item) => item.category).filter(Boolean))
      ) as string[];

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);

      // Build the query
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  // Subscribe to real-time changes
  useEffect(() => {
    const subscription = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleDelete(product: Product) {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product deleted successfully');
      setProductToDelete(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDelete(productToDelete)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='flex h-full min-h-0 flex-col'>
        <div className='bg-background sticky top-0 z-10 flex shrink-0 flex-col gap-4 border-b p-4 md:flex-row'>
          <Input
            placeholder='Search products...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='md:max-w-xs'
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className='md:max-w-xs'>
              <SelectValue placeholder='Select category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto p-4'>
          {loading ? (
            <div className='space-y-4'>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className='animate-pulse'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='bg-muted h-4 w-1/4 rounded' />
                      <div className='bg-muted h-4 w-1/6 rounded' />
                    </div>
                    <div className='bg-muted mt-2 h-4 w-1/3 rounded' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-muted-foreground'>No products found</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3'>
                          <h3 className='text-lg font-semibold'>
                            {product.name}
                          </h3>
                          <Badge
                            variant={
                              product.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {product.status}
                          </Badge>
                          {product.category && (
                            <Badge variant='outline'>{product.category}</Badge>
                          )}
                        </div>
                        {product.description && (
                          <p className='text-muted-foreground mt-1 line-clamp-1 text-sm'>
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className='ml-4 flex items-center gap-6'>
                        <div className='text-right'>
                          <p className='text-lg font-bold'>
                            ${product.price.toFixed(2)}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              router.push(`/dashboard/product/${product.id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => setProductToDelete(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {totalProducts > ITEMS_PER_PAGE && (
          <div className='bg-background sticky bottom-0 z-10 flex shrink-0 justify-center gap-2 border-t p-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className='flex items-center'>
              Page {page} of {Math.ceil(totalProducts / ITEMS_PER_PAGE)}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(totalProducts / ITEMS_PER_PAGE)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
