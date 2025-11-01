"use client";

import { useState } from "react";
import Link from "next/link";

import { authApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordResetFormProps {
  className?: string;
}

export function PasswordResetForm({ className }: PasswordResetFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ email, code, newPassword: password });
      setSuccess("Password updated. You can now sign in with your new password.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to reset password. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-md space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Enter your reset code</h1>
        <p className="text-muted-foreground">
          Check your inbox for the six-digit code we sent. Enter it along with your new password.
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
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reset-code">Reset code</Label>
          <Input
            id="reset-code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-new-password">Confirm password</Label>
          <Input
            id="confirm-new-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Reset password"}
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

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code? <Link href="/forgot-password" className="font-medium text-primary hover:underline">Resend it</Link>
      </p>
    </div>
  );
}
