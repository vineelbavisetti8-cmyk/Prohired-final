import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { user, loading, signUpWithEmail, signInWithPhone } = useAuth();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  // Email form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone form state
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) nav("/app/dashboard", { replace: true });
  }, [user, loading, nav]);

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      const err = "Please enter your full name (at least 2 characters).";
      setError(err);
      toast.error(err);
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      const err = "Please enter a valid email address.";
      setError(err);
      toast.error(err);
      return;
    }

    if (password.length < 6) {
      const err = "Password must be at least 6 characters long.";
      setError(err);
      toast.error(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await signUpWithEmail(email, password, fullName);
      setSubmitting(false);

      if (res.success) {
        if (res.requiresEmailVerification) {
          toast.success("Account created! Please check your email to verify your account.");
          nav("/auth/login");
        } else {
          toast.success(`Welcome to ProHired, ${fullName.trim()}!`);
          nav("/app/dashboard", { replace: true });
        }
      } else {
        setError(res.error || "Failed to create account. Please try again.");
        toast.error(res.error || "Sign up failed.");
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
        toast.success(`Welcome to ProHired, ${fullName.trim()}!`);
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
      title="Create Account"
      subtitle="Join ambitious professionals elevating their careers with ProHired AI."
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Google One-Click Sign Up */}
        <GoogleAuthButton
          label="Sign up with Google"
          onSuccess={() => nav("/app/dashboard", { replace: true })}
        />

        {/* Crisp Divider */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Or register with
          </span>
        </div>

        {/* Mobile Responsive Auth Method Switcher Tabs */}
        <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 border border-gray-200/80">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 xs:gap-2 rounded-lg py-2.5 px-2 text-xs font-bold transition-all ${
              authMethod === "email"
                ? "bg-white text-gray-900 shadow-xs ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="truncate">Email & Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("phone");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 xs:gap-2 rounded-lg py-2.5 px-2 text-xs font-bold transition-all ${
              authMethod === "phone"
                ? "bg-white text-gray-900 shadow-xs ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="truncate">Instant Phone</span>
          </button>
        </div>

        {authMethod === "email" ? (
          /* Email & Password Registration Form */
          <form onSubmit={onEmailSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="regFullName"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-orange-500" /> Full Name
              </Label>
              <Input
                id="regFullName"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                className="h-12 border-gray-200 bg-white/90 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="regEmail"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-orange-500" /> Email Address
              </Label>
              <Input
                id="regEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="h-12 border-gray-200 bg-white/90 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="regPassword"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-orange-500" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="h-12 pr-12 border-gray-200 bg-white/90 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-700 active:scale-95 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold uppercase tracking-wider gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-glow-primary rounded-xl transition-all"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Creating Account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* Phone Registration Form */
          <form onSubmit={onPhoneSubmit} className="space-y-3.5 sm:space-y-4">
            {/* Compact Mobile Banner */}
            <div className="flex items-center gap-2.5 rounded-xl p-3 text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-700">
              <Sparkles className="h-4 w-4 shrink-0 text-orange-600 animate-pulse" />
              <div className="leading-tight">
                <span className="font-bold">⚡ 1-Click Instant Setup</span>
                <span className="block text-[11px] font-normal text-orange-600/90">
                  No password or OTP required. Get instant access with phone.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phoneFullName"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-orange-500" /> Full Name
              </Label>
              <Input
                id="phoneFullName"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                className="h-12 border-gray-200 bg-white/90 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phoneInput"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-orange-500" /> Mobile Number
              </Label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-gray-500 pointer-events-none border-r border-gray-200 pr-2">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <Input
                  id="phoneInput"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="h-12 pl-20 border-gray-200 bg-white/90 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 rounded-xl"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold uppercase tracking-wider gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-glow-primary rounded-xl transition-all"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Creating Account…
                </>
              ) : (
                <>
                  Get Started Instantly <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Switch to Login */}
        <div className="pt-3 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-block py-1"
          >
            Sign in
          </Link>
        </div>

        {/* Security & Features Badge */}
        <div className="text-center text-[11px] sm:text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Free access • Instant setup • No credit card required.</span>
        </div>
      </div>
    </AuthShell>
  );
}
