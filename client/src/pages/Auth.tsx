import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

function getReturnToFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const raw = params.get("returnTo") || "/";
  return raw.startsWith("/") ? raw : "/";
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const returnTo = useMemo(() => getReturnToFromSearch(window.location.search), []);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  const loading = loginMutation.isPending || signupMutation.isPending;

  const submit = async () => {
    setError(null);

    try {
      if (mode === "signup" && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (mode === "signup") {
        await signupMutation.mutateAsync({ email, password, name });
      } else {
        await loginMutation.mutateAsync({ email, password });
      }

      // Invalidate queries to update auth state
      await queryClient.invalidateQueries();
      window.location.href = returnTo;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 24%)" }} />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4" />
              Secure Authentication
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Mwanga Grid</h1>
              <p className="max-w-lg text-base text-white/75 md:text-lg">
                Sign in, sign up, and return to the page you were on. Your data is secured with our local authentication system.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Preserved return paths",
                "Protected dashboard sessions",
                "Robust session persistence",
                "Logout that actually clears state",
              ].map(item => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-border/70 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{mode === "signin" ? "Welcome back" : "Create your account"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <button className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setMode("signin")}>
                Sign in
              </button>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setMode("signup")}>
                Sign up
              </button>
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" />
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="••••••••" />
              </div>
            ) : null}

            {error ? <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
              <button className="font-medium text-accent" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                Switch
              </button>
            </p>

            <Button variant="ghost" className="w-full" onClick={() => navigate(returnTo)}>
              Back to previous page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
