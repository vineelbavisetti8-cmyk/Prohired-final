import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Map routes to titles
  const getPageTitle = (path: string) => {
    const parts = path.split("/");
    const lastPart = parts[parts.length - 1];
    switch (lastPart) {
      case "dashboard": return "Dashboard Overview";
      case "users": return "User Management";
      case "revenue": return "Revenue & Payments";
      case "resumes": return "Resume Management";
      case "features": return "Feature Control";
      case "announcements": return "Announcements";
      case "promo": return "Promo Codes";
      case "ai": return "AI Usage Monitor";
      case "settings": return "App Settings";
      case "feedback": return "User Feedback";
      case "audit": return "Audit Log";
      default: return "Admin Portal";
    }
  };

  const title = getPageTitle(location.pathname);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex text-[#111827] font-sans">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 h-screen overflow-hidden">
        <AdminSidebar />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#FAF9F7]/80 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] w-64 bg-[#FFFFFF] transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar isMobile onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <AdminHeader title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>

        <footer className="p-4 md:px-8 border-t border-[rgba(0,229,255,0.05)] text-center">
          <p className="text-[#6B7280] text-[10px] uppercase tracking-widest font-bold">
            ProHired Admin Console &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
