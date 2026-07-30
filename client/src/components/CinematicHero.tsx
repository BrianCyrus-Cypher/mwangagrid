import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const SLIDES = [
  {
    headline: "Solar Power Solutions for a Brighter Kenya",
    sub: "From portable generators to whole-home solar systems — we power your world reliably and affordably.",
    cta: "Shop Solar",
    link: "/products",
  },
  {
    headline: "Professional CCTV & Security Systems",
    sub: "High-definition cameras, 24/7 monitoring, and expert installation for homes and businesses across Kenya.",
    cta: "View Cameras",
    link: "/products",
  },
  {
    headline: "Enterprise-Grade Networking Equipment",
    sub: "Wi-Fi 6 routers, managed switches, fiber optic cabling — everything you need for a fast, reliable network.",
    cta: "Browse Products",
    link: "/products",
  },
];

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const [slide, setSlide] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const interval = setInterval(
      () => setSlide(s => (s + 1) % SLIDES.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  const current = SLIDES[slide];

  return (
    <div
      ref={containerRef}
      className="relative h-[100vh] w-full overflow-hidden bg-background"
    >
      {/* Logo as background motif */}
      <motion.div
        style={{ scale, opacity, y }}
        className="absolute inset-0 z-0 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#060D1A] via-[#0B1426] via-40% to-[#182D4A]" />
        <img
          src="/logo.svg"
          alt=""
          width="800"
          height="800"
          className="w-full h-full object-contain opacity-[0.08] pointer-events-none select-none"
          style={{ transform: "scale(2.5)" }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/20 to-background" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`slide-${slide}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="min-h-[300px]"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
                {current.headline}
              </h1>
              <p className="text-lg md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                {current.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8 h-14 bg-white text-blue-700 hover:bg-white/90 shadow-lg transition-all hover:scale-105 font-bold"
              onClick={() => navigate(current.link)}
            >
              {current.cta} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-14 border-white/40 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105"
              onClick={() => navigate("/quotation")}
            >
              Get Free Quote
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 md:gap-16 justify-center mt-16">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-blue-400">
                5000+
              </p>
              <p className="text-sm text-white/60">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-blue-400">
                10+
              </p>
              <p className="text-sm text-white/60">Years Experience</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-blue-400">
                24/7
              </p>
              <p className="text-sm text-white/60">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === slide ? "w-8 bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
