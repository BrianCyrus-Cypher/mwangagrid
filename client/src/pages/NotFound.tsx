import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Search, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(224,120,86,0.06)_0%,transparent_60%)]" />
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/3 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/3 blur-3xl" />

      <Card className="relative w-full max-w-lg mx-4 border-border/70 shadow-xl bg-card/90 backdrop-blur-sm">
        <div className="p-8 md:p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-white font-heading">
                  404
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Page Not Found
          </h1>

          <p className="text-foreground/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let us
            help you find your way back.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setLocation("/")}
              className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => setLocation("/products")}>
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-foreground/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-[10px] text-foreground/30">
            <Shield className="w-3 h-3" />
            Mwanga Grid — Solar • CCTV • Networking
          </div>
        </div>
      </Card>
    </div>
  );
}
