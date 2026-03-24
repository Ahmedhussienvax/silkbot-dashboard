"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { BookOpen } from "lucide-react";

export default function KnowledgeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Knowledge Base" moduleIcon={<BookOpen className="w-3.5 h-3.5 text-red-400" />} />;
}
