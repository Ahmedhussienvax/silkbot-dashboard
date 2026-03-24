"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Smartphone } from "lucide-react";

export default function WhatsAppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="WhatsApp" moduleIcon={<Smartphone className="w-3.5 h-3.5 text-red-400" />} />;
}
