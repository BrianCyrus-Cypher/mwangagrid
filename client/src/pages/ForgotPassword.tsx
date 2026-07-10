import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const submit = async () => {
    setError(null);
    try {
      await requestReset.mutateAsync({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                If an account exists with that email, a password reset link has been sent. Please check your inbox.
              </div>
              <Link href="/auth">
                <Button className="w-full">Return to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button 
                className="w-full" 
                onClick={submit} 
                disabled={requestReset.isPending || !email}
              >
                {requestReset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>

              <div className="text-center mt-4 text-sm">
                <Link href="/auth" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
