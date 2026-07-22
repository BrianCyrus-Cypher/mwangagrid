import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  Sun,
  Camera,
  Wifi,
  Zap,
  Shield,
  Users,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sun,
    label: "Solar Power",
    desc: "Reliable energy solutions for home & business",
    color: "text-amber-400",
  },
  {
    icon: Camera,
    label: "CCTV & Security",
    desc: "24/7 surveillance with professional monitoring",
    color: "text-blue-400",
  },
  {
    icon: Wifi,
    label: "Networking",
    desc: "High-speed enterprise-grade connectivity",
    color: "text-emerald-400",
  },
];

export default function Animations() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E2B38] via-[#1E2B38] to-[#2A3D4F] text-white overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#3B82F6]/5 blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#4A6373]/8 blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 animate-float"
          style={{ animationDelay: "-1s" }}
        />
      </div>

      <div className="relative z-10 container min-h-screen flex flex-col items-center justify-center text-center py-12">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <Logo size="lg" />
        </div>

        {/* Tagline */}
        <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 animate-slide-up leading-tight">
          Power. Security. <span className="text-gold">Connectivity.</span>
        </h1>
        <p
          className="text-lg text-white/70 max-w-xl mb-10 animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          Kenya&apos;s trusted source for premium solar equipment, professional
          CCTV systems, and enterprise-grade networking solutions.
        </p>

        {/* Feature icons row */}
        <div
          className="flex flex-wrap justify-center gap-6 mb-12 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 min-w-[140px]"
            >
              <f.icon className={`w-8 h-8 ${f.color}`} />
              <span className="font-semibold text-sm">{f.label}</span>
              <span className="text-xs text-white/50">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="flex gap-8 mb-12 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "5,000+", label: "Customers" },
            { value: "10+", label: "Years" },
            { value: "24/7", label: "Support" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-gold">{s.value}</p>
              <p className="text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex flex-wrap gap-4 justify-center animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <Button
            size="lg"
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold text-base px-8"
            onClick={() => navigate("/auth")}
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 text-base px-8"
            onClick={() => navigate("/")}
          >
            Explore Homepage
          </Button>
        </div>

        {/* Bottom decorative dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/20 animate-ping-subtle"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
