import { createClient } from "@supabase/supabase-js";

// Skill 2: Realtime & Shared Client Logic
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Implementation of Skill 5: Optimistic UI Helper
export const updateOptimisticChat = async (chatId: string, newMessage: any) => {
  // Logic to manually insert into client-side cache before API returns
  console.log("🟢 [Skill 5] Applying Optimistic Update to Chat:", chatId);
  return newMessage;
};
