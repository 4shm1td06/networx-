import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Step = "email" | "password" | "otp" | "setPassword";

export default function AuthWithEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const API_URL = "https://networx-smtp.vercel.app/api"
  // const API_URL = "http://localhost:4012/api";

  // =========================
  // Load user from DB + store in AuthContext
  // =========================
  const loadUserAndLogin = async (email: string) => {
    console.log("[Auth] Loading user from DB:", email);

    const { data, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("[Auth] Failed to load user:", error);
      throw new Error("User record not found");
    }

    console.log("[Auth] User loaded:", data);

    setUser({
      id: data.id,
      email: data.email,
    });
  };

  // =========================
  // Step 1: Check email
  // =========================
  const handleCheckEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.exists) {
        setStep("password");
      } else {
        await fetch(`${API_URL}/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        alert("✅ OTP sent to your email");
        setStep("otp");
      }
    } catch (err: any) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Step 2: Login existing user
  // =========================
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Invalid credentials");
        return;
      }

      await loadUserAndLogin(email);
      navigate("/home");
    } catch (err: any) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Step 3: Verify OTP
  // =========================
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return alert("Enter valid 6-digit OTP");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Email verified");
        setStep("setPassword");
      } else {
        alert(data.error || "Invalid OTP");
      }
    } catch (err: any) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Step 4: Set password (new user)
  // =========================
  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Registration failed");
        return;
      }

      await loadUserAndLogin(email);
      navigate("/home");
    } catch (err: any) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === "email"
              ? "Welcome to Networx"
              : step === "password"
              ? "Login"
              : step === "otp"
              ? "Verify Email"
              : "Set Password"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="w-full" disabled={loading}>
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
              <Button className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <Button className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === "setPassword" && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <Input
                type="password"
                placeholder="Set password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Register & Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
