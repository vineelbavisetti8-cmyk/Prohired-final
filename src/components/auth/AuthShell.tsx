import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/prohired-logo.png";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#FAF9F7] text-foreground selection:bg-orange-500/20 selection:text-orange-600">
      {/* Ambient background glows with overflow-hidden protection */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 sm:left-[15%] h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-orange-500/10 blur-[90px] sm:blur-[120px]" />
        <div className="absolute -bottom-24 right-1/2 translate-x-1/2 sm:right-[10%] h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-amber-500/10 blur-[90px] sm:blur-[120px]" />
      </div>

      {/* Responsive Header with Mobile Safe Area */}
      <header className="relative z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-13 sm:h-16 w-full max-w-5xl items-center justify-between px-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 sm:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <Link to="/" className="group flex items-center gap-2 sm:gap-2.5">
              <img
                src={logo}
                alt="ProHired Logo"
                className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl border border-gray-200/80 bg-white object-contain p-0.5 shadow-xs transition-transform group-hover:scale-105"
              />
              <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-gray-900 flex items-center gap-1.5">
                ProHired
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  AI
                </span>
              </span>
            </Link>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Form Content Container */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3 py-4 sm:px-6 sm:py-10 pb-[max(env(safe-area-inset-bottom,0px),1rem)]">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white/95 p-4 xs:p-5 sm:p-8 shadow-xl shadow-gray-900/5 backdrop-blur-2xl transition-all">
            {/* Top Accent Gradient Bar */}
            <div className="mb-4 sm:mb-5 h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />

            <h1 className="text-xl xs:text-2xl sm:text-2xl font-black tracking-tight text-gray-950">
              {title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
              {subtitle}
            </p>

            <div className="mt-4 sm:mt-6">{children}</div>
          </div>

          {footer && (
            <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
