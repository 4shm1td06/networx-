import React, { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// VANTA
import * as THREE from "three";
// @ts-ignore
import GLOBE from "vanta/dist/vanta.globe.min";

type Step = "email" | "password" | "otp" | "setPassword";

export default function AuthWithEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [uiReady, setUiReady] = useState(false); // 🔥 IMPORTANT
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaInstance = useRef<any>(null);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const API_URL = "https://networx-smtp.vercel.app/api";

  // ======================
  // AUTO LOGIN CHECK (FIXED)
  // ======================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();

        const data = await res.json();
        setUser(data.user);
        navigate("/home", { replace: true });
      } catch {
        // Not logged in
      } finally {
        setCheckingLogin(false);
        setUiReady(true); // 🔥 allow animation only now
      }
    };

    checkUser();
  }, [navigate, setUser]);

  // ======================
  // VANTA BACKGROUND (SAFE INIT)
  // ======================
  useEffect(() => {
    if (!uiReady || !vantaRef.current || vantaInstance.current) return;

    (window as any).THREE = THREE;

    vantaInstance.current = GLOBE({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      color: 0xff3f81,
      backgroundColor: 0x0b1120,
      size: 1,
    });

    return () => {
      if (vantaInstance.current) {
        vantaInstance.current.destroy();
        vantaInstance.current = null;
      }
    };
  }, [uiReady]);

  // ======================
  // RESET FEEDBACK ON STEP CHANGE
  // ======================
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [step]);

  // ======================
  // LOADING SCREEN (NO UNMOUNT)
  // ======================
  if (checkingLogin) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  // ======================
  // HELPERS
  // ======================
  const fetchCurrentUser = async () => {
    const res = await fetch(`${API_URL}/me`, { credentials: "include" });
    if (!res.ok) throw new Error();
    const data = await res.json();
    setUser(data.user);
  };

  // ======================
  // HANDLERS
  // ======================
  const handleCheckEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.exists) {
        setStep("password");
      } else {
        await fetch(`${API_URL}/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        setSuccess("OTP sent to your email");
        setStep("otp");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();

      await fetchCurrentUser();
      navigate("/home", { replace: true });
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();

      setSuccess("Email verified");
      setStep("setPassword");
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();

      await fetchCurrentUser();
      navigate("/home", { replace: true });
    } catch {
      setError("Failed to complete signup");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI CONFIG
  // ======================
  const icons = {
    email: <Mail className="w-8 h-8 text-indigo-500" />,
    password: <Lock className="w-8 h-8 text-indigo-500" />,
    otp: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    setPassword: <Lock className="w-8 h-8 text-indigo-500" />,
  };

  const titles = {
    email: "Welcome to NetworX",
    password: "Secure Login",
    otp: "Verify Your Email",
    setPassword: "Create Password",
  };

  const subtitles = {
    email: "Enter your email to continue",
    password: "Enter your password",
    otp: "Enter the 6-digit code sent to you",
    setPassword: "Choose a strong password",
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="relative min-h-screen w-full bg-[#0B1120] overflow-hidden">
      {/* VANTA BACKGROUND */}
      <div ref={vantaRef} className="absolute inset-0 z-0" />

      {/* AUTH CARD */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-gray-900/80 border border-gray-700 text-gray-100">
          <div className="flex justify-center gap-2 pt-4">
            {["email", "password", "otp", "setPassword"].map((s) => (
              <div
                key={s}
                className={`h-2 w-10 rounded-full ${
                  step === s ? "bg-indigo-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">{icons[step]}</div>
            <CardTitle className="text-2xl font-bold">
              {titles[step]}
            </CardTitle>
            <p className="text-sm text-gray-400">{subtitles[step]}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-2 rounded-md text-sm">
                {success}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button className="w-full bg-indigo-600" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Continue"}
                </Button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button className="w-full bg-indigo-600" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Login"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  maxLength={6}
                  className="text-center tracking-[0.6em] text-lg font-mono"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
                <Button className="w-full bg-indigo-600" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                </Button>
              </form>
            )}

            {step === "setPassword" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button className="w-full bg-indigo-600" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Finish"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
