'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCw, Search, Filter, Plus } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api';
import { productApi, schedulerApi } from '@/lib/api';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productApi
      .getAllProducts()
      .then((res) => {
        if (!mounted) return;
        setProducts(res || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load products');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.domain || '').toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="min-h-screen bg-surface/50 pb-20">
      <main className="mx-auto w-full max-w-7xl px-6 pt-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage tracked products, run system tasks and monitor health.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden items-center gap-2 sm:flex"
              onClick={async () => {
                setRefreshing(true);
                setRefreshSuccess(null);
                setError(null);
                try {
                  await schedulerApi.checkNow();
                  setRefreshSuccess('Manual price check started. Products will update shortly.');
                  setTimeout(() => setRefreshSuccess(null), 6000);
                } catch (err) {
                  console.error(err);
                  setError(err instanceof Error ? err.message : 'Failed to trigger refresh');
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {refreshing ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
              Refresh System
            </Button>

            <Button size="sm" className="items-center gap-2">
              <Plus className="size-4" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="col-span-2 flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products or domains..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">System status</div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Online</div>
                <div className="text-xs text-muted-foreground">All services operational</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{products.length}</div>
                <div className="text-xs text-muted-foreground">Tracked items</div>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tracked products</h2>
            <div className="text-sm text-muted-foreground">Showing {filtered.length} of {products.length}</div>
          </div>

          <Separator className="my-4" />

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner className="size-6" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div>No products found.</div>
                {refreshSuccess && <div className="mt-2 text-sm text-emerald-600">{refreshSuccess}</div>}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
