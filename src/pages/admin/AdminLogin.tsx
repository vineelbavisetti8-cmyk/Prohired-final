import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/prohired-logo.png";
import Cookies from "js-cookie";

const ADMIN_NAME = "prohired@#+";
const ADMIN_PHONE = "9398845947";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Direct credential check — name + phone
    if (email.trim() === ADMIN_NAME && password.replace(/\D/g, "") === ADMIN_PHONE) {
      Cookies.set("admin_session", btoa(`${ADMIN_NAME}:${Date.now()}`), {
        expires: 1 / 12, // 2 hours
        sameSite: "strict",
      });
      toast.success("Admin authenticated successfully");
      navigate("/admin/dashboard");
      return;
    }

    toast.error("Invalid admin credentials");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] rounded-2xl overflow-hidden shadow-2xl">
        <CardHeader className="pt-8 flex flex-col items-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[#F0562B]/20 blur-xl rounded-full"></div>
            <img src={logo} alt="ProHired Logo" className="h-14 w-14 rounded-xl relative z-10 border border-[rgba(0,229,255,0.2)]" />
          </div>
          <div className="bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3 border border-[#F59E0B]/20">
            Admin Portal
          </div>
          <CardTitle className="text-2xl font-bold text-[#111827] font-syne tracking-tight">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-10 pt-2 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#6B7280] ml-1">Admin Name</label>
              <Input
                type="text"
                placeholder="Admin name"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#F5F6F8] border-[rgba(0,229,255,0.12)] text-[#111827] focus:ring-[#F0562B]/50 focus:border-[#F0562B] h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#6B7280] ml-1">Phone Number</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Phone number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.12)] text-[#111827] focus:ring-[#F0562B]/50 focus:border-[#F0562B] h-12 pr-10 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F0562B] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#F0562B] hover:bg-[#F0562B]/90 text-[#FAF9F7] font-bold text-base transition-all active:scale-[0.98] rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
