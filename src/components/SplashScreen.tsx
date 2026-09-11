import { useEffect, useState, useRef } from "react";
import logo from "@/assets/prohired-logo.png";

interface SplashScreenProps {
  onFinished: () => void;
  duration?: number; // ms total before finishing
}

/** Gold particles around the logo ring */
function GoldParticles() {
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    const rad = (angle * Math.PI) / 180;
    const r = 100 + Math.random() * 60;
    const tx = `${Math.cos(rad) * r}px`;
    const ty = `${Math.sin(rad) * r}px`;
    const delay = `${(i * 0.08).toFixed(2)}s`;
    const size = 2 + Math.random() * 3;
    return { tx, ty, delay, size, angle };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: i % 3 === 0
              ? "hsl(22 100% 65%)"
              : i % 3 === 1
              ? "hsl(14 95% 55%)"
              : "hsl(8 70% 50%)",
            ["--tx" as string]: p.tx,
            ["--ty" as string]: p.ty,
            animation: `goldParticle 1.8s ${p.delay} ease-out forwards`,
            boxShadow: `0 0 6px hsl(14 95% 55%)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/** Decorative corner ornaments */
function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const posClass = {
    tl: "top-6 left-6",
    tr: "top-6 right-6",
    bl: "bottom-6 left-6",
    br: "bottom-6 right-6",
  }[position];

  const rotation = {
    tl: "rotate-0",
    tr: "rotate-90",
    bl: "-rotate-90",
    br: "rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${posClass} ${rotation} opacity-0`}
      style={{ animation: "fadeIn 0.6s 1.4s ease-out forwards" }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M2 38 L2 2 L38 2" stroke="url(#gold-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2.5" fill="hsl(14 95% 55%)" />
        <path d="M10 2 L2 10" stroke="hsl(14 95% 55% / 0.4)" strokeWidth="0.8" />
        <defs>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(22 100% 65%)" />
            <stop offset="100%" stopColor="hsl(8 70% 40%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function SplashScreen({ onFinished, duration = 3200 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const [progress, setProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show particles after logo animation completes
    const pTimer = setTimeout(() => setShowParticles(true), 700);

    // Animate progress bar
    const startTime = Date.now();
    const totalDuration = duration - 600; // leave 600ms for exit
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressRef.current!);
        setPhase("exit");
        setTimeout(onFinished, 600);
      }
    }, 30);

    return () => {
      clearTimeout(pTimer);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [duration, onFinished]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, hsl(25 25% 7%) 0%, hsl(20 15% 4%) 60%, hsl(15 10% 2%) 100%)",
        animation: phase === "exit" ? "splashFadeOut 0.6s ease-in forwards" : "splashReveal 0.5s ease-out both",
      }}
    >
      {/* Ambient background orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, hsl(14 95% 55% / 0.08) 0%, transparent 65%)",
          animation: "orbSplash 1.2s 0.3s ease-out forwards",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "900px",
          height: "900px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, hsl(8 70% 40% / 0.05) 0%, transparent 60%)",
          animation: "orbSplash 1.5s 0.5s ease-out forwards",
        }}
      />

      {/* Corner ornaments */}
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(14 60% 40% / 0.035) 1px, transparent 1px), linear-gradient(90deg, hsl(14 60% 40% / 0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0,
          animation: "fadeIn 1s 0.8s ease-out forwards",
        }}
      />

      {/* ── LOGO MARK + RINGS ── */}
      <div className="relative flex items-center justify-center" style={{ width: "200px", height: "200px" }}>
        {/* Gold particles burst */}
        {showParticles && <GoldParticles />}

        {/* Outer rotating ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "180px",
            height: "180px",
            border: "1px solid transparent",
            borderTopColor: "hsl(14 95% 55% / 0.6)",
            borderRightColor: "hsl(14 95% 55% / 0.2)",
            animation: "ringRotate 3s linear infinite",
            opacity: 0,
            animationDelay: "0.6s",
            animationFillMode: "forwards",
          }}
        />
        {/* Inner counter-rotating ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "155px",
            height: "155px",
            border: "1px dashed hsl(14 60% 40% / 0.35)",
            animation: "ringRotateReverse 5s linear infinite",
            opacity: 0,
            animationDelay: "0.8s",
            animationFillMode: "forwards",
          }}
        />
        {/* Subtle inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "125px",
            height: "125px",
            border: "1px solid hsl(14 95% 55% / 0.15)",
            animation: "centerPulse 2s ease-in-out infinite",
            opacity: 0,
            animationDelay: "1s",
            animationFillMode: "forwards",
          }}
        />

        {/* Center logo rounded container */}
        <div
          className="relative flex items-center justify-center rounded-2xl p-2.5 overflow-hidden shadow-2xl"
          style={{
            width: "115px",
            height: "115px",
            background: "#ffffff",
            border: "1.5px solid hsl(14 95% 55% / 0.40)",
            animation: "logoGlow 2.5s ease-in-out infinite, splashReveal 0.6s 0.2s ease-out both",
            boxShadow: "0 0 35px hsl(14 95% 55% / 0.35), 0 10px 25px -5px rgba(13, 98, 96, 0.25)",
          }}
        >
          <img src={logo} alt="ProHired Logo" className="h-full w-full object-contain rounded-xl" />
        </div>

        {/* Tick marks on outer ring at 90deg intervals */}
        {[0, 90, 180, 270].map((deg, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "hsl(14 95% 60%)",
              boxShadow: "0 0 8px hsl(14 95% 55%)",
              top: `${50 - 45 * Math.cos((deg * Math.PI) / 180)}%`,
              left: `${50 + 45 * Math.sin((deg * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
              opacity: 0,
              animation: `fadeIn 0.3s ${0.9 + i * 0.1}s ease-out forwards`,
            }}
          />
        ))}
      </div>

      {/* ── BRAND NAME ── */}
      <div
        className="mt-8 overflow-hidden"
        style={{ perspective: "500px" }}
      >
        <h1
          className="text-center font-display text-4xl font-extrabold tracking-[0.12em]"
          style={{
            animation: "brandLetterDrop 0.8s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
            filter: "drop-shadow(0 0 20px rgba(240, 86, 43, 0.3))",
          }}
        >
          <span className="text-[#0D6260]">PRO</span>
          <span className="text-[#F0562B]">HIRED</span>
        </h1>
      </div>

      {/* ── TAGLINE ── */}
      <p
        className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.22em]"
        style={{
          color: "hsl(16 50% 65%)",
          animation: "taglineReveal 0.8s 1.0s ease-out both",
          opacity: 0,
        }}
      >
        Skills Meet Opportunities
      </p>

      {/* ── HORIZONTAL RULE ── */}
      <div
        className="mt-6"
        style={{
          width: "200px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, hsl(14 95% 55% / 0.5), hsl(22 100% 65% / 0.7), hsl(14 95% 55% / 0.5), transparent)",
          opacity: 0,
          animation: "fadeIn 0.5s 1.2s ease-out forwards",
        }}
      />

      {/* ── PROGRESS BAR ── */}
      <div
        className="mt-8 overflow-hidden rounded-full"
        style={{
          width: "180px",
          height: "2px",
          background: "hsl(14 60% 30% / 0.20)",
          opacity: 0,
          animation: "fadeIn 0.4s 1.3s ease-out forwards",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, hsl(8 70% 45%), hsl(14 95% 55%), hsl(22 100% 65%))",
            boxShadow: "0 0 8px hsl(14 95% 55% / 0.60)",
            transition: "width 0.08s linear",
          }}
        />
      </div>

      {/* Micro label */}
      <p
        className="mt-3 text-center text-[10px] font-medium tracking-widest uppercase"
        style={{
          color: "hsl(16 35% 45%)",
          opacity: 0,
          animation: "fadeIn 0.4s 1.5s ease-out forwards",
        }}
      >
        Initializing...
      </p>
    </div>
  );
}
