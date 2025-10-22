'use client';

import { useState } from 'react';
import { schedulerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRefreshPrices = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await schedulerApi.checkNow();
      setSuccess('Price refresh triggered successfully! All tracked products will be updated shortly.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger price refresh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/40 pb-20">
      <div className="pointer-events-none absolute inset-x-0 -top-64 -z-10 h-[420px] bg-linear-to-br from-primary/30 via-purple-500/10 to-transparent blur-3xl" />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-16">
        <section className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Admin Panel
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            System Administration
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage system operations and trigger maintenance tasks.
          </p>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-black/5">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Price Refresher</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manually trigger a price check for all tracked products. This will update the current prices and price history for every product in the system.
              </p>
            </div>

            <Separator />

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <AlertCircle className="size-5 shrink-0 text-destructive" />
                <div className="flex-1 text-sm text-destructive">
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1 text-sm text-emerald-600 dark:text-emerald-400">
                  {success}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-muted/30 p-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Manual Price Check</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to immediately check all product prices. This process runs asynchronously and may take a few minutes depending on the number of tracked products.
                </p>
              </div>

              <Button
                onClick={handleRefreshPrices}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Refreshing Prices...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    <span>Refresh All Prices</span>
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
              <h3 className="text-sm font-semibold mb-3">About Price Refresher</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Updates current prices for all tracked products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Adds new entries to price history for trend analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Checks product availability and stock status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Runs asynchronously in the background</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm shadow-black/5">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">System Information</h2>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold">System Online</span>
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Authentication</div>
                <div className="mt-2 text-sm font-semibold">No restrictions (Dev mode)</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
