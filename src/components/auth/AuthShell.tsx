import { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/prohired-logo.png";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] left-[20%] h-96 w-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] h-96 w-96 rounded-full bg-orange-50 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-white/60 backdrop-blur-xl">
        <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="ProHired Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shadow-xs border border-border/40 bg-white transition-transform group-hover:scale-105"
            />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              ProHired
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 border border-orange-400/40">
                Auth
              </span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main content container */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3.5 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl backdrop-blur-2xl">
            {/* Top accent glow line */}
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-300 mb-5" />

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-6">{children}</div>
          </div>

          {footer && (
            <div className="mt-6 text-center text-xs text-gray-400">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
