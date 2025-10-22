import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Support", href: "#support" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">PricePulse</p>
          <p className="text-sm text-muted-foreground">
            Monitor prices, spot trends, and stay ahead of every drop.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {footerLinks.map((link, index) => (
            <div key={link.label} className="flex items-center gap-4">
              <a href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </a>
              {index !== footerLinks.length - 1 && <Separator orientation="vertical" className="h-4" />}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PricePulse. Built for smart shoppers.
        </p>
      </div>
    </footer>
  );
}
