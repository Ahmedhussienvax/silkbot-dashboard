"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Send } from "lucide-react";

export default function BroadcastError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Campaign Manager" moduleIcon={<Send className="w-3.5 h-3.5 text-red-400" />} />;
}
