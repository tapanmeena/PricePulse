import { Spinner } from "@/components/ui/spinner";

export default function ProductLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background via-background to-muted/40">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner className="size-8" />
        <span>Fetching product insights…</span>
      </div>
    </div>
  );
}
