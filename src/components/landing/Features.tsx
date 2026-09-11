import { ScanLine, Target, Sparkles, FileText, MessageSquare, ShieldCheck } from "lucide-react";

const features = [
  { icon: ScanLine, title: "ATS Score 0–100", desc: "See exactly how recruiter software ranks your resume — content, keywords, format, quantification.", accent: "hsl(43 95% 55%)" },
  { icon: Sparkles, title: "AI Rewrite", desc: "Powered by frontier AI. Action verbs, metrics, and ATS-friendly structure baked in.", accent: "hsl(48 100% 65%)" },
  { icon: Target, title: "Smart Job Match", desc: "Top 5 roles you realistically qualify for, with India salary ranges.", accent: "hsl(38 90% 52%)" },
  { icon: FileText, title: "Live Job Feed", desc: "Real openings from the last 7 days. Apply with one tap.", accent: "hsl(43 95% 55%)" },
  { icon: MessageSquare, title: "AI Interview Prep", desc: "Role-specific questions with ideal answers and STAR-method tips.", accent: "hsl(32 70% 50%)" },
  { icon: ShieldCheck, title: "Private & Secure", desc: "Your resume is encrypted, never shared, and yours to delete anytime.", accent: "hsl(48 100% 65%)" },
];

export function Features() {
  return (
    <section id="features" className="relative container px-4 py-12 sm:py-28">
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="section-tag"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em" }}
        >
          ✦ Features ✦
        </p>
        <h2
          className="mt-3 font-display text-2xl sm:text-4xl font-bold"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: "hsl(42 80% 88%)",
            letterSpacing: "0.02em",
          }}
        >
          Everything You Need to Get Hired Faster
        </h2>
        <div className="divider-gold mx-auto mt-4 sm:mt-6 max-w-xs" />
      </div>

      {/* Features grid */}
      <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass-card group relative overflow-hidden p-7 cursor-default"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Top accent line on hover */}
            <div
              className="absolute inset-x-0 top-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)`,
              }}
            />

            {/* Icon */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${f.accent}18`,
                border: `1px solid ${f.accent}30`,
                color: f.accent,
                boxShadow: `0 0 20px ${f.accent}20`,
              }}
            >
              <f.icon className="h-5 w-5" />
            </div>

            {/* Step number */}
            <div
              className="absolute top-5 right-5 text-xs font-bold opacity-20"
              style={{
                fontFamily: "'Cinzel', serif",
                color: f.accent,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>

            <h3
              className="mt-5 text-base font-semibold"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "hsl(42 75% 85%)",
                letterSpacing: "0.04em",
              }}
            >
              {f.title}
            </h3>
            <p
              className="mt-2.5 text-sm leading-relaxed"
              style={{ color: "hsl(38 30% 55%)" }}
            >
              {f.desc}
            </p>

            {/* Bottom gold shimmer on hover */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent, ${f.accent}80, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
