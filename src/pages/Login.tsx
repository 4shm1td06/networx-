import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Step = "email" | "password" | "otp" | "setPassword";

export default function AuthWithEmailOtp() {
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [step, setStep] = useState<Step>("email");
    const [loading, setLoading] = useState<boolean>(false);
    const [emailExists, setEmailExists] = useState<boolean | null>(null);

    const navigate = useNavigate();
    const { setUser } = useAuth();

    const API_URL = "https://networx-smtp.vercel.app/api";

    // Step 1: Check if email exists
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
                setEmailExists(true);
                setStep("password");
            } else {
                setEmailExists(false);
                await fetch(`${API_URL}/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                alert("✅ OTP sent to your email!");
                setStep("otp");
            }
        } catch (err: any) {
            alert("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Login existing user
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

            if (data.success) {
                setUser({ email });
                alert("✅ Logged in successfully!");
                navigate("/home");
            } else {
                alert(data.error || "Invalid credentials");
            }
        } catch (err: any) {
            alert("Login failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Verify OTP (for new user)
    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) return alert("Enter valid 6-digit OTP");

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (data.success) {
                alert("✅ Email verified!");
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

    // Step 4: Set password (for new user)
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

            if (data.success) {
                setUser({ email });
                alert("✅ Registration complete!");
                navigate("/home");
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (err: any) {
            alert("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

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
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </Button>
                        </form>
                    )}

                    {step === "password" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in…
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                            <Button variant="link" onClick={() => setStep("email")}>
                                Back
                            </Button>
                        </form>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>
                            <Button variant="link" onClick={() => setStep("email")}>
                                Back
                            </Button>
                        </form>
                    )}

                    {step === "setPassword" && (
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Set a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…
                                    </>
                                ) : (
                                    "Register & Login"
                                )}
                            </Button>
                            <Button variant="link" onClick={() => setStep("email")}>
                                Back
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
