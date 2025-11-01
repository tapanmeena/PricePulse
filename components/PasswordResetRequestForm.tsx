"use client";

import { useState } from "react";

import { authApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PasswordResetRequestForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await authApi.requestPasswordReset({ email });
      setSuccess("If that email exists, we have sent a reset code.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to request reset. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-md space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter the email linked to your account. We&apos;ll send you a one-time code to reset your password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset code"}
        </Button>
      </form>

      {(error || success) && (
        <div
          role="status"
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/40 bg-primary/10 text-primary"
          )}
        >
          {error ?? success}
        </div>
      )}
    </div>
  );
}
