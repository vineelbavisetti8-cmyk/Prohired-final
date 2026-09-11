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
      title="Create Your Account"
      subtitle="Join thousands of ambitious professionals elevating their careers with ProHired AI."
    >
      <div className="space-y-5">
        {/* Google One-Click Sign Up */}
        <GoogleAuthButton
          label="Sign up with Google"
          onSuccess={() => nav("/app/dashboard", { replace: true })}
        />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Or register with
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
          /* Email & Password Registration Form */
          <form onSubmit={onEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="regFullName"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-orange-600" /> Full Name
              </Label>
              <Input
                id="regFullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                autoFocus
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="regEmail"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-orange-600" /> Email Address
              </Label>
              <Input
                id="regEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                required
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="regPassword"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-orange-600" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
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
          <form onSubmit={onPhoneSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold bg-orange-500/10 border border-orange-400/35 text-orange-600">
              <Sparkles className="h-4 w-4 shrink-0 text-orange-600 animate-pulse" />
              <span>⚡ Instant 1-Click Setup — No Password or OTP Required!</span>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phoneFullName"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-orange-600" /> Full Name
              </Label>
              <Input
                id="phoneFullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                autoFocus
                className="h-11 border-gray-200 bg-white/80 text-gray-900 focus-visible:ring-orange-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phoneInput"
                className="text-xs uppercase font-semibold text-gray-600 tracking-wider flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-orange-500" /> Mobile / Phone Number
              </Label>
              <Input
                id="phoneInput"
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

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-gray-100 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Sign in
          </Link>
        </div>

        <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Free access • Instant setup • No credit card required.</span>
        </div>
      </div>
    </AuthShell>
  );
}
