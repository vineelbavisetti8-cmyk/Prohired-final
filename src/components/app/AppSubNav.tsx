import { LucideIcon } from "lucide-react";

export interface SubNavTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface AppSubNavProps {
  tabs: SubNavTab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  sticky?: boolean;
}

export default function AppSubNav({ tabs, activeTab, onChange, className = "", sticky = false }: AppSubNavProps) {
  return (
    <div
      className={`w-full border-b border-border/60 bg-white px-3 sm:px-6 py-2 select-none z-10 ${
        sticky ? "sticky top-14 sm:top-16 shadow-xs z-30" : "relative"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-mobile max-w-full pb-1 -mb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 touch-manipulation min-h-[38px] ${
                isActive
                  ? "bg-orange-50 text-orange-700 border border-orange-200 shadow-sm font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent"
              }`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? "text-orange-600" : "text-gray-500"}`} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    isActive
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
