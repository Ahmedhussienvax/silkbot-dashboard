"use client";
import ModuleError from "@/components/molecules/ModuleError";
import { MessageSquare } from "lucide-react";

export default function MessagesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ModuleError error={error} reset={reset} moduleName="Inbox" moduleIcon={<MessageSquare className="w-3.5 h-3.5 text-red-400" />} />;
}
