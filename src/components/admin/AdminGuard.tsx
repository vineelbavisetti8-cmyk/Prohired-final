import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const session = Cookies.get("admin_session");
      
      if (!session) {
        setIsAuthorized(false);
        // Only redirect if we're not already on the login page
        if (!location.pathname.includes("/admin/login")) {
          navigate("/admin/login", { state: { from: location.pathname }, replace: true });
        }
        return;
      }

      // Refresh inactivity timer on valid session
      Cookies.set("admin_session", session, { 
        expires: 1/12, 
        sameSite: 'strict' 
      });
      setIsAuthorized(true);
    };

    checkAuth();

    // Activity listeners to reset the session timer
    const resetTimer = () => {
      const session = Cookies.get("admin_session");
      if (session) {
        Cookies.set("admin_session", session, { expires: 1/12, sameSite: 'strict' });
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Auto logout check every minute
    const interval = setInterval(() => {
      if (!Cookies.get("admin_session")) {
        setIsAuthorized(false);
        navigate("/admin/login");
      }
    }, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [navigate, location.pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default AdminGuard;
