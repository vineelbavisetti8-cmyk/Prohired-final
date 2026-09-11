import { ReactNode, useState } from "react";
import { Crown, Lock, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LIVE_RAZORPAY_KEY = "rzp_live_TM2IM1arxu9g5o";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function useUpgrade() {
  const { profile, user, updatePlanToPro } = useAuth();
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");

      let orderData: { orderId?: string; keyId?: string; amount?: number; currency?: string } | null = null;

      // 1. Try backend order creation if available
      try {
        const { data, error } = await supabase.functions.invoke("razorpay-create-order");
        if (!error && data?.orderId) {
          orderData = data;
        }
      } catch {
        // Fallback to client-side Razorpay order
      }

      // 2. Configure Razorpay Checkout options
      const options: any = {
        key: orderData?.keyId || LIVE_RAZORPAY_KEY,
        amount: orderData?.amount || 1900, // ₹19 in paise
        currency: orderData?.currency || "INR",
        name: "ProHired",
        description: "ProHired Pro Membership",
        image: "https://prohired.app/logo.png",
        prefill: {
          name: profile?.full_name ?? user?.user_metadata?.full_name ?? "ProHired Candidate",
          email: profile?.email ?? user?.email ?? "",
          contact: user?.user_metadata?.phone ?? "",
        },
        theme: { color: "#C9A84C" },
        handler: async (response: any) => {
          setLoading(true);
          try {
            // Verify backend if available
            await supabase.functions.invoke("razorpay-verify-payment", { body: response });
          } catch {
            // Client verification fallback
          }

          // Activate Pro plan instantly
          await updatePlanToPro();
          toast.success("Welcome to Pro! 🎉 Pro subscription active.");
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if (orderData?.orderId) {
        options.order_id = orderData.orderId;
      }

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", (resp: any) => {
        setLoading(false);
        toast.error(resp?.error?.description ?? "Payment cancelled or failed");
      });
      rz.open();
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message ?? "Could not start checkout");
    }
  };

  return { upgrade, loading };
}

const PRO_BENEFITS = [
  "Unlimited resume analyses & rewrites",
  "AI Interview prep — 10 Qs per role",
  "Live job feed with one-tap apply",
  "PDF & DOCX resume export",
  "Priority support",
];

interface ProGateProps {
  feature: string;
  description?: string;
  children: ReactNode;
}

export default function ProGate({ feature, description, children }: ProGateProps) {
  const { profile, loading: authLoading } = useAuth();
  const { upgrade, loading } = useUpgrade();

  if (authLoading) return null;
  if (profile?.plan === "pro") return <>{children}</>;

  return (
    <div className="container max-w-2xl px-4 py-10 md:py-16">
      <div className="glass-card relative overflow-hidden border-primary/40 p-6 sm:p-10 shadow-glow text-center">
        <div className="orb left-1/2 top-0 h-72 w-72 -translate-x-1/2" style={{ background: "var(--gradient-orb-1)" }} />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold">
            <Crown className="h-3 w-3" /> Pro feature
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-4xl">{feature} is for Pro members</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {description ?? `Unlock ${feature.toLowerCase()} and every Pro feature for less than a coffee a month.`}
          </p>

          <ul className="mx-auto mt-6 grid max-w-md gap-2.5 text-left sm:mt-8">
            {PRO_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 inline-flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-muted-foreground line-through">₹299</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold gradient-text sm:text-5xl">₹19</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>

          <Button variant="hero" size="xl" className="mt-6 w-full sm:w-auto" onClick={upgrade} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Starting checkout…" : "Upgrade to Pro — ₹19"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">Cancel anytime · 7-day refund · Razorpay secured</p>
        </div>
      </div>
    </div>
  );
}

interface ProUpgradeDialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  feature?: string;
}

/** Modal-style upgrade prompt for inline-blocking (e.g. Apply Now on free). */
export function ProUpgradeDialog({ open, onClose, onOpenChange, feature = "unlimited resumes" }: ProUpgradeDialogProps) {
  const { upgrade, loading } = useUpgrade();
  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="glass-card relative z-10 w-full max-w-md border-primary/40 p-6 shadow-glow sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
          <Crown className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold sm:text-2xl">Upgrade to unlock {feature}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Get the full Pro experience — only ₹19/month, cancel anytime.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {PRO_BENEFITS.slice(0, 4).map((b) => (
            <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{b}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="hero" size="lg" className="flex-1 h-12" onClick={upgrade} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Upgrade — ₹19
          </Button>
          <Button variant="ghost" size="lg" className="h-12" onClick={handleClose}>Maybe later</Button>
        </div>
      </div>
    </div>
  );
}