"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { Columns } from "lucide-react";

export default function KanbanError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Pipeline" moduleIcon={<Columns className="w-3.5 h-3.5 text-red-400" />} />;
}
