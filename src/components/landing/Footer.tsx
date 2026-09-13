import { Link } from "react-router-dom";
import logo from "@/assets/prohired-logo.png";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(20 15% 5% / 0.80), hsl(15 12% 3%))",
        borderTop: "1px solid hsl(43 60% 40% / 0.18)",
      }}
    >
      {/* Top gold shimmer line */}
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(43 95% 55% / 0.45), hsl(48 100% 65% / 0.60), hsl(43 95% 55% / 0.45), transparent)",
        }}
      />

      {/* Ambient orb */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "200px",
          background: "radial-gradient(ellipse at center bottom, hsl(43 60% 30% / 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container relative px-4 py-10 sm:py-14">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-border/40 shadow-xs p-0.5">
                <img src={logo} alt="ProHired logo" className="h-full w-full rounded-lg object-contain" />
              </div>
              <span
                className="font-display text-lg font-bold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: "linear-gradient(135deg, #FB7A45, #F0562B, #C2410C)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.12em",
                }}
              >
                ProHired
              </span>
            </Link>
            <p
              className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500"
            >
              AI-powered resume intelligence, crafted for ambitious job seekers.
            </p>

            {/* Decorative divider */}
            <div
              className="mt-6 h-[1px] max-w-[120px]"
              style={{
                background: "linear-gradient(90deg, #F0562B, transparent)",
              }}
            />
          </div>

          <FooterCol
            title="Product"
            links={[
              ["Features", "#features"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "#"],
              ["Privacy Policy", "/privacy"],
              ["Account Deletion", "/account-deletion"],
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              ["Sign In", "/auth/login"],
              ["Create Account", "/auth/register"],
              ["Account & Data Deletion", "/account-deletion"],
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between"
          style={{ borderTop: "1px solid rgba(16, 24, 40, 0.08)" }}
        >
          <p
            className="text-xs text-gray-400"
          >
            © {new Date().getFullYear()} ProHired. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i === 1 ? "18px" : "6px",
                  height: "3px",
                  background: i === 1 ? "hsl(43 95% 55%)" : "hsl(43 60% 35% / 0.4)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div
        className="text-xs font-bold uppercase"
        style={{
          fontFamily: "'Cinzel', serif",
          color: "hsl(43 80% 58%)",
          letterSpacing: "0.18em",
        }}
      >
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-sm transition-all duration-200"
              style={{ color: "hsl(38 28% 50%)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(43 80% 62%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(38 28% 50%)";
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
