import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Crown,
  Smartphone,
  Tablet,
  Monitor,
  ChevronDown,
  X,
  ArrowUpRight,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Compass,
  FileText,
  Briefcase,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ProUpgradeDialog } from "@/components/ProGate";
import logo from "@/assets/prohired-logo.png";

const DESKTOP_NAV = [
  { to: "/app/explore", label: "Cockpit", icon: Compass },
  { to: "/app/resume/upload", label: "ATS Studio", icon: Sparkles },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase },
  { to: "/app/interview", label: "Interview", icon: MessageSquare },
  { to: "/app/profile", label: "Account", icon: User },
];
const NAV_ITEMS = DESKTOP_NAV;

interface AppHeaderProps {
  deviceMode: "phone" | "tablet" | "full";
  setDeviceMode: (mode: "phone" | "tablet" | "full") => void;
  onOpenSearch: () => void;
  hideDeviceSwitcher?: boolean;
}

export default function AppHeader({ deviceMode, setDeviceMode, onOpenSearch, hideDeviceSwitcher }: AppHeaderProps) {
  const { profile, isAuthenticated, signOut } = useAuth();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Derive active title based on path
  const getScreenTitle = () => {
    const p = location.pathname;
    if (p.includes("/resume/upload")) return { title: "ATS Studio", subtitle: "Upload & Diagnostic" };
    if (p.includes("/analysis")) return { title: "ATS Report", subtitle: "Keyword & Format Score" };
    if (p.includes("/builder")) return { title: "AI Builder", subtitle: "Interactive Editor" };
    if (p.includes("/jobs") || p.includes("/job-feed")) return { title: "Job Feed", subtitle: "Live Openings" };
    if (p.includes("/interview")) return { title: "AI Mock Interview", subtitle: "STAR Practice" };
    if (p.includes("/profile")) return { title: "Account & Settings", subtitle: "Plan & Preferences" };
    return { title: "ProHired", subtitle: "Career Suite" };
  };

  const { title, subtitle } = getScreenTitle();
  const isPro = profile?.plan === "pro";
  const displayName = profile?.full_name || "User";
  const userInitial = displayName.charAt(0).toUpperCase() || "P";

  return (
    <header
      className={`z-40 w-full bg-white dark:bg-background border-b border-border/60 select-none shadow-xs ${
        deviceMode === "full"
          ? "fixed top-0 left-0 right-0"
          : "sticky top-0 shrink-0"
      }`}
    >
      <div className="flex h-14 sm:h-16 items-center justify-between px-2.5 sm:px-6 gap-1.5 sm:gap-2">
        {/* Left: Branding & Dynamic Screen Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/app/explore" className="flex items-center gap-2 shrink-0 group">
            <img
              src={logo}
              alt="ProHired Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shadow-xs border border-border/40 bg-white transition-transform group-active:scale-95"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                ProHired
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 border border-orange-400/40">
                  App
                </span>
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border/60" />

          {/* Contextual Screen Title */}
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-xs sm:text-base font-bold text-gray-900 truncate tracking-tight">
              {title}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-500 truncate hidden xs:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Desktop Primary Navigation Pills (Visible on desktop screens when in full mode; never on native) */}
        {deviceMode === "full" && !hideDeviceSwitcher && (
          <nav className="hidden lg:flex items-center gap-1 mx-2">
            {DESKTOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500/20 text-orange-500 border border-orange-500/40 shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50/80 border border-transparent"
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* Center / Right controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Device Frame Switcher (desktop web preview only — never rendered in the native app) */}
          {!hideDeviceSwitcher && (
          <div className="hidden lg:flex items-center rounded-xl bg-white/80 p-1 border border-border/60">
            <button
              title="Mobile Device Frame"
              onClick={() => setDeviceMode("phone")}
              className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 font-medium ${
                deviceMode === "phone"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="text-[11px]">Phone</span>
            </button>
            <button
              title="Tablet View"
              onClick={() => setDeviceMode("tablet")}
              className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 font-medium ${
                deviceMode === "tablet"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="text-[11px]">Tablet</span>
            </button>
            <button
              title="Full App Viewport"
              onClick={() => setDeviceMode("full")}
              className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 font-medium ${
                deviceMode === "full"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="text-[11px]">Full</span>
            </button>
          </div>
          )}

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 rounded-xl bg-white/80 p-2 sm:px-2.5 sm:py-1.5 text-xs text-gray-500 border border-border/60 hover:border-orange-500/50 hover:text-gray-800 transition-colors touch-manipulation"
            title="Search ProHired"
          >
            <Search className="h-3.5 w-3.5 text-orange-600" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden lg:inline-block rounded bg-gray-100 px-1 py-0.5 text-[9px] text-gray-500 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Notification Center Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/80 border border-border/60 text-gray-600 hover:text-orange-600 hover:border-orange-500/50 transition-colors touch-manipulation"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Notification Dropdown Drawer (mobile responsive max-w) */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 rounded-2xl bg-white/95 border border-gray-200 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-slide-down">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-bold text-gray-900">Notifications</span>
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-gray-500 hover:text-gray-800 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="py-6 text-center text-xs text-gray-500">
                  No unread alerts. Your parsed resumes and job matches will appear here.
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-end">
                  <Link
                    to="/app/jobs"
                    onClick={() => setNotifOpen(false)}
                    className="text-orange-600 hover:text-orange-500 text-xs font-medium flex items-center gap-1"
                  >
                    View Job Feed <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile OR Sign In / Sign Up Buttons */}
          {isAuthenticated && profile ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl p-1 sm:px-2 sm:py-1 bg-white/80 border border-border/60 hover:border-orange-500/50 transition-colors touch-manipulation"
              >
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-orange-500 font-bold text-[11px] sm:text-xs text-white">
                  {userInitial}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[90px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-orange-600 font-medium leading-tight">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-64 rounded-2xl bg-white/95 border border-gray-200 p-3 shadow-2xl backdrop-blur-2xl z-50 animate-slide-down">
                  <div className="px-2 py-1.5 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                    {profile.phone && (
                      <p className="text-[11px] text-gray-500">+91 {profile.phone}</p>
                    )}
                    {profile.email && (
                      <p className="text-[11px] text-gray-500 truncate">{profile.email}</p>
                    )}
                  </div>

                  <div className="pt-2 space-y-1">
                    {isPro ? (
                      <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50">
                        <span className="flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5 text-amber-600" /> Pro Member Active
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-800">₹49/mo</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setUpgradeOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5" /> Upgrade to Pro
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">₹49/mo</span>
                      </button>
                    )}

                    <Link
                      to="/app/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Profile & Settings
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" />
                    </Link>

                    <button
                      onClick={() => {
                        signOut();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not Authenticated: Responsive Sign In & Sign Up buttons */
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-gray-900 h-8 px-2 sm:px-2.5 rounded-xl"
              >
                <Link to="/auth/login" className="flex items-center gap-1">
                  <LogIn className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Sign </span>In
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-orange-500 hover:bg-orange-500 text-white text-[11px] sm:text-xs font-semibold h-8 px-2.5 sm:px-3 rounded-xl shadow-glow-primary"
              >
                <Link to="/auth/register" className="flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Sign </span>Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ProUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="full pro features" />
    </header>
  );
}
