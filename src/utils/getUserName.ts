import { supabase } from "@/integrations/supabase/client";

export const getUserName = async (userId: string) => {
  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  return data?.name || "New message";
};
