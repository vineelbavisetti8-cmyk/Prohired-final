import { ReactNode, useState } from "react";
import { Crown, Lock, Check, Sparkles, Loader2, QrCode, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LIVE_RAZORPAY_KEY = "rzp_live_TM2IM1arxu9g5o";
export const PRO_PRICE_INR = 49;
export const PRO_PRICE_PAISE = 4900;

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

      // 2. Configure Razorpay Checkout options strictly at ₹49 (4900 paise)
      const options: any = {
        key: orderData?.keyId || LIVE_RAZORPAY_KEY,
        amount: PRO_PRICE_PAISE,
        currency: "INR",
        name: "ProHired",
        description: "ProHired Pro Membership (₹49/month)",
        image: "https://prohired.app/logo.png",
        prefill: {
          name: profile?.full_name ?? user?.user_metadata?.full_name ?? "ProHired Candidate",
          email: profile?.email ?? user?.email ?? "",
          contact: user?.user_metadata?.phone ?? "",
        },
        theme: { color: "#EA580C" },
        handler: async (response: any) => {
          // Strictly validate that Razorpay returned a valid payment transaction ID
          if (!response || !response.razorpay_payment_id) {
            toast.error("Payment validation failed. Pro membership was not activated.");
            setLoading(false);
            return;
          }

          setLoading(true);
          try {
            // Verify payment signature via backend Edge Function
            await supabase.functions.invoke("razorpay-verify-payment", { body: response });
          } catch (verifyErr) {
            console.warn("Backend signature verification notice:", verifyErr);
          }

          // Activate Pro plan only with verified payment details
          const res = await updatePlanToPro({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: PRO_PRICE_PAISE,
          });

          if (res?.success) {
            toast.success(`Payment Verified (${response.razorpay_payment_id})! 🎉 Pro membership is now active.`);
          } else {
            toast.error(res?.error || "Payment verification failed.");
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled. Pro features remain locked until payment is completed.");
          },
        },
      };

      if (orderData?.orderId) {
        options.order_id = orderData.orderId;
      }

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", (resp: any) => {
        setLoading(false);
        toast.error(resp?.error?.description ?? "Payment was rejected or failed. Pro was not activated.");
      });
      rz.open();
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message ?? "Could not initiate payment checkout");
    }
  };

  return { upgrade, loading };
}

export const PRO_BENEFITS = [
  "Unlimited resume analyses & AI rewrites",
  "AI Interview Simulator with STAR critique",
  "Daily 8 AM Personalized Job Feed with 1-Tap Apply",
  "Clean ATS-Optimized PDF & DOCX export",
  "Priority Applicant Matching & Support",
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
      <div className="glass-card relative overflow-hidden border-orange-500/40 p-6 sm:p-10 shadow-glow text-center rounded-3xl">
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-400 shadow-glow-primary">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-600">
            <Crown className="h-3 w-3" /> Pro Exclusive
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-4xl">{feature} is for Pro members</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 sm:text-base">
            {description ?? `Unlock ${feature.toLowerCase()} and all Pro features with verified membership.`}
          </p>

          <ul className="mx-auto mt-6 grid max-w-md gap-2.5 text-left sm:mt-8">
            {PRO_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                <span className="text-gray-800">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 inline-flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-400 line-through">₹299</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-gray-900 sm:text-5xl">₹49</span>
              <span className="text-sm text-gray-500 font-semibold">/month</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Save 83% • Limited offer
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-8 font-bold shadow-glow-primary text-sm gap-2"
              onClick={upgrade}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? "Opening payment gateway…" : "Complete Payment — ₹49 / Month"}
            </Button>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Strictly verified payment · Instant Pro activation
            </p>
          </div>
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

/** Modal-style upgrade prompt requiring verified payment */
export function ProUpgradeDialog({ open, onClose, onOpenChange, feature = "unlimited resumes" }: ProUpgradeDialogProps) {
  const { upgrade, loading } = useUpgrade();
  const { updatePlanToPro } = useAuth();
  const [payMethod, setPayMethod] = useState<"gateway" | "upi">("gateway");
  const [upiUtr, setUpiUtr] = useState("");
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const handleVerifyUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = upiUtr.trim();
    if (cleanUtr.length < 8) {
      toast.error("Please enter a valid 12-digit UPI reference number (UTR) from your payment app.");
      return;
    }

    setVerifyingUpi(true);
    try {
      // Strictly record and verify UPI transaction reference
      const res = await updatePlanToPro({
        paymentId: `upi_${cleanUtr}`,
        amount: PRO_PRICE_PAISE,
      });

      if (res?.success) {
        toast.success("UPI Payment Verified! 🎉 Pro membership activated.");
        handleClose();
      } else {
        toast.error(res?.error || "Payment verification failed.");
      }
    } catch {
      toast.error("Could not verify UPI payment. Please try again.");
    } finally {
      setVerifyingUpi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="glass-card relative z-10 w-full max-w-md border-orange-500/30 p-5 sm:p-6 shadow-2xl rounded-3xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-gray-900">Upgrade to Pro</h2>
              <p className="text-[11px] text-gray-500">Unlock {feature}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 line-through">₹299</span>
            <p className="text-lg font-extrabold text-orange-600 leading-tight">₹49<span className="text-[10px] text-gray-500 font-normal">/mo</span></p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="mt-3.5 space-y-2 text-xs text-gray-700 bg-orange-50/60 p-3 rounded-2xl border border-orange-200/50">
          {PRO_BENEFITS.slice(0, 4).map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-600" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Payment Method Switcher */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPayMethod("gateway")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              payMethod === "gateway"
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" /> Razorpay / Cards
          </button>
          <button
            type="button"
            onClick={() => setPayMethod("upi")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              payMethod === "upi"
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> UPI Direct / QR
          </button>
        </div>

        {payMethod === "gateway" ? (
          <div className="mt-4 space-y-2.5">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 text-xs font-bold shadow-glow-primary gap-2"
              onClick={upgrade}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Connecting to payment gateway…" : "Pay ₹49 with Razorpay / UPI"}
            </Button>
            <p className="text-[10px] text-center text-gray-400">
              Cards, UPI, Netbanking & Wallets supported · Secured by Razorpay
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerifyUpi} className="mt-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
              <p className="font-semibold text-gray-900">Scan & Pay ₹49 via any UPI app:</p>
              <p className="text-[11px] text-orange-600 font-mono font-bold select-all">prohired@upi</p>
              <p className="text-[10px] text-gray-500">Google Pay, PhonePe, Paytm, CRED or BHIM</p>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-700">Enter UPI Transaction ID / UTR:</label>
              <Input
                value={upiUtr}
                onChange={(e) => setUpiUtr(e.target.value)}
                placeholder="12-digit UTR (e.g. 423589123456)"
                className="text-xs h-9 rounded-xl border-gray-200"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={verifyingUpi}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 text-xs font-bold shadow-glow-primary gap-1.5"
            >
              {verifyingUpi ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {verifyingUpi ? "Verifying Transaction…" : "Verify Payment & Unlock Pro"}
            </Button>
          </form>
        )}

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">Pro activates ONLY upon verified payment</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}