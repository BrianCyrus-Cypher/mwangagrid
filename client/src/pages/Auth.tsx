import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const SLideshow_IMAGES = [
  "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
  "https://claire.solar/public/uploads/all/NtuJLuQuhODQpi5G6UuQN8EC9xMaPiEyreyqLHgM.jpg",
  "https://claire.solar/public/uploads/all/Ue2JOqJWAhrvsjqKEJnLuNV4ZRuvadtwL3sDTrAD.jpg",
  "https://claire.solar/public/uploads/all/P2Lifr47ys8IzbMZQhDG2MEU6OPscwupb9D2kiNo.jpg",
  "https://claire.solar/public/uploads/all/fXmXqOFwHD8cxJeiXLffNPvn0OaJjxKOtzYryNvc.jpg",
];

function getReturnToFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const raw = params.get("returnTo") || "/";
  return raw.startsWith("/") ? raw : "/";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const returnTo = useMemo(
    () => getReturnToFromSearch(window.location.search),
    []
  );
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();
  const loading = loginMutation.isPending || signupMutation.isPending;

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % SLideshow_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const canSubmit = (() => {
    if (!email || !password) return false;
    if (mode === "signup" && (!name || !confirmPassword)) return false;
    return true;
  })();

  const submit = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (mode === "signup") {
      if (!name || name.length < 2) {
        setError("Name must be at least 2 characters");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }
    try {
      if (mode === "signup") {
        await signupMutation.mutateAsync({ email, password, name });
      } else {
        await loginMutation.mutateAsync({ email, password });
      }
      await queryClient.invalidateQueries();
      window.location.href = returnTo;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed"
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit && !loading) submit();
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col lg:flex-row">
      {/* ── Image Panel (desktop: left half, mobile: top 40vh) ── */}
      <div className="relative w-full lg:w-1/2 lg:min-h-screen h-[40vh] lg:h-auto overflow-hidden shrink-0">
        {/* Image slideshow */}
        {SLideshow_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === slideIndex ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Gradient overlays — fixed dark so images stay visible in all themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent lg:from-transparent" />
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-auto lg:right-6 lg:translate-x-0 flex gap-1.5 z-10">
          {SLideshow_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        {/* Branding overlay on image */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-10">
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-lg">
            Mwanga Grid
          </h2>
          <p className="text-sm lg:text-base text-white/70 mt-1 max-w-xs">
            Powering Kenya with solar, security & networking solutions.
          </p>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => navigate(returnTo)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to access your account and orders."
                : "Join Mwanga Grid to shop solar, CCTV & networking products."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1 mb-6">
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  minLength={2}
                  className="h-11"
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-11"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-accent hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={6}
                className="h-11"
                onKeyDown={handleKeyDown}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="h-11"
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 text-base font-semibold bg-accent text-white hover:bg-accent/90 transition-all"
              onClick={submit}
              disabled={loading || !canSubmit}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-accent hover:underline underline-offset-4"
                onClick={() =>
                  switchMode(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
