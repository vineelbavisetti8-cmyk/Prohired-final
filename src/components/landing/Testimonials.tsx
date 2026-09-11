import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Frontend Developer · Bengaluru",
    quote: "Went from 3 callbacks in 2 months to 11 in two weeks. The keyword analysis alone is worth ₹299.",
    initials: "PS",
    accentColor: "hsl(43 95% 55%)",
  },
  {
    name: "Rohan Mehta",
    role: "Data Analyst · Pune",
    quote: "The AI rewrite restructured my Experience section perfectly. Got an interview at a unicorn within 5 days.",
    initials: "RM",
    accentColor: "hsl(48 100% 65%)",
  },
  {
    name: "Aisha Khan",
    role: "Product Manager · Mumbai",
    quote: "Honest ATS scoring saved me from sending a 47/100 resume. After fixes, I scored 88. Hired in 3 weeks.",
    initials: "AK",
    accentColor: "hsl(38 90% 52%)",
  },
];

export function Testimonials() {
  return (
    <section className="relative container px-4 py-12 sm:py-28">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(43 60% 30% / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="section-tag"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em" }}
          >
            ✦ Testimonials ✦
          </p>
          <h2
            className="mt-3 font-display text-2xl sm:text-4xl font-bold"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              color: "hsl(42 80% 88%)",
              letterSpacing: "0.02em",
            }}
          >
            Real Users. Real Interviews. Real Offers.
          </h2>
          <div className="divider-gold mx-auto mt-4 sm:mt-6 max-w-xs" />
        </div>

        {/* Testimonial cards */}
        <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card group relative overflow-hidden p-7"
            >
              {/* Top shimmer */}
              <div
                className="absolute inset-x-0 top-0 h-[1px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${t.accentColor}60, transparent)`,
                }}
              />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: "hsl(43 95% 55%)" }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: "hsl(42 50% 75%)",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div
                className="my-5 h-[1px]"
                style={{
                  background: `linear-gradient(90deg, ${t.accentColor}25, transparent)`,
                }}
              />

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${t.accentColor}30, ${t.accentColor}15)`,
                    border: `1px solid ${t.accentColor}35`,
                    color: t.accentColor,
                    fontFamily: "'Cinzel', serif",
                    boxShadow: `0 0 12px ${t.accentColor}20`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: "hsl(42 70% 80%)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "hsl(38 28% 48%)" }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
