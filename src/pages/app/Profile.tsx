import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Crown,
  Sparkles,
  CheckCircle2,
  Zap,
  Flame,
  Shield,
  Phone,
  Mail,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Check,
  LogIn,
  UserPlus,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";

const SUB_TABS: SubNavTab[] = [
  { id: "account", label: "My Account", icon: User },
  { id: "pro", label: "Membership & Plan", icon: Crown },
  { id: "settings", label: "Preferences", icon: Sparkles },
];

export default function Profile() {
  const {
    user,
    profile,
    isAuthenticated,
    togglePlan,
    signInWithPhone,
    updateProfileName,
    signOut,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("account");

  // Inline auth form state for guest users
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // Authenticated edit state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const isPro = profile?.plan === "pro";

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone.trim() || authPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!authName.trim() || authName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    setAuthBusy(true);
    const res = await signInWithPhone(authName.trim(), authPhone.trim());
    setAuthBusy(false);

    if (res.success) {
      toast.success(`Welcome to ProHired, ${authName.trim()}!`);
    } else {
      toast.error(res.error || "Authentication failed. Please check your credentials.");
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    await updateProfileName(fullName);
    toast.success("Profile name updated successfully!");
  };

  const userInitial = profile?.full_name?.charAt(0).toUpperCase() || "U";
  const userPhone = profile?.phone ? `+91 ${profile.phone}` : null;
  const userEmail = profile?.email || null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-App Navigation */}
      <AppSubNav
        tabs={SUB_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="max-w-4xl mx-auto w-full px-4 py-5 sm:py-7 space-y-6">
        {/* TAB 1: MY ACCOUNT */}
        {activeTab === "account" && (
          <div className="space-y-6 animate-fade-in">
            {isAuthenticated && profile ? (
              /* Signed-in Real Account View */
              <>
                <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-orange-400/40">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-300 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
                        {userInitial}
                      </div>
                      {isPro && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-gray-900 font-black text-xs shadow-md">
                          ★
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                          {profile.full_name}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPro
                            ? "bg-amber-100 text-amber-700 border-amber-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                        >
                          {isPro ? "PRO MEMBER" : "FREE PLAN"}
                        </span>
                      </div>
                      {userPhone && (
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-orange-600" /> {userPhone}
                        </p>
                      )}
                      {userEmail && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> {userEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={togglePlan}
                      className={`flex-1 sm:flex-initial rounded-xl text-xs font-semibold ${isPro
                        ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 shadow-glow-amber"
                        }`}
                    >
                      {isPro ? "✓ Pro Member" : "Upgrade to Pro"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={signOut}
                      className="border-gray-200 text-gray-600 hover:text-rose-600 hover:bg-rose-50 text-xs rounded-xl transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
                    </Button>
                  </div>
                </div>

                {/* Edit Details */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-foreground">Edit Profile Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Your Full Name</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your real name"
                        className="bg-white border-gray-200 text-xs sm:text-sm text-foreground rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Registered Phone</label>
                      <Input
                        disabled
                        value={userPhone || "Not set"}
                        className="bg-gray-50/70 border-gray-200 text-xs sm:text-sm text-gray-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-orange-500 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold px-5 shadow-glow-primary"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Unauthenticated / Guest View with Sign In and Sign Up Options */
              <div className="space-y-6">
                {/* Guest Banner */}
                <div className="rounded-3xl border border-orange-400/40 bg-gradient-to-br from-orange-100/40 via-white/90 to-gray-50 p-6 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                    <Lock className="h-3.5 w-3.5" /> Guest Mode
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Sign in to Save Your Resumes & Track Applications
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                    You are currently using ProHired without an account. Sign in or create a free account to sync your ATS analysis across devices, bookmark openings, and save interview feedback.
                  </p>
                </div>

                {/* Inline Quick Sign In / Sign Up Form */}
                <div className="glass-card p-6 rounded-2xl max-w-md mx-auto space-y-5">
                  {/* Mode Toggle */}
                  <div className="flex rounded-xl bg-white p-1 border border-gray-200">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode === "login"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <LogIn className="h-3.5 w-3.5" /> Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode === "signup"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Create Account
                    </button>
                  </div>

                  <form onSubmit={handleInlineAuth} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Your Full Name</label>
                      <Input
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Vineel Bavisetti"
                        className="bg-white border-gray-200 text-xs text-foreground rounded-xl h-10"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">10-Digit Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 shrink-0">
                          +91
                        </div>
                        <Input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="8297458070"
                          maxLength={10}
                          className="bg-white border-gray-200 text-xs text-foreground rounded-xl h-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={authBusy}
                      className="w-full bg-orange-500 hover:bg-orange-500 text-white rounded-xl h-11 text-xs font-semibold shadow-glow-primary"
                    >
                      {authBusy ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Authenticating...
                        </>
                      ) : authMode === "login" ? (
                        "Sign In Instantly"
                      ) : (
                        "Create Free Account"
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-[11px] text-gray-500">
                      Or use dedicated login screens:
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <Link to="/auth/login" className="text-orange-600 hover:underline font-semibold">
                        Full Sign In Page →
                      </Link>
                      <Link to="/auth/register" className="text-orange-600 hover:underline font-semibold">
                        Full Register Page →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEMBERSHIP & PLAN */}
        {activeTab === "pro" && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-6 rounded-3xl border transition-all ${isPro
              ? "bg-gradient-to-r from-amber-100/40 via-white to-gray-50 border-amber-300 shadow-glow-amber"
              : "glass-card border-gray-200"
              }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-700" />
                    <h3 className="text-lg font-bold text-foreground">
                      {isPro ? "ProHired Pro Membership Active" : "ProHired Starter Free"}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isPro
                      ? "You have full access to unlimited ATS scans, AI Mock Interview simulations, and priority matching."
                      : "Upgrade to Pro to unlock unlimited resume scans and mock interview evaluations."}
                  </p>
                </div>

                <Button
                  onClick={togglePlan}
                  className={`rounded-xl text-xs font-bold shrink-0 ${isPro
                    ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 hover:from-amber-400 hover:to-amber-500 shadow-glow-amber"
                    }`}
                >
                  {isPro ? "✓ Pro Active (Click to toggle Free)" : "Switch to Pro"}
                </Button>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-foreground">Feature Breakdown</h4>
              <div className="space-y-2 text-xs">
                {[
                  { feature: "ATS Resume Scans", free: "1 scan included", pro: "Unlimited scans" },
                  { feature: "AI Mock Interview Practice", free: "Standard session", pro: "Unlimited practice with detailed STAR critique" },
                  { feature: "1-Click Resume Tailoring", free: "Standard", pro: "Unlimited tailored versions" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-200 gap-2"
                  >
                    <span className="text-gray-800 font-semibold text-xs">{row.feature}</span>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 text-[11px] pt-1.5 sm:pt-0 border-t border-gray-200 sm:border-0">
                      <span className="text-gray-500 sm:w-28 sm:text-right">Free: {row.free}</span>
                      <span className="text-amber-700 font-bold sm:w-36 sm:text-right">Pro: {row.pro}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREFERENCES */}
        {activeTab === "settings" && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-foreground">ProHired Appearance</h3>
              <p className="text-xs text-gray-500">
                Current theme is optimized for high-contrast readability and focus.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-orange-500/50 bg-orange-500/10 text-center space-y-1">
                  <Moon className="h-5 w-5 text-orange-600 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Modern Slate (Active)</p>
                  <p className="text-[10px] text-gray-500">Default ProHired dark palette</p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 text-center space-y-1 opacity-70">
                  <Sun className="h-5 w-5 text-gray-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">Light Clean</p>
                  <p className="text-[10px] text-gray-400">Daytime light mode</p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 text-center space-y-1 opacity-70">
                  <Laptop className="h-5 w-5 text-gray-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">System Match</p>
                  <p className="text-[10px] text-gray-400">Auto match OS</p>
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">Account Session</p>
                  <p className="text-[11px] text-gray-500">Sign out of this device.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="border-gray-200 text-gray-600 hover:text-gray-800 text-xs rounded-xl"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
