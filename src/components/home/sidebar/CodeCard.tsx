import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  MessageCircle,
  Send,
  Clock,
  Settings,
  QrCode,
  Copy,
  Loader2,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import QRScanner from "@/components/QRScanner";
import { toast } from "sonner";
import { useConnection } from "@/contexts/ConnectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeCanvas } from "qrcode.react";

const MIN_CODE_LENGTH = 6;

const CodeCard = () => {
  const { user } = useAuth();
  const { currentCode, generateConnectionCode, refreshCode } = useConnection();

  const [codeInput, setCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Generate QR data as a deep link with the connection code
   * Format: https://networx.app/connect?code=ABCDEF
   * This allows external scanning to redirect to the app
   */
  const getQRValue = (): string => {
    if (!currentCode?.code) return "";
    const appUrl = window.location.origin;
    return `${appUrl}/connect?code=${currentCode.code}`;
  };

  /* -------------------- Generate Code -------------------- */
  const handleGenerate = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);
    await generateConnectionCode();
  };

  /* -------------------- Copy Code -------------------- */
  const handleCopy = async () => {
    if (!currentCode?.code) return;
    await navigator.clipboard.writeText(currentCode.code);
    toast.success("Code copied");
  };

  /* -------------------- QR Scan Result -------------------- */
  const handleQRScan = (value) => {
    setCodeInput(value.toUpperCase());
    setShowScanner(false);
    toast.success("Code scanned 📷");
  };

  /* -------------------- Verify Code -------------------- */
  const handleVerify = async () => {
    if (!user) return;

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      if (currentCode?.code === codeInput) {
        setError("You cannot use your own code");
        return;
      }

      const { data: codeData } = await supabase
        .from("connection_code")
        .select("*")
        .eq("code", codeInput)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!codeData) {
        setError("Invalid or expired code");
        return;
      }

      if (codeData.owner_user_id === user.id) {
        setError("You cannot verify your own code");
        return;
      }

      const { data: updatedRows, error: updateError } = await supabase
        .from("connection_code")
        .update({
          verified: true,
          connected_user_id: user.id,
        })
        .eq("id", codeData.id)
        .select();

      if (updateError || !updatedRows?.length) {
        setError("Failed to verify code");
        return;
      }

      const ownerId = updatedRows[0].owner_user_id;
      const verifierId = user.id;

      const { data: existingThread } = await supabase
        .from("dm_threads")
        .select("*")
        .or(
          `and(user1.eq.${ownerId},user2.eq.${verifierId}),and(user1.eq.${verifierId},user2.eq.${ownerId})`
        )
        .maybeSingle();

      if (!existingThread) {
        await supabase.from("dm_threads").insert({
          user1: ownerId,
          user2: verifierId,
        });
      }

      setSuccess("Connected successfully 🎉");
      setCodeInput("");
      await refreshCode();
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  };

  /* -------------------- Realtime Listener -------------------- */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("connection-code-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connection_code",
          filter: `owner_user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.verified === true) {
            toast.success("🎉 Someone connected with you!");
            refreshCode();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshCode]);

  /* -------------------- UI -------------------- */
  return (
    <div className="p-4 bg-[#0F1628] border-b border-[#232e48]">
      <div className="code-card p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <MessageCircle size={20} className="text-networx-primary" />
              <span className="font-semibold text-lg">Connection Code</span>
            </div>
            <p className="text-xs text-networx-light/60 mt-1 ml-7">
              Share this code with friends to connect
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              disabled={false}
              onClick={handleGenerate}
              className="hover:bg-[#283a56] transition-colors"
              title="Generate new code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* QR or Code Display - Toggle between them */}
        <div className="text-center space-y-3 bg-[#0F1729] rounded-lg p-5 border border-[#232e48]">
          {!showQR ? (
            // Show Connection Code
            <>
              <div className="text-4xl font-mono tracking-widest text-networx-primary font-bold">
                {currentCode?.code ?? "------"}
              </div>

              {currentCode && (
                <div className="flex justify-center gap-3 text-xs text-networx-light/70 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Expires in 10 min
                  </span>
                  <span className="flex items-center gap-1">
                    ⚡ One-time use only
                  </span>
                </div>
              )}

              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCopy}
                  className="bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy Code
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQR(true)}
                  className="bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
                >
                  <QrCode className="h-4 w-4 mr-1" /> Show QR
                </Button>
              </div>
            </>
          ) : (
            // Show QR Code
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="bg-white p-3 rounded-lg shadow-lg border-4 border-networx-primary/20">
                <QRCodeCanvas 
                  value={getQRValue()} 
                  size={180} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-networx-light/60 text-center max-w-xs">
                Share this QR code with friends to connect instantly
              </p>

              <div className="flex justify-center gap-2 mt-3 flex-wrap w-full">
                <Button
                  size="sm"
                  className="flex-1 bg-networx-primary hover:bg-networx-primary/90 transition-all text-white gap-2"
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: "Connect on Networx",
                        text: "Scan my QR code to connect",
                        url: `${window.location.origin}/connect?code=${currentCode?.code}`,
                      });
                    } catch (err) {
                      toast.info("QR code ready to share");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQR(false)}
                  className="bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
                >
                  <QrCode className="h-4 w-4 mr-1" /> Hide QR
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scan Code Option */}
        <Button
          onClick={() => setShowScanner(true)}
          variant="outline"
          className="w-full bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
        >
          <QrCode className="h-4 w-4 mr-2" /> Scan QR Code
        </Button>

        {/* Manual Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-networx-light/80">
            Enter friend's code
          </label>
          <div className="flex gap-2">
            <Input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={MIN_CODE_LENGTH}
              className="input-field flex-1"
            />

            <Button
              onClick={handleVerify}
              disabled={isVerifying || codeInput.length < MIN_CODE_LENGTH}
              className="btn-primary px-5"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" /> Connect
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Feedback */}
        {(error || success) && (
          <div
            className={`text-sm text-center p-3 rounded-lg fade-in ${
              error 
                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}
          >
            {error ?? success}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default CodeCard;
