'use client';

import { Product } from '@/lib/api';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CircleCheck, CircleX, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const priceHistory = product.priceHistory ?? [];
  const lowestPrice = priceHistory.length > 0 ? Math.min(...priceHistory.map((entry) => entry.price)) : product.currentPrice;
  const highestPrice = priceHistory.length > 0 ? Math.max(...priceHistory.map((entry) => entry.price)) : product.currentPrice;
  const isTargetMet = Boolean(product.targetPrice && product.currentPrice <= product.targetPrice);
  const priceChange = priceHistory.length > 1 ? product.currentPrice - priceHistory[0].price : 0;

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatPrice = (value: number) => numberFormatter.format(value);
  const availability = product.availability ?? '';
  const availabilityLower = availability.toLowerCase();
  const isExplicitlyOutOfStock = availabilityLower.includes('out of stock') || availabilityLower.includes('outofstock') || availabilityLower.includes('sold out');
  const hasPositiveSignal = availabilityLower.includes('in stock') || availabilityLower.includes('instock') || availabilityLower.includes('available');
  const isInStock = !isExplicitlyOutOfStock && hasPositiveSignal;

  const handleCardClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    void router.push(`/product/${product._id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const statusStyles = isInStock
    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200'
    : 'border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-200';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-busy={isNavigating}
      className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-gray-200/70 bg-white/95 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-slate-900"
    >
      {isNavigating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-slate-950/70">
          <Spinner className="size-6" />
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-3 sm:flex-row lg:w-56">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:w-44">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement;
                  target.src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{product.domain}</span>
              <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100 md:text-xl">{product.name}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}
              >
                {isInStock ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
                {availability || 'Status unknown'}
              </span>
              {product.lastChecked && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Checked {new Date(product.lastChecked).toLocaleString()}
                </span>
              )}
            </div>

            <Button variant="outline" size="sm" asChild onClick={(event) => event.stopPropagation()}>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold">
                Visit product
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current price</span>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {product.currency} {formatPrice(product.currentPrice)}
              </div>
            </div>

            {priceChange !== 0 && (
              <div
                className={`text-sm font-medium ${
                  priceChange > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {priceChange > 0 ? '↑' : '↓'} {product.currency} {formatPrice(Math.abs(priceChange))}
              </div>
            )}

            {product.targetPrice && (
              <div
                className={`text-sm ${
                  isTargetMet ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Target {product.currency} {formatPrice(product.targetPrice)}
                {isTargetMet && ' ✓'}
              </div>
            )}

            {priceHistory.length > 0 && (
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 px-3 py-2 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/20 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-300">
                      <TrendingDown className="size-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide">Lowest</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                    {product.currency} {formatPrice(lowestPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-500/5 px-3 py-2 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/20 dark:text-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-300">
                      <TrendingUp className="size-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide">Highest</span>
                  </div>
                  <span className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                    {product.currency} {formatPrice(highestPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-end">
            {priceHistory.length > 1 && (
              <div className="border-t border-dashed border-gray-200 pt-4 dark:border-gray-800">
                <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Price history ({priceHistory.length} records)
                </div>
                <div className="flex h-20 items-end gap-1">
                  {priceHistory.slice(-20).map((entry, index) => {
                    const range = Math.max(highestPrice - lowestPrice, 1);
                    const heightPercent = ((entry.price - lowestPrice) / range) * 100;
                    return (
                      <div
                        key={`${entry.date}-${index}`}
                        className="flex-1 rounded-t bg-blue-500 transition-colors hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                        style={{ height: `${Math.max(heightPercent, 6)}%` }}
                        title={`${product.currency} ${formatPrice(entry.price)} on ${new Date(entry.date).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
