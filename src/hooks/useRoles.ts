import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface UserRoles {
  global: string;
  tenant: string;
}

export const useRoles = () => {
  const [userRoles, setUserRoles] = useState<UserRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserRoles({
            global: user.app_metadata?.global_role || "user",
            tenant: user.app_metadata?.tenant_role || "agent",
          });
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [supabase.auth]);

  return { userRoles, loading };
};
