import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BarChart3, ShieldCheck, Sparkles, Twitter, Linkedin, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

const highlights = [
  {
    icon: Sparkles,
    title: "Signal-driven",
    description: "AI-curated alerts when your watchlist spikes or drops.",
  },
  {
    icon: BarChart3,
    title: "Analytics ready",
    description: "Timeline exports and investor-friendly dashboards in a click.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "SOC2-minded policies with granular team permissions.",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border/70 bg-linear-to-b from-muted/40 via-background to-background/95">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]" />
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:py-18">
        <div className="flex flex-col gap-10">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
              <Image src="/logo.png" alt="PricePulse logo" width={40} height={40} className="h-10 w-10 object-contain" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold leading-tight text-foreground">PricePulse</p>
              <p className="text-sm text-muted-foreground">
                A price intelligence co-pilot for lean product teams, over-caffeinated founders, and procurement pros.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group h-full rounded-2xl border border-border/60 bg-card/70 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-2 text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Stay ahead of volatile pricing</p>
                <p className="text-xs text-muted-foreground">Join the weekly brief — curated insights, tactical ideas, and zero fluff.</p>
              </div>
              <form className="mt-2 flex w-full flex-col gap-2 lg:mt-0 lg:w-auto lg:flex-row">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <Input id="footer-email" type="email" placeholder="you@company.com" className="h-10 w-full lg:w-64" required />
                <Button type="submit" className="h-10 gap-1 whitespace-nowrap">
                  Subscribe
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Separator className="my-10 border-border/60" />

        <div className="flex flex-col gap-4 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl">© {year} PricePulse. Crafted for pragmatic builders. Privacy-first, insight-forward.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="#privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <span className="text-border">•</span>
            <Link href="#terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <span className="text-border">•</span>
            <Link href="#changelog" className="transition-colors hover:text-foreground">
              Changelog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
