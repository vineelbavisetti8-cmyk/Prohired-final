import { Upload, BrainCircuit, FileCheck2, Briefcase } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Your Resume", desc: "Drop a PDF or DOCX. We extract every line of text — no copy-paste needed.", numeral: "I" },
  { icon: BrainCircuit, title: "AI Analyzes & Rewrites", desc: "Our AI scores you against ATS rules and rewrites for keywords, structure, and impact.", numeral: "II" },
  { icon: FileCheck2, title: "See Your ATS Score", desc: "Get a 0–100 score, weakness breakdown, and one-tap fixes for every issue.", numeral: "III" },
  { icon: Briefcase, title: "Match to Live Jobs", desc: "Top 5 roles you actually qualify for, with real openings posted in the last 7 days.", numeral: "IV" },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative container px-4 py-12 sm:py-28">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, hsl(43 60% 30% / 0.04) 0%, transparent 65%)",
        }}
      />

      <div className="relative">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="section-tag"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em" }}
          >
            ✦ How It Works ✦
          </p>
          <h2
            className="mt-3 font-display text-2xl sm:text-4xl font-bold"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              color: "hsl(42 80% 88%)",
              letterSpacing: "0.02em",
            }}
          >
            From Upload to Interview, in 4 Steps
          </h2>
          <div className="divider-gold mx-auto mt-4 sm:mt-6 max-w-xs" />
        </div>

        {/* Steps */}
        <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="glass-card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 cursor-default"
            >
              {/* Roman numeral watermark */}
              <div
                className="absolute -top-2 -right-1 text-5xl font-bold opacity-[0.06] pointer-events-none select-none"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "hsl(43 95% 55%)",
                  lineHeight: 1,
                }}
              >
                {s.numeral}
              </div>

              {/* Top shimmer line */}
              <div
                className="absolute inset-x-0 top-0 h-[1px] transition-opacity duration-300"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(43 95% 55% / 0.4), transparent)",
                  opacity: 0.4,
                }}
              />

              {/* Step index */}
              <div
                className="text-xs font-bold mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "hsl(43 70% 50%)",
                  letterSpacing: "0.15em",
                }}
              >
                Step {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "hsl(43 95% 55% / 0.10)",
                  border: "1px solid hsl(43 95% 55% / 0.22)",
                  color: "hsl(43 95% 58%)",
                  boxShadow: "0 0 0 0 hsl(43 95% 55% / 0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(43 95% 55%)";
                  el.style.color = "hsl(20 15% 4%)";
                  el.style.boxShadow = "0 0 20px hsl(43 95% 55% / 0.50)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(43 95% 55% / 0.10)";
                  el.style.color = "hsl(43 95% 58%)";
                  el.style.boxShadow = "none";
                }}
              >
                <s.icon className="h-6 w-6" />
              </div>

              <h3
                className="mt-5 text-sm font-semibold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "hsl(42 75% 85%)",
                  letterSpacing: "0.04em",
                }}
              >
                {s.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "hsl(38 28% 54%)" }}
              >
                {s.desc}
              </p>

              {/* Connector arrow (not on last) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-lg"
                  style={{ color: "hsl(43 60% 35%)" }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
