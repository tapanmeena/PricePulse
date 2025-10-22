'use client';

import { useMemo, useState } from "react";
import { productApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AddProductFormProps {
  onProductAdded: () => void;
}

const MAX_URLS = 10;

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const urlList = useMemo(
    () =>
      urls
        .split(/\n|,/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
    [urls]
  );

  const hasTooManyUrls = urlList.length > MAX_URLS;
  const isSubmitDisabled = loading || urlList.length === 0 || hasTooManyUrls;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (urlList.length === 0) {
        throw new Error("Please enter at least one product URL");
      }

      if (hasTooManyUrls) {
        throw new Error(`You can add a maximum of ${MAX_URLS} URLs at once`);
      }

      await productApi.createProductByUrl(urlList);
      setSuccess(`Successfully queued ${urlList.length} product(s) for tracking.`);
      setUrls("");
      onProductAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add products");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div id="demo" className="rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/5">
      <div className="space-y-2 border-b border-border/40 bg-muted/40 px-6 py-5">
        <h2 className="text-lg font-semibold">Track new products</h2>
        <p className="text-sm text-muted-foreground">
          Paste up to {MAX_URLS} product URLs and we’ll fetch the metadata, pricing, and history for you automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-urls" className="text-sm font-medium">
              Product URLs
            </Label>
            <span
              className={cn(
                "rounded-full bg-muted px-3 py-1 text-xs font-medium",
                hasTooManyUrls && "bg-destructive/10 text-destructive"
              )}
            >
              {urlList.length} / {MAX_URLS}
            </span>
          </div>

          <Textarea
            id="product-urls"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            placeholder={"https://www.myntra.com/product/xyz\nhttps://www.myntra.com/product/abc"}
            rows={6}
            className="resize-none bg-background/60 text-sm"
          />

          <p className="text-xs text-muted-foreground">
            Tip: Enter one URL per line or separate them with commas. Duplicate URLs are filtered out automatically.
          </p>
        </div>

        {urlList.length > 0 && (
          <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Preview ({urlList.length})</p>
            <Separator className="my-2" />
            <div className="flex flex-wrap gap-2">
              {urlList.slice(0, 6).map((url) => (
                <span
                  key={url}
                  className="truncate rounded-full bg-background px-3 py-1 text-[11px] font-medium text-foreground shadow-sm"
                >
                  {url.length > 54 ? `${url.slice(0, 54)}…` : url}
                </span>
              ))}
              {urlList.length > 6 && (
                <span className="rounded-full bg-background px-3 py-1 text-[11px] font-medium text-foreground/70">
                  +{urlList.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            We crawl URLs instantly and refresh the price every few hours.
          </p>
          <Button type="submit" disabled={isSubmitDisabled} className="min-w-[160px]">
            {loading ? "Processing…" : "Start tracking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
