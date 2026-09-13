import { Check, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const free = [
  "1 free resume analysis",
  "ATS score & breakdown",
  "AI rewrite preview",
  "Top 3 job matches",
];

const pro = [
  "Unlimited resume analyses",
  "Full AI rewrite + PDF export",
  "Top 5 job matches with live openings",
  "AI interview prep (10 Qs per role)",
  "Apply-fix suggestions for every weakness",
  "Priority support",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative container px-4 py-12 sm:py-28">
      {/* Background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, hsl(32 70% 30% / 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="section-tag"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em" }}
        >
          ✦ Pricing ✦
        </p>
        <h2
          className="mt-3 font-display text-2xl sm:text-4xl font-bold"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: "hsl(42 80% 88%)",
            letterSpacing: "0.02em",
          }}
        >
          Simple. Honest. India-First.
        </h2>
        <p
          className="mt-3 text-base"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "hsl(38 35% 57%)",
            fontStyle: "italic",
            fontSize: "1.1rem",
          }}
        >
          Start free. Upgrade only if you love it.
        </p>
        <div className="divider-gold mx-auto mt-4 sm:mt-6 max-w-xs" />
      </div>

      <div className="mx-auto mt-10 sm:mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
          style={{
            background: "linear-gradient(145deg, hsl(25 20% 9% / 0.90), hsl(20 15% 6% / 0.95))",
            border: "1px solid hsl(43 60% 40% / 0.18)",
            boxShadow: "0 8px 40px hsl(20 15% 2% / 0.60)",
          }}
        >
          {/* Top line */}
          <div className="absolute inset-x-0 top-0 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(43 60% 40% / 0.30), transparent)" }} />

          <div
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Cinzel', serif", color: "hsl(38 35% 52%)" }}
          >
            Free Plan
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span
              className="font-display text-5xl font-bold"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "hsl(42 80% 82%)",
              }}
            >
              ₹0
            </span>
            <span style={{ color: "hsl(38 28% 48%)", fontSize: "0.9rem" }}>/forever</span>
          </div>
          <p
            className="mt-2 text-sm"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "hsl(38 30% 52%)",
              fontStyle: "italic",
            }}
          >
            Try the magic, no credit card needed.
          </p>

          <ul className="mt-7 space-y-3.5">
            {free.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "hsl(38 35% 62%)" }}>
                <Check
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color: "hsl(43 80% 55%)" }}
                />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to="/auth/register"
            id="pricing-free-btn"
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5"
            style={{
              border: "1px solid hsl(43 60% 40% / 0.30)",
              color: "hsl(43 80% 62%)",
              background: "hsl(43 60% 40% / 0.07)",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.10em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(43 60% 40% / 0.55)";
              (e.currentTarget as HTMLElement).style.background = "hsl(43 60% 40% / 0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(43 60% 40% / 0.30)";
              (e.currentTarget as HTMLElement).style.background = "hsl(43 60% 40% / 0.07)";
            }}
          >
            Start Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
          style={{
            background: "linear-gradient(145deg, hsl(28 25% 10% / 0.95), hsl(20 15% 6% / 0.98))",
            border: "1px solid hsl(43 95% 55% / 0.35)",
            boxShadow: "0 0 50px hsl(43 95% 55% / 0.18), 0 8px 40px hsl(20 15% 2% / 0.70), inset 0 1px 0 hsl(43 95% 55% / 0.10)",
          }}
        >
          {/* Gold top shimmer */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(48 100% 65% / 0.6), hsl(43 95% 55% / 0.9), hsl(48 100% 65% / 0.6), transparent)",
            }}
          />

          {/* Most Popular badge */}
          <div
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "linear-gradient(135deg, hsl(43 95% 55%), hsl(32 80% 42%))",
              color: "hsl(20 15% 4%)",
              fontFamily: "'Cinzel', serif",
              boxShadow: "0 0 15px hsl(43 95% 55% / 0.40)",
            }}
          >
            <Crown className="h-2.5 w-2.5" /> Most Popular
          </div>

          {/* Launch offer badge */}
          <div className="mb-4 flex">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{
                border: "1px solid hsl(0 70% 55% / 0.35)",
                background: "hsl(0 60% 50% / 0.10)",
                color: "hsl(0 80% 70%)",
              }}
            >
              🔥 Launch Offer — Limited Time
            </span>
          </div>

          <div
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{
              fontFamily: "'Cinzel', serif",
              background: "linear-gradient(135deg, hsl(48 100% 68%), hsl(43 95% 55%))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pro Plan
          </div>

          <div
            className="mt-1 text-sm font-semibold line-through"
            style={{ color: "hsl(38 25% 40%)" }}
          >
            ₹299
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="font-display text-5xl font-bold"
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, hsl(48 100% 70%), hsl(43 95% 55%), hsl(32 70% 50%))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px hsl(43 95% 55% / 0.30))",
              }}
            >
              ₹49
            </span>
            <span style={{ color: "hsl(38 28% 48%)", fontSize: "0.9rem" }}>/month</span>
          </div>
          <p
            className="mt-2 text-sm"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "hsl(38 30% 52%)",
              fontStyle: "italic",
            }}
          >
            Cancel anytime. 7-day refund guarantee.
          </p>

          <ul className="mt-7 space-y-3.5">
            {pro.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "hsl(38 40% 68%)" }}>
                <Check
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color: "hsl(43 95% 58%)" }}
                />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to="/auth/register"
            id="pricing-pro-btn"
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, hsl(43 95% 55%) 0%, hsl(38 90% 48%) 50%, hsl(32 80% 42%) 100%)",
              color: "hsl(20 15% 4%)",
              boxShadow: "0 0 30px hsl(43 95% 55% / 0.40)",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.10em",
            }}
          >
            <Sparkles className="h-4 w-4" /> Upgrade to Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
