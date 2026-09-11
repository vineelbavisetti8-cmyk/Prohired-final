import { NavLink } from "react-router-dom";
import {
  Compass,
  FileText,
  Briefcase,
  MessageSquare,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  {
    to: "/app/explore",
    label: "Explore",
    icon: Compass,
  },
  {
    to: "/app/resume/upload",
    label: "Resume",
    icon: FileText,
  },
  {
    to: "/app/jobs",
    label: "Jobs",
    icon: Briefcase,
  },
  {
    to: "/app/interview",
    label: "Interview",
    icon: MessageSquare,
  },
  {
    to: "/app/profile",
    label: "Profile",
    icon: User,
  },
];

export default function AppBottomNav({ className = "" }: { className?: string }) {
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro";

  return (
    <nav className={`fixed inset-x-0 bottom-0 z-40 glass-app-nav border-t border-gray-200 pb-safe-bottom select-none ${className}`}>
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {navItems.map((item) => {
          const isProfileTab = item.to === "/app/profile";

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center justify-center py-1 touch-manipulation transition-all duration-200 group ${
                  isActive
                    ? "text-orange-600 font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Glowing pill highlight on active */}
                  {isActive && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 shadow-[0_0_12px_rgba(240,86,43,0.6)] animate-fade-in" />
                  )}

                  <div className="relative">
                    <item.icon
                      className={`h-5 w-5 transition-transform duration-200 group-active:scale-90 ${
                        isActive ? "text-orange-600 scale-105" : "text-gray-500"
                      }`}
                    />

                    {isProfileTab && isPro && (
                      <span className="absolute -top-1 -right-2.5 text-[8px] font-bold px-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                        PRO
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-1 text-[10px] sm:text-[11px] tracking-tight truncate max-w-full text-center transition-colors ${
                      isActive ? "text-orange-600 font-bold" : "text-gray-500 font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
