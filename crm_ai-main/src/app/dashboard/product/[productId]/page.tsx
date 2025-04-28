'use client';

import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductForm from '@/features/products/components/product-form';
import { useEffect, useState } from 'react';

export default function ProductPage({
  params
}: {
  params: { productId: string };
}) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (params.productId === 'new') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.productId)
          .single();

        if (error) throw error;
        if (!data) notFound();

        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.productId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const pageTitle =
    params.productId === 'new' ? 'Create New Product' : 'Edit Product';

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
