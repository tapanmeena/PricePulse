import type { Metadata } from "next";

import { PasswordResetRequestForm } from "@/components/PasswordResetRequestForm";

export const metadata: Metadata = {
  title: "Forgot password | PricePulse",
  description: "Request a one-time code to reset your PricePulse account password.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16">
      <PasswordResetRequestForm />
    </section>
  );
}
