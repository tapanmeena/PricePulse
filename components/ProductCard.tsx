"use client";

import { Product } from "@/lib/api";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CircleCheck, CircleX, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatPrice = (value: number) => numberFormatter.format(value);
  const availability = product.availability ?? "";
  const availabilityLower = availability.toLowerCase();
  const isExplicitlyOutOfStock =
    availabilityLower.includes("out of stock") || availabilityLower.includes("outofstock") || availabilityLower.includes("sold out");
  const hasPositiveSignal =
    availabilityLower.includes("in stock") || availabilityLower.includes("instock") || availabilityLower.includes("available");
  const isInStock = !isExplicitlyOutOfStock && hasPositiveSignal;

  const lastCheckedLabel = useMemo(() => {
    if (!product.lastChecked) return null;
    try {
      return new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(product.lastChecked));
    } catch {
      return null;
    }
  }, [product.lastChecked]);

  const handleCardClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    void router.push(`/product/${product._id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const statusStyles = isInStock
    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200"
    : "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-200";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-busy={isNavigating}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white/95 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-slate-900"
    >
      {isNavigating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-950/70">
          <Spinner className="size-6" />
        </div>
      )}

      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-100 transition-all group-hover:brightness-[0.95] dark:bg-gray-800">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(event) => {
              const target = event.target as HTMLImageElement;
              target.src = "/placeholder-product.png";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{product.domain}</span>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">{product.name}</h3>
          </div>
          {product.url && (
            <Button variant="secondary" size="icon" asChild onClick={(event) => event.stopPropagation()}>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="size-4" />
                <span className="sr-only">Visit product</span>
              </a>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${statusStyles}`}>
            {isInStock ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
            {availability || "Status unknown"}
          </span>
          {lastCheckedLabel && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              Checked {lastCheckedLabel}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-gray-200/70 bg-white/70 p-3 text-xs font-medium dark:border-gray-800/70 dark:bg-slate-900/80">
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current price</span>
            <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {product.currency} {formatPrice(product.currentPrice)}
            </div>
            {priceChange !== 0 && (
              <span
                className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
                  priceChange > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {priceChange > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {priceChange > 0 ? "+" : "-"} {product.currency} {formatPrice(Math.abs(priceChange))}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-200">
            <span className="inline-flex items-center gap-1 uppercase tracking-wide">
              <TrendingDown className="size-3" /> Lowest
            </span>
            <span className="text-sm font-semibold">
              {product.currency} {formatPrice(lowestPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-200">
            <span className="inline-flex items-center gap-1 uppercase tracking-wide">
              <TrendingUp className="size-3" /> Highest
            </span>
            <span className="text-sm font-semibold">
              {product.currency} {formatPrice(highestPrice)}
            </span>
          </div>
        </div>

        {product.targetPrice && (
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              isTargetMet
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-900/20 dark:text-emerald-200"
                : "border-gray-200/70 bg-white/70 text-gray-600 dark:border-gray-800/70 dark:bg-slate-900/80 dark:text-gray-300"
            }`}
          >
            {isTargetMet ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
            <span>
              Target {product.currency} {formatPrice(product.targetPrice)}
            </span>
          </div>
        )}

        {priceHistory.length > 1 && (
          <div className="mt-auto">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Price history (last {Math.min(priceHistory.length, 12)} records)
            </div>
            <div className="mt-2 flex h-16 items-end gap-[3px]">
              {priceHistory.slice(-12).map((entry, index) => {
                const range = Math.max(highestPrice - lowestPrice, 1);
                const heightPercent = ((entry.price - lowestPrice) / range) * 100;
                return (
                  <div
                    key={`${entry.date}-${index}`}
                    className="flex-1 rounded-t bg-blue-500/80 transition-colors duration-150 group-hover:bg-blue-500 dark:bg-blue-400/80 dark:group-hover:bg-blue-400"
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
  );
}
