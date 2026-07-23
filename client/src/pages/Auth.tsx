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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-slate-950/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent lg:from-transparent" />
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
        {/* Branding overlay on image — with dark scrim for readability */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-10 bg-black/40 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-lg">
            Mwanga Grid
          </h2>
          <p className="text-sm lg:text-base text-white/80 mt-1 max-w-xs leading-relaxed">
            Powering Kenya with solar, security & networking solutions.
          </p>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0 relative overflow-hidden">
        {/* Accent-tinted background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-background to-primary/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.03] via-transparent to-primary/[0.03]" />
        {/* Fade from image panel into form */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-slate-950/30 to-transparent pointer-events-none lg:block hidden" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/[0.04] to-transparent pointer-events-none lg:hidden" />

        <div className="w-full max-w-md relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigate(returnTo)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="mb-8">
            <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-accent to-primary mb-5" />
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {mode === "signin"
                ? "Sign in to access your account and orders."
                : "Join Mwanga Grid to shop solar, CCTV & networking products."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 mb-6">
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === "signin"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
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
              className="w-full h-12 text-base font-bold bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
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
