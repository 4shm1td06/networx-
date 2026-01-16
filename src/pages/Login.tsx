import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Step = "email" | "password" | "otp" | "setPassword";

export default function AuthWithEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const API_URL = "https://networx-smtp.vercel.app/api";

  // =========================
  // Handle successful login - extract user from response
  // =========================
  const handleLoginSuccess = (responseData: any) => {
    // Backend returns: { success: true, userId: "uuid" }
    // We need to construct the user object from the response + form data
    if (!responseData.userId) {
      throw new Error("Server returned invalid response - missing userId");
    }
    
    const userData: any = {
      id: responseData.userId,
      email: email, // Use email from form state
    };
    
    // If tokens are provided, store them
    if (responseData.accessToken) userData.accessToken = responseData.accessToken;
    if (responseData.refreshToken) userData.refreshToken = responseData.refreshToken;
    
    setUser(userData);
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

      // Extract user and tokens from response
      handleLoginSuccess(data);
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

      // Login automatically
      const loginRes = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      
      if (!loginData.success) throw new Error(loginData.error || "Login failed");

      // Extract user and tokens from response
      handleLoginSuccess(loginData);
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
    <div className="min-h-screen flex items-center justify-center bg-networx-dark p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-networx-light mb-2">Networx</h1>
          <p className="text-sm sm:text-base text-networx-light/60">Connect with your community</p>
        </div>

        <Card className="networx-card border-[#232e48] shadow-2xl">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-networx-light">
              {step === "email"
                ? "Welcome back"
                : step === "password"
                ? "Sign in"
                : step === "otp"
                ? "Verify your email"
                : "Create your account"}
            </CardTitle>
            <p className="text-center text-xs sm:text-sm text-networx-light/60 mt-2">
              {step === "email"
                ? "Enter your email to get started"
                : step === "password"
                ? "Enter your password to continue"
                : step === "otp"
                ? "Check your email for the code"
                : "Set a secure password"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            {step === "email" && (
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field h-12 sm:h-12 text-base"
                    required
                    autoComplete="email"
                  />
                </div>
                <Button 
                  className="w-full h-12 sm:h-12 btn-primary rounded-lg font-semibold text-base"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : null}
                  Continue
                </Button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-networx-light">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field h-12 sm:h-12 text-base"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button 
                  className="w-full h-12 sm:h-12 btn-primary rounded-lg font-semibold text-base"
                  disabled={loading || !password}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : null}
                  Sign In
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-networx-light">
                    6-digit code
                  </label>
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input-field h-12 sm:h-12 text-center text-2xl sm:text-3xl tracking-widest font-mono"
                    required
                    inputMode="numeric"
                  />
                </div>
                <Button 
                  className="w-full h-12 sm:h-12 btn-primary rounded-lg font-semibold text-base"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : null}
                  Verify
                </Button>
              </form>
            )}

            {step === "setPassword" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-networx-light">
                    Create password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field h-12 sm:h-12 text-base"
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-networx-light/50">
                    Use at least 8 characters
                  </p>
                </div>
                <Button 
                  className="w-full h-12 sm:h-12 btn-primary rounded-lg font-semibold text-base"
                  disabled={loading || password.length < 8}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : null}
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-networx-light/50 mt-4 sm:mt-6">
          By signing in, you agree to our{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Terms of Service
          </span>
        </p>

        {/* QR Connect Option */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#232e48]">
          <p className="text-center text-xs sm:text-sm text-networx-light/60 mb-3 sm:mb-4">
            Have a connection code?
          </p>
          <Button
            onClick={() => window.location.href = '/qr-connect'}
            variant="outline"
            className="w-full h-12 sm:h-12 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <QrCode className="h-5 w-5" /> Connect via QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}
