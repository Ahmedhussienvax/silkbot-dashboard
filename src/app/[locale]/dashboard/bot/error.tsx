"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Brain } from "lucide-react";

export default function BotError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="AI Hub" moduleIcon={<Brain className="w-3.5 h-3.5 text-red-400" />} />;
}
