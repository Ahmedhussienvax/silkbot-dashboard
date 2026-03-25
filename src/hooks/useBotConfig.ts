/**
 * useBotConfig Hook
 * Manages bot_configs CRUD with RLS.
 * Includes the provider → model mapping for dynamic model selectors.
 *
 * Worker caches bot_config in Redis for 5 minutes.
 * After dashboard update, the change may take up to 5 minutes to apply.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

export interface BotConfig {
  id: string;
  tenant_id: string;
  bot_name: string;
  is_enabled: boolean;
  ai_provider: string;
  ai_model: string;
  system_prompt: string;
  fallback_message: string;
  handoff_keywords: string[];
  max_tokens: number;
  temperature: number;
  use_knowledge_base?: boolean;
}

/**
 * Deterministic provider → model mapping.
 * Source of truth for the AI provider selector UI.
 */
export const PROVIDER_MODELS: Record<
  string,
  { label: string; value: string }[]
> = {
  openai: [
    { label: "GPT-4o Mini (Fast)", value: "gpt-4o-mini" },
    { label: "GPT-4o (Elite)", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  ],
  groq: [
    { label: "Llama 3.1 70B", value: "llama-3.1-70b-versatile" },
    { label: "Mixtral 8x7B", value: "mixtral-8x7b-32768" },
  ],
  openrouter: [
    { label: "Claude 3.5 Sonnet", value: "anthropic/claude-3.5-sonnet" },
    { label: "Gemini 2.0 Flash", value: "google/gemini-2.0-flash" },
  ],
  google: [
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
  ],
};

export const PROVIDER_OPTIONS = [
  { label: "OpenAI", value: "openai", color: "text-emerald-500" },
  { label: "Groq", value: "groq", color: "text-orange-500" },
  { label: "OpenRouter", value: "openrouter", color: "text-blue-500" },
  { label: "Google", value: "google", color: "text-cyan-500" },
];

interface UseBotConfigReturn {
  config: BotConfig | null;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig | null>>;
  loading: boolean;
  error: string | null;
  saveConfig: () => Promise<boolean>;
  saving: boolean;
  reload: () => Promise<void>;
  /** The tenant name associated with this bot config (for trace filtering) */
  tenantName: string | null;
}

export function useBotConfig(): UseBotConfigReturn {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("bot_configs")
        .select("*, tenants(name)")
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setConfig(data as unknown as BotConfig);
        setTenantName((data as { tenants?: { name: string } }).tenants?.name || null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bot configuration";
      setError(msg);
      console.error("[useBotConfig] Load error:", msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * Persists current bot config state to Supabase.
   * Shows a warning toast about the 5-min Redis cache TTL.
   */
  const saveConfig = useCallback(async (): Promise<boolean> => {
    if (!config?.id) return false;
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("bot_configs")
        .update({
          bot_name: config.bot_name,
          is_enabled: config.is_enabled,
          ai_provider: config.ai_provider,
          ai_model: config.ai_model,
          system_prompt: config.system_prompt,
          fallback_message: config.fallback_message,
          handoff_keywords: config.handoff_keywords,
          max_tokens: config.max_tokens,
          temperature: config.temperature,
          use_knowledge_base: config.use_knowledge_base,
        })
        .eq("id", config.id);

      if (updateError) throw updateError;

      toast.info("Changes may take up to 5 minutes to apply", {
        description: "Worker caches bot configuration in Redis with a 5-minute TTL.",
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save bot configuration";
      toast.error(msg);
      console.error("[useBotConfig] Save error:", msg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [config, supabase]);

  return {
    config,
    setConfig,
    loading,
    error,
    saveConfig,
    saving,
    reload: loadConfig,
    tenantName,
  };
}
