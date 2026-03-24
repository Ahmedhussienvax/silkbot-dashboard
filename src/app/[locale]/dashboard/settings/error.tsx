"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Settings } from "lucide-react";

export default function SettingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Settings" moduleIcon={<Settings className="w-3.5 h-3.5 text-red-400" />} />;
}
