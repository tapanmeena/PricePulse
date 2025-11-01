import type { Metadata } from "next";

import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account | PricePulse",
  description: "Sign up for PricePulse to start tracking product prices and alerts.",
};

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16">
      <AuthForm mode="register" />
    </section>
  );
}
