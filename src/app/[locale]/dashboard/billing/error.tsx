"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { CreditCard } from "lucide-react";

export default function BillingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Billing" moduleIcon={<CreditCard className="w-3.5 h-3.5 text-red-400" />} />;
}
