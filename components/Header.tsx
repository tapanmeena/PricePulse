import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, ArrowUpRight, Sparkles, GaugeCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.22),transparent_60%)]" />

      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-[0.18em]">Beta 1.3</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-foreground/70">New:</span>
            <span>Automated scheduler insights &amp; richer price history charts</span>
            <Link href="#changelog" className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
              Read changelog
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link href="mailto:tapanmeena1998@gmail.com" className="hidden text-primary transition-colors hover:text-primary/80 sm:inline">
            Need help?
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 text-foreground">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Image src="/logo.png" alt="PricePulse" width={24} height={24} className="h-6 w-6 object-contain" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">PricePulse</span>
            <span className="text-xs text-muted-foreground">Signal-driven price intelligence</span>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Button size="sm" className="hidden items-center gap-1.5 shadow-sm lg:inline-flex" asChild>
            <Link href="/admin">
              Admin
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
