import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Briefcase,
  MessageSquare,
  User,
  Crown,
  Zap,
  ArrowRight,
  X,
  Compass,
  CheckCircle2,
} from "lucide-react";

interface AppSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSpotlight({ isOpen, onClose }: AppSpotlightProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "scan",
      title: "Scan & Analyze Resume",
      subtitle: "Instant 100-point ATS score & keyword match breakdown",
      to: "/app/resume/upload",
      icon: FileText,
      badge: "Fast AI",
    },
    {
      id: "jobs",
      title: "Explore Daily AI Job Matches",
      subtitle: "Browse 90%+ match roles at top tech companies",
      to: "/app/jobs",
      icon: Briefcase,
      badge: "12 New",
    },
    {
      id: "interview",
      title: "Start AI Mock Interview Simulator",
      subtitle: "Practice STAR questions with instant AI feedback",
      to: "/app/interview",
      icon: MessageSquare,
      badge: "Interactive",
    },
    {
      id: "builder",
      title: "Launch AI Resume Builder",
      subtitle: "Edit sections with real-time ATS optimization suggestions",
      to: "/app/resume/upload",
      icon: Zap,
      badge: "Editor",
    },
    {
      id: "pro",
      title: "Pro Membership & Credits Refill",
      subtitle: "Unlimited resume scans, recruiter insights & priority matching",
      to: "/app/profile",
      icon: Crown,
      badge: "Upgrade",
    },
    {
      id: "explore",
      title: "Career Cockpit & Discovery Hub",
      subtitle: "Overview, how it works, features & career metrics",
      to: "/app/explore",
      icon: Compass,
      badge: "Home",
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-white/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-slide-down">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200">
          <Search className="h-5 w-5 text-orange-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search screens, tools, actions... (e.g. ATS, Interview, Jobs)"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick List */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={() => handleSelect(action.to)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-500/10 hover:border-orange-400/40 border border-transparent text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-400/30 text-orange-600 group-hover:scale-105 transition-transform shrink-0">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-orange-500">
                      {action.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {action.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-300">
                    {action.badge}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-white/60 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400">
          <span>Navigate with 1-click shortcuts</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
