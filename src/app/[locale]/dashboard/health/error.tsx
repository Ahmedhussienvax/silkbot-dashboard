"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Activity } from "lucide-react";

export default function HealthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="System Health" moduleIcon={<Activity className="w-3.5 h-3.5 text-red-400" />} />;
}
