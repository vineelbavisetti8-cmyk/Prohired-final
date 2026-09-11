import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Crown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Deep ancient background glow orbs */}
      <div
        className="orb left-[-5%] top-[5%] h-80 w-80"
        style={{ background: "var(--gradient-orb-1)", animationDuration: "18s" }}
      />
      <div
        className="orb right-[-5%] top-[25%] h-96 w-96"
        style={{ background: "var(--gradient-orb-2)", animationDelay: "4s", animationDuration: "22s" }}
      />
      <div
        className="orb left-[40%] bottom-[5%] h-64 w-64"
        style={{ background: "var(--gradient-orb-3)", animationDelay: "8s", animationDuration: "20s" }}
      />

      {/* Ancient dot grid texture */}
      <div className="absolute inset-0 dot-bg opacity-40" />

      {/* Top golden divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] gold-line" />

      <div className="container relative z-10 px-4 py-12 sm:py-28 md:px-8 lg:py-36">
        <div className="mx-auto max-w-5xl text-center">

          {/* Live badge — gold themed */}
          <div
            className="animate-fade-in inline-flex items-center justify-center gap-2 rounded-full px-3.5 sm:px-5 py-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase max-w-full"
            style={{
              background: "linear-gradient(135deg, hsl(43 95% 55% / 0.12), hsl(32 70% 40% / 0.08))",
              border: "1px solid hsl(43 95% 55% / 0.30)",
              color: "hsl(43 95% 62%)",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.10em",
            }}
          >
            <Crown className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(48 100% 65%)" }} />
            <span className="truncate">India-First AI Resume Intelligence</span>
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "hsl(43 95% 55%)" }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: "hsl(43 95% 55%)" }}
              />
            </span>
          </div>

          {/* Hero heading — Cinzel display font, gold gradient */}
          <h1
            className="animate-fade-up mt-6 sm:mt-8 font-display leading-tight tracking-wide"
            style={{
              fontSize: "clamp(1.75rem, 5.5vw, 5.5rem)",
              fontWeight: 800,
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              letterSpacing: "0.02em",
              lineHeight: 1.15,
            }}
          >
            Land Interviews With a{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(48 100% 70%) 0%, hsl(43 95% 55%) 35%, hsl(32 70% 50%) 70%, hsl(43 95% 65%) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                filter: "drop-shadow(0 0 20px hsl(43 95% 55% / 0.35))",
              }}
            >
              Resume That Beats The Bots.
            </span>
          </h1>

          {/* Subheading — elegant Cormorant serif */}
          <p
            className="animate-fade-up mx-auto mt-5 sm:mt-7 max-w-2xl leading-relaxed px-2 sm:px-0"
            style={{
              animationDelay: "0.12s",
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontSize: "clamp(0.95rem, 2vw, 1.28rem)",
              fontWeight: 400,
              color: "hsl(38 40% 65%)",
              fontStyle: "italic",
            }}
          >
            Upload your resume in seconds. Receive an honest ATS score, an AI-rewritten masterpiece,
            the top 5 roles you qualify for, and live job openings — all within 60 seconds.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up mt-8 sm:mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.22s" }}
          >
            <Link
              to="/auth/register"
              id="hero-cta-primary"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:brightness-110 w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, hsl(43 95% 55%) 0%, hsl(38 90% 48%) 50%, hsl(32 80% 42%) 100%)",
                color: "hsl(20 15% 4%)",
                boxShadow: "0 0 30px hsl(43 95% 55% / 0.40), 0 4px 20px hsl(20 15% 2% / 0.5)",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.08em",
              }}
            >
              Analyze My Resume Free <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            <a
              href="#how"
              id="hero-cta-secondary"
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
              style={{
                borderColor: "hsl(43 60% 40% / 0.35)",
                color: "hsl(42 70% 75%)",
                background: "hsl(25 20% 9% / 0.60)",
                backdropFilter: "blur(10px)",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.08em",
              }}
            >
              See How It Works
            </a>
          </div>

          {/* Stats row — ancient card style */}
          <div
            className="animate-fade-up mx-auto mt-10 sm:mt-14 grid max-w-3xl grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gold/20 rounded-2xl overflow-hidden"
            style={{
              animationDelay: "0.35s",
              background: "hsl(43 60% 40% / 0.18)",
              boxShadow: "0 8px 40px hsl(20 15% 2% / 0.60), inset 0 1px 0 hsl(43 95% 55% / 0.08)",
            }}
          >
            <Stat value="60s" label="Avg. Analysis Time" icon="⚡" />
            <Stat value="92%" label="Avg. ATS Score Lift" icon="📈" />
            <Stat value="7-Day" label="Fresh Job Feed" icon="🏆" />
          </div>

        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] gold-line opacity-40" />
    </section>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-6 text-center transition-all duration-300"
      style={{
        background: "linear-gradient(145deg, hsl(25 20% 9% / 0.95), hsl(20 15% 6% / 0.98))",
      }}
    >
      <div
        className="font-display text-3xl font-bold sm:text-4xl"
        style={{
          background: "linear-gradient(135deg, hsl(48 100% 68%), hsl(43 95% 55%))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 10px hsl(43 95% 55% / 0.30))",
        }}
      >
        {value}
      </div>
      <div
        className="mt-1.5 text-xs uppercase tracking-widest"
        style={{
          color: "hsl(38 35% 52%)",
          fontFamily: "'Cinzel', serif",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
