import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

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

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  const loading = loginMutation.isPending || signupMutation.isPending;

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.25), transparent 50%), radial-gradient(circle at 80% 20%, rgba(74,99,115,0.2), transparent 40%), radial-gradient(circle at 50% 80%, rgba(123,154,153,0.15), transparent 45%)",
        }}
      />

      <div className="hidden sm:flex absolute top-8 left-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
        <Sparkles className="h-4 w-4 text-gold" />
        Secure Authentication
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md mt-6 sm:mt-0">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-black tracking-tight text-white md:text-5xl">
            Mwanga Grid
          </h1>
          <p className="mt-2 text-base text-white/60">
            Sign in, sign up, and return to the page you were on.
          </p>
        </div>

        <Card className="group border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-gold/40 hover:shadow-[0_0_40px_-8px_rgba(219,174,115,0.3)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "signin"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  minLength={2}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
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
                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/50 hover:text-gold underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
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
                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                onKeyDown={handleKeyDown}
              />
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
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
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : null}

            {error ? (
              <p
                className="rounded-lg bg-destructive/20 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 transition-all"
              onClick={submit}
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <p className="text-center text-sm text-white/50">
              {mode === "signin"
                ? "Need an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-gold hover:text-gold/80 transition-colors"
                onClick={() =>
                  switchMode(mode === "signin" ? "signup" : "signin")
                }
              >
                Switch
              </button>
            </p>

            <Button
              variant="ghost"
              className="w-full text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => navigate(returnTo)}
            >
              Back to previous page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
