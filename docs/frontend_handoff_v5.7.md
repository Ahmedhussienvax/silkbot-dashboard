# 🚀 SilkBot Frontend Handoff Specification (v5.7.0)
**Subject:** Backend Hardening & Neural Integration (Neural Hub Sync)
**Status:** PROD-READY

## 1. 📂 Infrastructure & Data Source
The Backend has been consolidated. All data is now served through **Supabase RLS-Secured Views**.
- **Source of Truth:** `database/master_schema_v5.7.0.sql`
- **Key Views:** `silkbot.inbox_secured`, `silkbot.contacts_secured`, `silkbot.conversations_secured`.

## 2. 🧠 Neural Hub UI Enhancements
### A. AI Reasoning Traces (Observability)
- **New Field:** `trace_id` (TEXT) in `ai_traces` table.
- **Frontend Action:** Group all reasoning steps (analysis, retrieval, reasoning) by `trace_id` for accurate "Thought Progression" rendering.
- **Trace Severity:** `severity` column now includes `warning` or `error` if the AI encounters a logic failure. Highlight these in the UI.

### B. Conversation Memory (Summarization)
- **Mechanism:** The worker now auto-summarizes conversations in Redis/Supabase.
- **Frontend Action:** If the message history looks truncated, the "Context Summary" is already infused into the AI's persona. UI doesn't need to change but should know that history is now "Semantic".

## 3. 💳 Cost & Quota Management (NEW)
### Table: `public.tenant_quotas`
- **Fields:** `total_tokens_used`, `token_limit`, `is_active`.
- **UI Requirement:** Create a **"Usage Monitor"** widget or page.
- **Error Handling:** If the AI call fails with a specific quota error, the frontend MUST display a **"Subscription Limit Reached"** modal.

## 4. ⚡ Backpressure & Resilience
- **Status:** The Gateway now offloads messages to Supabase if Redis is near 5,000 deep.
- **UI Action:** Poll Supabase `silkbot_messages` periodically if high-latency is detected, as a fallback to real-time events.

---
### 🛠️ Developer Checklist for Frontend Agent:
1. Update `ActivityStream` or a new `UsagePage` to read from `public.tenant_quotas`.
2. Update `AIReasoningTrace` component to filter/group by `trace_id`.
3. Add a visual indicator for "Thought ID" in the trace logs.

**Backend is Synced & Hardened.** 🚀
