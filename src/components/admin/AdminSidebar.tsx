import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, CreditCard, FileText, Shield, 
  Megaphone, Ticket, Cpu, Settings, MessageSquare, 
  History, LogOut, ChevronLeft
} from "lucide-react";
import logo from "@/assets/prohired-logo.png";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";

const links = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: CreditCard, label: "Revenue", path: "/admin/revenue" },
  { icon: FileText, label: "Resumes", path: "/admin/resumes" },
  { icon: Shield, label: "Feature Control", path: "/admin/features" },
  { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
  { icon: Ticket, label: "Promo Codes", path: "/admin/promo-codes" },
  { icon: Cpu, label: "AI Monitor", path: "/admin/ai-usage" },
  { icon: Settings, label: "App Settings", path: "/admin/settings" },
  { icon: MessageSquare, label: "Feedback", path: "/admin/feedback" },
  { icon: History, label: "Audit Log", path: "/admin/audit-logs" },
];

interface AdminSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose, isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("admin_session");
    navigate("/admin/login");
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[rgba(0,229,255,0.12)] w-64">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ProHired" className="h-8 w-8 rounded-lg" />
          <div>
            <h1 className="text-[#111827] font-syne font-bold text-lg leading-tight">ProHired</h1>
            <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-[#F59E0B]/20">Admin</span>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827]">
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-[#F0562B]/10 text-[#F0562B] border-l-4 border-[#F0562B] rounded-l-none" 
                : "text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#111827]"
            )}
          >
            <link.icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110")} />
            <span className="font-medium text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-[rgba(0,229,255,0.12)]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-[#C2410C]/20 border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C] font-bold text-xs">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[#111827] text-xs font-bold truncate">Admin Portal</p>
            <p className="text-[#6B7280] text-[10px] truncate">prohired@gmail.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl transition-colors font-medium text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
