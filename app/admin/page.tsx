'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api';
import { productApi, schedulerApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useSession';

export default function AdminPage() {
  type SortField = 'name' | 'domain' | 'availability' | 'currency' | 'currentPrice' | 'targetPrice' | 'createdAt' | 'updatedAt' | 'lastChecked';
  type SortOrder = 'asc' | 'desc';
  type FilterState = {
    domain: string;
    availability: string;
    currency: string;
    articleType: string;
    masterCategory: string;
    subCategory: string;
    minPrice: string;
    maxPrice: string;
  };

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    domain: '',
    availability: '',
    currency: '',
    articleType: '',
    masterCategory: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
  });
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const session = useRequireAuth();

  useEffect(() => {
    if (session.status !== 'authenticated') return;
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
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [session.status]);

  const filterOptions = useMemo(() => {
    const domains = new Set<string>();
    const currencies = new Set<string>();
    const availabilities = new Set<string>();
    const articleTypes = new Set<string>();
    const masterCategories = new Set<string>();
    const subCategories = new Set<string>();

    products.forEach((product) => {
      if (product.domain) domains.add(product.domain);
      if (product.currency) currencies.add(product.currency);
      if (product.availability) availabilities.add(product.availability);
      if (product.articleType) articleTypes.add(product.articleType);
      if (product.masterCategory) masterCategories.add(product.masterCategory);
      if (product.subCategory) subCategories.add(product.subCategory);
    });

    const sortAsc = (arr: string[]) => [...arr].sort((a, b) => a.localeCompare(b));

    return {
      domains: sortAsc(Array.from(domains)),
      currencies: sortAsc(Array.from(currencies)),
      availabilities: sortAsc(Array.from(availabilities)),
      articleTypes: sortAsc(Array.from(articleTypes)),
      masterCategories: sortAsc(Array.from(masterCategories)),
      subCategories: sortAsc(Array.from(subCategories)),
    };
  }, [products]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((acc, [, value]) => (value ? acc + 1 : acc), 0);
  }, [filters]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !q ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.domain || '').toLowerCase().includes(q) ||
        (product.sku || '').toLowerCase().includes(q) ||
        (product.mpn || '').toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (filters.domain && product.domain !== filters.domain) return false;
      if (filters.currency && product.currency !== filters.currency) return false;
      if (filters.availability && product.availability !== filters.availability) return false;
      if (filters.articleType && product.articleType !== filters.articleType) return false;
      if (filters.masterCategory && product.masterCategory !== filters.masterCategory) return false;
      if (filters.subCategory && product.subCategory !== filters.subCategory) return false;

      const price = product.currentPrice ?? 0;
      if (filters.minPrice && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

      return true;
    });
  }, [products, query, filters]);

  const sortedProducts = useMemo(() => {
    const getComparableValue = (product: Product) => {
      switch (sortField) {
        case 'name':
          return (product.name || '').toLowerCase();
        case 'domain':
          return (product.domain || '').toLowerCase();
        case 'availability':
          return (product.availability || '').toLowerCase();
        case 'currency':
          return (product.currency || '').toLowerCase();
        case 'currentPrice':
          return product.currentPrice ?? Number.NaN;
        case 'targetPrice':
          return product.targetPrice ?? Number.NaN;
        case 'createdAt':
          return product.createdAt ? new Date(product.createdAt).getTime() : Number.NaN;
        case 'updatedAt':
          return product.updatedAt ? new Date(product.updatedAt).getTime() : Number.NaN;
        case 'lastChecked':
          return product.lastChecked ? new Date(product.lastChecked).getTime() : Number.NaN;
        default:
          return '';
      }
    };

    const hasValue = (value: unknown) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'number') return Number.isFinite(value);
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    };

    return [...filteredProducts].sort((a, b) => {
      const aValue = getComparableValue(a);
      const bValue = getComparableValue(b);

      const aHasValue = hasValue(aValue);
      const bHasValue = hasValue(bValue);

      if (!aHasValue && !bHasValue) return 0;
      if (!aHasValue) return sortOrder === 'asc' ? 1 : -1;
      if (!bHasValue) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (Number.isNaN(aNumber) && Number.isNaN(bNumber)) return 0;
      if (Number.isNaN(aNumber)) return sortOrder === 'asc' ? 1 : -1;
      if (Number.isNaN(bNumber)) return sortOrder === 'asc' ? -1 : 1;

      const comparison = aNumber - bNumber;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredProducts, sortField, sortOrder]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(sortedProducts.length / pageSize);
    return pages > 0 ? pages : 1;
  }, [sortedProducts.length, pageSize]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters, sortField, sortOrder, pageSize]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  const pageStart = sortedProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(sortedProducts.length, currentPage * pageSize);

  const handleResetFilters = () => {
    setFilters({
      domain: '',
      availability: '',
      currency: '',
      articleType: '',
      masterCategory: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  if (session.status !== 'authenticated') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

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
          <div className="col-span-2 space-y-3 rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex grow items-center gap-2 rounded-md bg-muted/30 px-3 py-2">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, domains or identifiers..."
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Sort by</span>
                <select
                  value={sortField}
                  onChange={(event) => setSortField(event.target.value as SortField)}
                  className="rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Created</option>
                  <option value="lastChecked">Last Checked</option>
                  <option value="name">Name</option>
                  <option value="domain">Domain</option>
                  <option value="availability">Availability</option>
                  <option value="currency">Currency</option>
                  <option value="currentPrice">Current Price</option>
                  <option value="targetPrice">Target Price</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="rounded-md border border-border/60 bg-muted/10 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Domain</Label>
                    <select
                      value={filters.domain}
                      onChange={(event) => setFilters((prev) => ({ ...prev, domain: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.domains.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Availability</Label>
                    <select
                      value={filters.availability}
                      onChange={(event) => setFilters((prev) => ({ ...prev, availability: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.availabilities.map((availability) => (
                        <option key={availability} value={availability}>
                          {availability}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Currency</Label>
                    <select
                      value={filters.currency}
                      onChange={(event) => setFilters((prev) => ({ ...prev, currency: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Article Type</Label>
                    <select
                      value={filters.articleType}
                      onChange={(event) => setFilters((prev) => ({ ...prev, articleType: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.articleTypes.map((articleType) => (
                        <option key={articleType} value={articleType}>
                          {articleType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Master Category</Label>
                    <select
                      value={filters.masterCategory}
                      onChange={(event) => setFilters((prev) => ({ ...prev, masterCategory: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.masterCategories.map((masterCategory) => (
                        <option key={masterCategory} value={masterCategory}>
                          {masterCategory}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Sub Category</Label>
                    <select
                      value={filters.subCategory}
                      onChange={(event) => setFilters((prev) => ({ ...prev, subCategory: event.target.value }))}
                      className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="">All</option>
                      {filterOptions.subCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <Label className="text-xs uppercase text-muted-foreground">Price Range</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            )}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Tracked products</h2>
            <div className="text-sm text-muted-foreground">
              {sortedProducts.length === 0
                ? 'No products match the current filters'
                : `Showing ${pageStart}-${pageEnd} of ${sortedProducts.length} (Total ${products.length})`}
            </div>
          </div>

          <Separator className="my-4" />

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {refreshSuccess && !error && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {refreshSuccess}
            </div>
          )}

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner className="size-6" />
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div>No products found.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

          {sortedProducts.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-md border border-border/60 bg-background px-2 py-1 text-sm focus:outline-none"
                >
                  {[8, 12, 16, 24, 32].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
