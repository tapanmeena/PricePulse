import type { Metadata } from "next";

import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in | PricePulse",
  description: "Access your PricePulse dashboard to monitor tracked products and alerts.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16">
      <AuthForm mode="login" />
    </section>
  );
}
