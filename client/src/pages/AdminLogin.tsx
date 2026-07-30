import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState(0);

  const loginMutation = trpc.auth.login.useMutation();

  useEffect(() => {
    if (user?.role === "admin") navigate("/admin", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter email and password");
      return;
    }
    try {
      await loginMutation.mutateAsync({ email, password });
      await queryClient.invalidateQueries();
      const freshUser = queryClient.getQueryData([["auth", "me"]]);
      if (!freshUser || (freshUser as any)?.role !== "admin") {
        setError("Admin access only");
        return;
      }
      toast.success("Welcome back, admin");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060D1A] via-[#0B1426] via-50% to-[#1F3A5E] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.06)_0%,transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/3 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-tight">
            Admin Panel
          </h1>
          <p className="text-blue-300/70 text-sm mt-2">
            Secure administrator access only
          </p>
        </div>

        <Card className="border border-blue-900/50 bg-[#111D35]/80 backdrop-blur-xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-xs font-medium text-blue-300/70 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mwangagrid.co.ke"
                  className="h-11 pl-10 bg-[#182D4A]/50 border-blue-900/50 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-medium text-blue-300/70 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <Input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10 bg-[#182D4A]/50 border-blue-900/50 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-300 transition"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/20"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {loginMutation.isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-blue-900/50">
            <button
              type="button"
              onClick={() => {
                setHint(h => h + 1);
                if (hint >= 4)
                  toast("Contact your system administrator for credentials", {
                    duration: 3000,
                  });
              }}
              className="mx-auto block text-[10px] text-blue-400/30 hover:text-blue-300/50 transition select-none"
            >
              Secure Area
            </button>
          </div>
        </Card>

        <p className="text-center text-[10px] text-blue-400/20 mt-6">
          Authorized personnel only. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
