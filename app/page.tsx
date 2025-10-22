'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import AddProductForm from "@/components/AddProductForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Product, productApi } from "@/lib/api";

type StockFilter = "all" | "in-stock" | "out-of-stock";

const FILTERS: { label: string; value: StockFilter }[] = [
  { label: "All", value: "all" },
  { label: "In stock", value: "in-stock" },
  { label: "Out of stock", value: "out-of-stock" },
];

const FAQS = [
  {
    question: "How frequently do you refresh product prices?",
    answer: "We run automated checks every few hours and resync instantly whenever you add a new URL.",
  },
  {
    question: "Can I paste URLs from other stores?",
    answer: "Yes. While we optimise for Myntra, the tracker works with most major marketplaces too.",
  },
  {
    question: "What happens after I submit URLs?",
    answer: "We queue them for processing, extract metadata, and start building the price history timeline for each product.",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StockFilter>("all");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void fetchProducts();
  }, []);

  useEffect(() => {
    const handleCommandK = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isMac = /mac/i.test(navigator.platform);
      if ((event.metaKey && isMac) || (event.ctrlKey && !isMac)) {
        if (key === "k") {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleCommandK);
    return () => window.removeEventListener("keydown", handleCommandK);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.domain.toLowerCase().includes(searchTerm.toLowerCase());

      const availability = product.availability.toLowerCase();
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "in-stock" && availability.includes("stock")) ||
        (filterStatus === "out-of-stock" && !availability.includes("stock"));

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterStatus]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/40 pb-20">
      <div className="pointer-events-none absolute inset-x-0 -top-64 -z-10 h-[420px] bg-linear-to-br from-primary/30 via-purple-500/10 to-transparent blur-3xl" />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16">
        <section className="max-w-3xl space-y-6" id="features">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Intelligent price tracking
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Capture every price drop before it disappears.
          </h1>
          <p className="text-lg text-muted-foreground">
            Paste product links, monitor price swings, and understand historical trends in a single, elegant dashboard.
          </p>
        </section>

        <AddProductForm onProductAdded={fetchProducts} />

        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-black/5" id="how-it-works">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Tracked products</h2>
              <p className="text-sm text-muted-foreground">
                Filter by status or search by product name and domain. New entries appear instantly after processing.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name or store domain"
                  className="pl-3 pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground/70">
                  ⌘K
                </span>
              </div>
              <div className="flex items-center gap-2">
                {FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    variant={filterStatus === filter.value ? "default" : "secondary"}
                    size="sm"
                    className="px-4"
                    onClick={() => setFilterStatus(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={fetchProducts} title="Refresh products">
                ↻
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {loading ? (
            <div className="space-y-4" aria-live="polite">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                <span>Loading products…</span>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl border border-border/50 bg-muted/40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "No products match your current filters."
                  : "Paste a product URL above to start tracking price history."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section
          id="faqs"
          className="rounded-2xl border border-border/60 bg-card/60 px-6 py-10 shadow-sm shadow-black/5"
        >
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to know about how the tracker captures, cleans, and displays price history.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border/40 bg-muted/30 p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
