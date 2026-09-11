import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

const ADMIN_NAME = "prohired@#+";
const ADMIN_PHONE = "9398845947";

export default function Login() {
  const nav = useNavigate();
  const { user, loading, signInWithEmail, signInWithPhone } = useAuth();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) nav("/app/dashboard", { replace: true });
  }, [user, loading, nav]);

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      const err = "Please enter a valid email address.";
      setError(err);
      toast.error(err);
      return;
    }

    if (!password) {
      const err = "Please enter your password.";
      setError(err);
      toast.error(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await signInWithEmail(email, password);
      setSubmitting(false);

      if (res.success) {
        toast.success("Welcome back! Signed in successfully.");
        nav("/app/dashboard", { replace: true });
      } else {
        setError(res.error || "Invalid email or password.");
        toast.error(res.error || "Sign in failed.");
      }
    } catch {
      setSubmitting(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const onPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");

    // Admin shortcut: exact name + phone match logs straight into the admin portal
    if (fullName.trim() === ADMIN_NAME && cleanPhone === ADMIN_PHONE) {
      Cookies.set("admin_session", btoa(`${ADMIN_NAME}:${Date.now()}`), {
        expires: 1 / 12,
        sameSite: "strict",
      });
      toast.success("Admin authenticated — opening dashboard");
      nav("/admin/dashboard", { replace: true });
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      const err = "Please enter your full name (at least 2 characters).";
      setError(err);
      toast.error(err);
      return;
    }

    if (cleanPhone.length < 10) {
      const err = "Please enter a valid 10-digit phone number.";
      setError(err);
      toast.error(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await signInWithPhone(fullName, phone);
      setSubmitting(false);

      if (res.success) {
        toast.success(`Welcome ${fullName.trim()}! Signed in successfully.`);
        nav("/app/dashboard", { replace: true });
      } else {
        setError(res.error || "Sign in failed. Please try again.");
        toast.error(res.error || "Sign in failed.");
      }
    } catch {
      setSubmitting(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Sign In to ProHired"
      subtitle="Access your AI career cockpit, resume intelligence, and live job updates."
    >
      <div className="space-y-5">
        {/* Google One-Click Sign In */}
        <GoogleAuthButton
          label="Continue with Google"
          onSuccess={() => nav("/app/dashboard", { replace: true })}
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Or continue with
          </span>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              authMethod === "email"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email & Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("phone");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              authMethod === "phone"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            <span>Instant Phone</span>
          </button>
        </div>

        {authMethod === "email" ? (
          /* Email & Password Form */
          <form onSubmit={onEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-orange-600" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-orange-600" /> Password
                </Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-xs uppercase tracking-wider font-bold gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-glow-primary rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* Phone Form */
          <form onSubmit={onPhoneSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold bg-orange-500/10 border border-orange-400/35 text-orange-600">
              <Sparkles className="h-4 w-4 shrink-0 text-orange-600 animate-pulse" />
              <span>⚡ Instant 1-Click Sign In — No Password or OTP Required!</span>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-orange-600" /> Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                autoFocus
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-orange-500" /> Mobile / Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 8297458070"
                required
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-xs uppercase tracking-wider font-bold gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-glow-primary rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In Instantly <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-gray-100 text-center text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Create an account
          </Link>
        </div>

        <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Your information is encrypted & kept 100% private.</span>
        </div>
      </div>
    </AuthShell>
  );
}
