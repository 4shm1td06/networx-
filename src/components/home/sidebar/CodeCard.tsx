import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageCircle, Send, Clock, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useConnection } from "@/contexts/ConnectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MIN_CODE_LENGTH = 6;

const CodeCard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentCode, generateConnectionCode, refreshCode } = useConnection();

  const [codeInput, setCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate a fresh code
  const handleGenerate = async () => {
    if (!user || authLoading) return;
    setError(null);
    setSuccess(null);
    await generateConnectionCode(); // owner_user_id is handled inside context
  };

  // Verify a connection code
  const handleVerify = async () => {
    if (!user || authLoading) return;

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      // Prevent using your own code
      if (currentCode?.code === codeInput) {
        setError("You cannot use your own code!");
        setIsVerifying(false);
        return;
      }

      // 1) Fetch unused, not-expired code
      const { data: codeData, error: selectError } = await supabase
        .from("connection_code")
        .select("*")
        .eq("code", codeInput)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      console.log("DEBUG: fetched codeData:", codeData, "selectError:", selectError);

      if (selectError || !codeData) {
        setError("Invalid or expired code!");
        setIsVerifying(false);
        return;
      }

      const currentUserId = user.id;

      if (!codeData.owner_user_id) {
        console.error("Code row missing owner_user_id:", codeData);
        setError("Invalid code (owner missing).");
        setIsVerifying(false);
        return;
      }

      if (!currentUserId) {
        console.error("Current user id missing on frontend auth user:", user);
        setError("Your account is not ready yet. Try again.");
        setIsVerifying(false);
        return;
      }

      // Prevent self-verification
      if (codeData.owner_user_id === currentUserId) {
        setError("You cannot verify your own code!");
        setIsVerifying(false);
        return;
      }

      // 2) Update the code row: mark verified, set connected_user_id
      const { data: updatedRows, error: updateError } = await supabase
        .from("connection_code")
        .update({
          verified: true,
          connected_user_id: currentUserId,
          // DO NOT set code: null, avoids NOT NULL constraint errors
        })
        .eq("id", codeData.id)
        .select();

      console.log("DEBUG: update result:", updatedRows, updateError);

      if (updateError || !updatedRows?.length) {
        setError("Failed to verify code.");
        setIsVerifying(false);
        return;
      }

      const updated = updatedRows[0];
      const ownerId = updated.owner_user_id ?? codeData.owner_user_id;
      const verifierId = updated.connected_user_id ?? currentUserId;

      // 3) Create DM thread if not exists
      const { data: existingThread } = await supabase
        .from("dm_threads")
        .select("*")
        .or(
          `and(user1.eq.${ownerId},user2.eq.${verifierId}),and(user1.eq.${verifierId},user2.eq.${ownerId})`
        )
        .maybeSingle();

      if (!existingThread) {
        const { data: dmData, error: dmError } = await supabase
          .from("dm_threads")
          .insert({ user1: ownerId, user2: verifierId })
          .select()
          .maybeSingle();

        if (dmError) {
          console.warn("Verified but failed to create DM thread:", dmError);
        } else {
          console.log("DM thread created:", dmData);
        }
      }

      setSuccess("Connection successful!");
      setCodeInput("");
      await refreshCode();
    } catch (err) {
      console.error("Unexpected error in handleVerify:", err);
      setError("Something went wrong.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-4 bg-[#0F1628] border-b border-[#232e48]">
      <div className="p-4 bg-gradient-to-r from-[#1C2A41] to-[#162039] border border-[#232e48] rounded-lg">
        <div className="flex justify-between items-center mb-5">
          <span className="flex items-center gap-1 text-white">
            <MessageCircle size={18} className="text-networx-primary" /> Connection code
          </span>

          <Button size="sm" className="h-7 w-7 p-0 text-white" onClick={handleGenerate}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" className="h-7 w-7 p-0" size="icon">
            <Settings className="h-10 w-5" />
          </Button>
        </div>

        <div className="text-center text-2xl font-bold tracking-widest text-networx-light mb-2">
          {currentCode?.code ?? "------"}
        </div>

        {currentCode && (
          <div className="text-xs flex justify-between text-networx-light/70">
            <span><Clock className="h-3 w-3 inline-block mr-1" /> 10 min</span>
            <span>1 use</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Enter someone's code"
            maxLength={MIN_CODE_LENGTH}
            className="flex-grow"
          />

          <Button
            onClick={handleVerify}
            disabled={isVerifying || codeInput.trim().length < MIN_CODE_LENGTH}
            className="bg-networx-primary hover:bg-networx-secondary text-white"
          >
            <Send className="h-4 w-4 mr-1" /> Connect
          </Button>
        </div>

        {(error || success) && (
          <div className={`mt-2 text-sm ${error ? "text-red-500" : "text-green-500"}`}>
            {error ?? success}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeCard;
