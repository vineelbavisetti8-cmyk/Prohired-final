import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPassword() {
  return (
    <AuthShell
      title="No Password Required!"
      subtitle="ProHired uses 1-click instant sign in with your Name and Phone number."
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10">
          <Sparkles className="h-8 w-8 text-orange-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">Forgot your password? No worries!</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            We've simplified authentication completely. You don't need any password or OTP — simply enter your Name & Phone Number on the sign-in page to log in instantly.
          </p>
        </div>

        <Button asChild className="w-full h-11 gap-2 uppercase tracking-wider font-bold text-xs bg-orange-500 hover:bg-orange-500 text-white rounded-xl shadow-glow-primary">
          <Link to="/auth/login">
            Go to Instant Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <div className="pt-2 text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% Seamless & Secure Instant Access</span>
        </div>
      </div>
    </AuthShell>
  );
}
