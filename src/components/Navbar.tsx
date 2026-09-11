import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, Menu, X, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/prohired-logo.png";

export function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Detect scroll for enhanced blur/border effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while menu open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Hide on app routes
  if (location.pathname.startsWith("/app") || location.pathname.startsWith("/auth"))
    return null;

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "hsl(20 15% 4% / 0.92)"
          : "hsl(20 15% 4% / 0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid hsl(43 60% 40% / ${scrolled ? "0.22" : "0.12"})`,
        boxShadow: scrolled ? "0 4px 30px hsl(20 15% 2% / 0.50)" : "none",
      }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-border/40 shadow-xs p-0.5 overflow-hidden transition-all duration-300 group-hover:scale-105">
            <img src={logo} alt="Prohired logo" className="h-full w-full rounded-lg object-contain" />
          </div>
          <span
            className="font-display text-lg font-bold tracking-widest uppercase transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(48 100% 70%), hsl(43 95% 55%), hsl(32 70% 50%))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.12em",
              fontFamily: "'Cinzel', serif",
            }}
          >
            ProHired
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:opacity-100"
              style={{
                color: "hsl(38 35% 58%)",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.12em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(43 95% 62%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(38 35% 58%)";
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to="/app/dashboard"
              id="nav-dashboard-btn"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, hsl(43 95% 55%), hsl(32 80% 42%))",
                color: "hsl(20 15% 4%)",
                boxShadow: "0 0 20px hsl(43 95% 55% / 0.30)",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.08em",
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                id="nav-signin-btn"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:opacity-100"
                style={{
                  color: "hsl(38 40% 62%)",
                  background: "transparent",
                  border: "1px solid hsl(43 60% 40% / 0.20)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.08em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(43 60% 40% / 0.45)";
                  (e.currentTarget as HTMLElement).style.color = "hsl(43 95% 60%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(43 60% 40% / 0.20)";
                  (e.currentTarget as HTMLElement).style.color = "hsl(38 40% 62%)";
                }}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
              <Link
                to="/auth/register"
                id="nav-register-btn"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, hsl(43 95% 55%), hsl(32 80% 42%))",
                  color: "hsl(20 15% 4%)",
                  boxShadow: "0 0 20px hsl(43 95% 55% / 0.25)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.08em",
                }}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          id="navbar-mobile-toggle"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 md:hidden touch-min"
          style={{
            border: "1px solid hsl(43 60% 40% / 0.25)",
            background: "hsl(25 20% 9% / 0.80)",
            color: "hsl(43 80% 65%)",
          }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 md:hidden"
            style={{ background: "hsl(20 15% 4% / 0.60)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto md:hidden"
            style={{
              background: "hsl(20 15% 5% / 0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid hsl(43 60% 40% / 0.22)",
              boxShadow: "0 20px 50px hsl(20 15% 2% / 0.70)",
            }}
          >
            <nav className="container flex flex-col gap-1 px-4 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center rounded-lg px-4 text-sm font-semibold uppercase tracking-widest transition-all duration-200"
                  style={{
                    color: "hsl(38 40% 62%)",
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.10em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "hsl(43 60% 40% / 0.10)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(43 95% 62%)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "hsl(38 40% 62%)";
                  }}
                >
                  {l.label}
                </a>
              ))}

              <div
                className="mt-3 flex flex-col gap-3 pt-3"
                style={{ borderTop: "1px solid hsl(43 60% 40% / 0.15)" }}
              >
                {user ? (
                  <Link
                    to="/app/dashboard"
                    className="flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-bold uppercase tracking-widest"
                    style={{
                      background: "linear-gradient(135deg, hsl(43 95% 55%), hsl(32 80% 42%))",
                      color: "hsl(20 15% 4%)",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    <Crown className="h-4 w-4" /> Open Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold uppercase tracking-widest"
                      style={{
                        borderColor: "hsl(43 60% 40% / 0.25)",
                        color: "hsl(38 45% 62%)",
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      <LogIn className="h-4 w-4" /> Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      className="flex h-12 items-center justify-center rounded-lg text-sm font-bold uppercase tracking-widest"
                      style={{
                        background: "linear-gradient(135deg, hsl(43 95% 55%), hsl(32 80% 42%))",
                        color: "hsl(20 15% 4%)",
                        fontFamily: "'Cinzel', serif",
                        boxShadow: "0 0 20px hsl(43 95% 55% / 0.30)",
                      }}
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
