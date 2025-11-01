"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authApi, ApiError, type AuthResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "login" | "register";
  title?: string;
  subtitle?: string;
  className?: string;
  redirectTo?: string;
}

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export function AuthForm({
  mode,
  title,
  subtitle,
  className,
  redirectTo,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const targetRedirect = redirectTo ?? searchParams.get("redirectTo") ?? "/dashboard";

  const oppositeMode = mode === "login" ? "register" : "login";
  const redirectSuffix = targetRedirect ? `?redirectTo=${encodeURIComponent(targetRedirect)}` : "";
  const oppositeHref = `/${oppositeMode}${redirectSuffix}`;
  const oppositeLabel = mode === "login" ? "Create an account" : "Already have an account?";

  function updateField(field: keyof FormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "register" && formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await authApi.login({
          email: formState.email,
          password: formState.password,
        });
        await afterAuth(result);
        return;
      }

      await authApi.register({
        email: formState.email,
        password: formState.password,
        nickname: formState.nickname || undefined,
      });
      const result = await authApi.login({
        email: formState.email,
        password: formState.password,
      });
      await afterAuth(result, "Account created successfully");
    } catch (cause) {
      const fallback = mode === "login" ? "Unable to sign in" : "Unable to create account";
      setError(cause instanceof ApiError ? cause.message : fallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function afterAuth(result: AuthResult, defaultMessage?: string) {
    if (!result.accessToken) {
      setError(defaultMessage ?? "Authentication failed");
      return;
    }
    setSuccess(defaultMessage ?? "Signed in successfully");
    router.push(targetRedirect);
    router.refresh();
  }

  return (
    <div className={cn("mx-auto w-full max-w-md space-y-8", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {title ?? (mode === "login" ? "Welcome back" : "Create your account")}
        </h1>
        <p className="text-muted-foreground">
          {subtitle ??
            (mode === "login"
              ? "Sign in to manage your price tracking dashboard."
              : "Join PricePulse to track and monitor your favorite products.")}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        {mode === "register" && (
          <div className="space-y-1">
            <Label htmlFor="nickname">Nickname (optional)</Label>
            <Input
              id="nickname"
              name="nickname"
              value={formState.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
              autoComplete="nickname"
            />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            value={formState.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        {mode === "login" && (
          <div className="text-right text-sm">
            <Link className="text-primary hover:underline" href={`/forgot-password${redirectSuffix}`}>
              Forgot password?
            </Link>
          </div>
        )}

        {mode === "register" && (
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formState.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
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
        {oppositeLabel}{" "}
        <Link className="font-medium text-primary hover:underline" href={oppositeHref}>
          {mode === "login" ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
