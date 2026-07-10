import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token"), []);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetMutation = trpc.auth.resetPassword.useMutation();

  const submit = async () => {
    setError(null);
    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await resetMutation.mutateAsync({ token, newPassword: password });
      await queryClient.invalidateQueries();
      navigate("/auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center shadow-xl">
          <CardTitle className="text-2xl mb-4 text-destructive">Invalid Link</CardTitle>
          <p className="text-muted-foreground">The password reset link is invalid or missing.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

          <Button 
            className="w-full" 
            onClick={submit} 
            disabled={resetMutation.isPending || !password || !confirmPassword}
          >
            {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
