"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Activity } from "lucide-react";

export default function AuditError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Business Audit" moduleIcon={<Activity className="w-3.5 h-3.5 text-red-400" />} />;
}
