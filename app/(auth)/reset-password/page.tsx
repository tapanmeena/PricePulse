import type { Metadata } from "next";

import { PasswordResetForm } from "@/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Reset password | PricePulse",
  description: "Enter your reset code and choose a new password for your PricePulse account.",
};

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16">
      <PasswordResetForm />
    </section>
  );
}
