import React from "react";
import { Bell, Menu, Search } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="h-16 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-[rgba(0,229,255,0.12)] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[#6B7280] hover:text-[#F0562B] transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#111827] font-syne hidden md:block">
          {title}
        </h2>
        <h2 className="text-lg font-bold text-[#111827] font-syne md:hidden absolute left-1/2 -translate-x-1/2">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] text-[#111827] rounded-full pl-10 pr-4 py-1.5 text-sm w-40 lg:w-64 focus:outline-none focus:border-[#F0562B] transition-all"
          />
        </div>
        <button className="relative p-2 text-[#6B7280] hover:text-[#F0562B] transition-colors bg-[#FFFFFF] rounded-full border border-[rgba(0,229,255,0.12)]">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#DC2626] rounded-full border border-[#FAF9F7]"></span>
        </button>
        <div className="h-10 w-10 rounded-full bg-[#F0562B]/10 border border-[rgba(0,229,255,0.2)] flex items-center justify-center text-[#F0562B] font-bold overflow-hidden cursor-pointer hover:border-[#F0562B]/50 transition-colors">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
            alt="Admin" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
