import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, ApiResponse } from "@/lib/api";
import { ArrowLeft, ArrowUpRight, CalendarDays, CircleCheck, CircleX, Store, TrendingDown, TrendingUp } from "lucide-react";

const adaptProduct = (p: any): Product => {
  const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
  const createdAt = (p?.createdAt ?? new Date().toISOString()) as string;
  const updatedAt = (p?.updatedAt ?? createdAt) as string;
  const lastChecked = (p?.lastCheckedAt ?? updatedAt ?? createdAt) as string;

  return {
    _id: (p?.id ?? p?._id) as string,
    name: (p?.name ?? "") as string,
    image: p?.image ?? undefined,
    url: (p?.url ?? "") as string,
    domain: (p?.domain ?? "") as string,
    currency: (p?.currency ?? "INR") as string,
    availability: (p?.availability ?? "Unknown") as string,
    currentPrice: toNum(p?.currentPrice),
    targetPrice: p?.targetPrice !== undefined ? toNum(p?.targetPrice) : undefined,
    priceHistory: Array.isArray(p?.priceHistory)
      ? p.priceHistory
          .map((h: any) => ({ price: toNum(h.price), date: (h.checkedAt ?? h.date) as string }))
          .filter((h: { price: number; date: string }) => !!h.date)
      : undefined,
    createdAt,
    updatedAt,
    lastChecked,
    sku: p?.sku ?? undefined,
    mpn: p?.mpn ?? undefined,
    brand: p?.brand ?? undefined,
    articleType: p?.articleType ?? undefined,
    subCategory: p?.subCategory ?? undefined,
    masterCategory: p?.masterCategory ?? undefined,
  };
};

const getProduct = cache(async (id: string): Promise<Product | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const response = await fetch(`${baseUrl}/products/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}`);
  }

  const result = (await response.json()) as ApiResponse<any>;
  return result.data ? adaptProduct(result.data) : null;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: "Product not found | PricePulse",
    };
  }

  return {
    title: `${product.name} | PricePulse`,
    description: `Track price history for ${product.name} from ${product.domain}.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Build a local, sorted copy of the product's price history and
  // ensure there is a checkpoint for today using the current price.
  const originalHistory = [...(product.priceHistory ?? [])];
  const sortedHistory = originalHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Normalize date to YYYY-MM-DD for comparison
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasToday = sortedHistory.some((entry) => (entry.date || "").slice(0, 10) === todayKey);

  const priceHistory = hasToday ? sortedHistory : [...sortedHistory, { price: product.currentPrice, date: new Date().toISOString() }];

  const lowestPrice = priceHistory.length > 0 ? Math.min(...priceHistory.map((entry) => entry.price)) : product.currentPrice;
  const highestPrice = priceHistory.length > 0 ? Math.max(...priceHistory.map((entry) => entry.price)) : product.currentPrice;
  const firstPrice = priceHistory.length > 0 ? priceHistory[0].price : product.currentPrice;
  const priceChange = product.currentPrice - firstPrice;

  const numberFormatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const availabilityLower = (product.availability ?? "").toLowerCase();
  const isExplicitlyOutOfStock =
    availabilityLower.includes("out of stock") || availabilityLower.includes("outofstock") || availabilityLower.includes("sold out");
  const hasPositiveSignal =
    availabilityLower.includes("in stock") || availabilityLower.includes("instock") || availabilityLower.includes("available");
  const isInStock = !isExplicitlyOutOfStock && hasPositiveSignal;
  const statusStyles = isInStock ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-rose-600 bg-rose-500/10 border-rose-500/20";

  return (
    <Section className="pb-24 pt-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="size-4" />
            Back to tracker
          </Link>
          <Button variant="outline" asChild>
            <a href={product.url} target="_blank" rel="noopener noreferrer">
              Visit on store
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 lg:w-[300px]">
              <div className="relative aspect-3/4 w-full">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 300px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">No image</div>
                )}
              </div>
            </div>

            <Card className="border-gray-200/80 bg-white/90 dark:border-gray-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Quick facts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400">
                    <Store className="size-4" /> Domain
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{product.domain}</span>
                </div>
                {product.lastChecked && (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400">
                      <CalendarDays className="size-4" /> Last checked
                    </span>
                    <span>{new Date(product.lastChecked).toLocaleString()}</span>
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}>
                  {isInStock ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
                  {product.availability || "Status unknown"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-8">
            <div className="rounded-3xl border border-gray-200/70 bg-white/95 p-6 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{product.domain}</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">{product.name}</h1>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current price</span>
                  <div className="text-4xl font-semibold text-gray-900 dark:text-gray-50">
                    {product.currency} {numberFormatter.format(product.currentPrice)}
                  </div>
                </div>

                {priceHistory.length > 1 && (
                  <div className="rounded-2xl border border-gray-200/80 bg-gray-100/80 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-200">
                    {priceChange >= 0 ? "+" : "-"}
                    {product.currency} {numberFormatter.format(Math.abs(priceChange))} since first tracked
                  </div>
                )}

                {product.targetPrice && (
                  <div className="rounded-2xl border border-blue-300/60 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-900/30 dark:text-blue-200">
                    Target {product.currency} {numberFormatter.format(product.targetPrice)}
                  </div>
                )}
              </div>
              <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 px-4 py-3 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/20 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-200">
                      <TrendingDown className="size-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide">Lowest price</span>
                      <span className="text-base font-semibold text-emerald-700 dark:text-emerald-200">
                        {product.currency} {numberFormatter.format(lowestPrice)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-500/5 px-4 py-3 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/20 dark:text-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-200">
                      <TrendingUp className="size-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide">Highest price</span>
                      <span className="text-base font-semibold text-rose-700 dark:text-rose-200">
                        {product.currency} {numberFormatter.format(highestPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-gray-200/70 bg-white/95 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">Price history</CardTitle>
              </CardHeader>
              <CardContent>
                {priceHistory.length > 0 ? (
                  <PriceHistoryChart data={priceHistory} currency={product.currency} />
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    Not enough price checkpoints yet. Track this product to build history.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}
