import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("token"),
    []
  );
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Verification token is missing.");
      return;
    }

    verifyMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setStatus("success");
        },
        onError: err => {
          setStatus("error");
          setErrorMessage(err.message || "Failed to verify email.");
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-xl">
        <CardContent className="pt-6 space-y-6 flex flex-col items-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <CardTitle className="text-xl">Verifying your email...</CardTitle>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
                Email Verified!
              </CardTitle>
              <p className="text-muted-foreground">
                Your email has been successfully verified. You now have full
                access to your account.
              </p>
              <Link href="/account">
                <Button className="w-full mt-4">Go to Account</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <CardTitle className="text-2xl text-destructive">
                Verification Failed
              </CardTitle>
              <p className="text-muted-foreground">{errorMessage}</p>
              <Link href="/">
                <Button variant="outline" className="w-full mt-4">
                  Return Home
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
