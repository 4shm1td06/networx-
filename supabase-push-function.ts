// supabase/functions/send-push-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record) {
      return new Response(
        JSON.stringify({ error: "No record provided" }),
        { status: 400 }
      );
    }

    const { sender_id, receiver_id, content, thread_id } = record;

    if (!receiver_id || !sender_id) {
      return new Response(
        JSON.stringify({ error: "Missing receiver_id or sender_id" }),
        { status: 400 }
      );
    }

    // Get sender info
    const { data: senderData } = await supabaseAdmin
      .from("users")
      .select("name, profile_image")
      .eq("id", sender_id)
      .single();

    // Get receiver's push subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", receiver_id);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active subscriptions for receiver" 
        })
      );
    }

    const BACKEND_URL = Deno.env.get("BACKEND_URL") || "http://localhost:4012";
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");

    // Call backend to send push notifications
    const pushResponse = await fetch(`${BACKEND_URL}/api/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: receiver_id,
        title: `Message from ${senderData?.name || "Someone"}`,
        body: content?.substring(0, 100) || "Sent a message",
        icon: senderData?.profile_image,
        threadId: thread_id,
      }),
    });

    const result = await pushResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Push notification triggered",
        result,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
