/**
 * QR-Based Connection Flow Component
 * Handles QR code scanning and auto-registration for unregistered users
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";
import QRScanner from "./QRScanner";

interface QRData {
  code: string;
  inviterUserId?: string;
}

type Step = "qr-scan" | "register" | "connecting" | "success" | "error";

const QRConnectionFlow = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuth();
  const { createOrGetThread } = useChat();

  const [step, setStep] = useState<Step>("qr-scan");
  const [showScanner, setShowScanner] = useState(true);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Registration form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = "https://networx-smtp.vercel.app/api";

  /**
   * Parse QR code data
   * Format: "code:ABCDEF" or "code:ABCDEF|inviter:userid"
   */
  const parseQRCode = (data: string): QRData | null => {
    try {
      const parts = data.split("|").reduce((acc, part) => {
        const [key, value] = part.split(":");
        acc[key.trim()] = value?.trim();
        return acc;
      }, {} as Record<string, string>);

      if (!parts.code) return null;
      return {
        code: parts.code,
        inviterUserId: parts.inviter,
      };
    } catch (err) {
      return null;
    }
  };

  /**
   * Handle QR code scan
   */
  const handleQRScan = async (scannedText: string) => {
    setShowScanner(false);
    const parsed = parseQRCode(scannedText);

    if (!parsed) {
      setStep("error");
      setError("Invalid QR code format");
      return;
    }

    setQrData(parsed);

    // If user is already logged in, verify and connect directly
    if (currentUser?.id) {
      await verifyAndConnect(parsed.code);
    } else {
      // Show registration form
      setStep("register");
    }
  };

  /**
   * Auto-register new user from QR
   */
  const handleAutoRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !password || !qrData) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if email exists
      const checkRes = await fetch(`${API_URL}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();
      if (checkData.exists) {
        setError("Email already registered. Please log in instead.");
        setStep("error");
        return;
      }

      // Register user
      const registerRes = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      if (!registerRes.ok) {
        const regData = await registerRes.json();
        throw new Error(regData.error || "Registration failed");
      }

      // Auto-login after registration
      const loginRes = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginData.success) {
        throw new Error("Auto-login failed");
      }

      // Fetch user data
      const meRes = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      if (!meRes.ok) throw new Error("Failed to fetch user data");
      const userData = await meRes.json();
      setUser(userData.user);

      // Now verify and connect with QR code
      await verifyAndConnect(qrData.code);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify code and establish connection
   */
  const verifyAndConnect = async (code: string) => {
    if (!currentUser?.id && !setUser) {
      setError("User not authenticated");
      setStep("error");
      return;
    }

    setStep("connecting");
    setLoading(true);

    try {
      const verifyRes = await fetch(`${API_URL}/verify-connection-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          requestingUserId: currentUser?.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Invalid code");
      }

      // Create DM thread
      await createOrGetThread(verifyData.connectedUserId);

      setStep("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Connection failed");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep("qr-scan");
    setShowScanner(true);
    setQrData(null);
    setError("");
    setEmail("");
    setName("");
    setPassword("");
  };

  // QR Scan Step
  if (step === "qr-scan") {
    return (
      <>
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => navigate("/login")}
          />
        )}
      </>
    );
  }

  // Registration Step
  if (step === "register" && qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-networx-dark p-4">
        <Card className="w-full max-w-md networx-card border-[#232e48]">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-center text-networx-light">
              Join Networx
            </CardTitle>
            <p className="text-center text-sm text-networx-light/60 mt-2">
              Create an account to connect via QR code
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAutoRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-networx-light">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-networx-light">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-networx-light">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={8}
                />
                <p className="text-xs text-networx-light/50">
                  Minimum 8 characters
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary rounded-lg font-semibold text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Connect"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
              >
                Already have an account? Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connecting Step
  if (step === "connecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-networx-dark">
        <Card className="w-full max-w-md networx-card border-[#232e48]">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-networx-primary/20 rounded-full blur-xl animate-pulse"></div>
              <QrCode className="h-16 w-16 text-networx-primary relative" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-networx-light mb-2">
                Establishing Connection
              </h3>
              <p className="text-sm text-networx-light/60">
                Please wait while we verify your code...
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-networx-primary rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-networx-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-networx-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-networx-dark">
        <Card className="w-full max-w-md networx-card border-[#232e48]">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
              <CheckCircle2 className="h-16 w-16 text-green-400 relative" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-networx-light mb-2">
                Connection Successful!
              </h3>
              <p className="text-sm text-networx-light/60">
                You're now connected. Redirecting to chat...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error Step
  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-networx-dark p-4">
        <Card className="w-full max-w-md networx-card border-[#232e48]">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
              <AlertCircle className="h-16 w-16 text-red-400 relative" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-networx-light mb-2">
                Connection Failed
              </h3>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <p className="text-xs text-networx-light/60">
                Please try again with a valid QR code
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleRetry}
                className="flex-1 btn-primary rounded-lg font-semibold"
              >
                Scan Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="flex-1 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all rounded-lg"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default QRConnectionFlow;
