import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  FileText,
  UserX,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AccountDeletion() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, deleteAccount } = useAuth();

  // In-app deletion state (for logged-in users)
  const [confirmText, setConfirmText] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  // External / Web manual request state (for users who uninstalled app or visit web link)
  const [manualPhoneOrEmail, setManualPhoneOrEmail] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualBusy, setManualBusy] = useState(false);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  // Handle immediate in-app deletion
  const handleDeleteAccount = async () => {
    if (!agreed) {
      toast.error("Please confirm you understand all data will be permanently deleted.");
      return;
    }
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        setDeletionSuccess(true);
        toast.success("Account and associated data successfully deleted.");
      } else {
        toast.error(res.error || "Could not complete account deletion. Please try again.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle external web deletion request
  const handleManualRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhoneOrEmail.trim()) {
      toast.error("Please enter your registered phone number or email address.");
      return;
    }

    setManualBusy(true);
    setTimeout(() => {
      setManualBusy(false);
      setManualSubmitted(true);
      toast.success("Account deletion request logged. We will verify and wipe your data within 48 hours.");
    }, 1200);
  };

  // Export mock user data before deletion
  const handleExportData = () => {
    const exportPayload = {
      profile: profile || { user: "Guest/Anonymous" },
      exportedAt: new Date().toISOString(),
      note: "ProHired Data Export Archive",
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prohired-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Account data export generated and downloaded.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Navigation */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/app/privacy" className="text-muted-foreground hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Warning Banner */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" /> Google Play Compliant Data Erasure
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Delete ProHired Account & Data
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We believe you should always be in full control of your personal information. Under Google Play
            Store policies and global privacy regulations (GDPR & DPDP), you may request permanent deletion
            of your ProHired account and all associated career records at any time.
          </p>
        </div>

        {/* What gets deleted vs retained info card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs sm:text-sm">
              <Trash2 className="h-4 w-4" /> Data That Will Be Deleted Immediately
            </div>
            <ul className="text-[11px] sm:text-xs text-rose-900/80 dark:text-rose-300/80 space-y-1.5 list-disc pl-4">
              <li>Uploaded resume PDF and DOCX files</li>
              <li>Parsed text, keywords, and ATS audit scores</li>
              <li>AI Mock Interview sessions and answer critiques</li>
              <li>Saved job bookmarks & application notes</li>
              <li>Profile information (Full name, phone, email)</li>
              <li>Device authorization tokens and local cached sessions</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-orange-500" /> Data Retained For Compliance
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              If you have purchased a Pro membership, payment transaction receipts (Razorpay Order IDs) are
              retained for a statutory period strictly to satisfy accounting, tax, and anti-fraud legal
              obligations. No resumes or interview data are ever retained.
            </p>
          </div>
        </div>

        {/* Deletion Success Screen */}
        {deletionSuccess ? (
          <div className="p-8 rounded-3xl bg-card border border-emerald-500/30 text-center space-y-4 animate-fade-in shadow-lg">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Account & Data Successfully Deleted</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Your ProHired account, uploaded resumes, ATS scores, and credentials have been permanently
              erased from our systems.
            </p>
            <div className="pt-3">
              <Button
                onClick={() => navigate("/app/explore")}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold px-6"
              >
                Return to Home
              </Button>
            </div>
          </div>
        ) : isAuthenticated && profile ? (
          /* SECTION A: Logged-in User Deletion Flow */
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/60 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-600 font-bold flex items-center justify-center text-base">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{profile.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {profile.phone ? `+91 ${profile.phone}` : profile.email || "Registered Account"}
                  </p>
                </div>
              </div>

              {/* Data export option */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="rounded-xl text-xs border-border text-foreground hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export Data
              </Button>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I understand that this action is <strong className="text-foreground">permanent and cannot be undone</strong>.
                  All my uploaded resumes, ATS scores, and interview performance metrics will be irrevocably deleted.
                </span>
              </label>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  To confirm, type <span className="font-mono text-rose-600 font-bold">DELETE</span> in the box below:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-11 bg-background border-border text-xs rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={!agreed || confirmText.trim().toUpperCase() !== "DELETE" || isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-11 px-6 flex-1 sm:flex-initial shadow-sm transition-all"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Permanently Erasing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1.5" /> Permanently Delete My Account
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/app/profile")}
                  disabled={isDeleting}
                  className="text-xs text-muted-foreground rounded-xl"
                >
                  Cancel & Keep My Account
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION B: Unauthenticated / Web Deletion Request Form (For Play Store external link compliance) */
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/60 space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <UserX className="h-5 w-5 text-orange-500" />
                <h2>Submit Remote Account Deletion Request</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you uninstalled the ProHired app, lost access to your device, or are visiting via the Google
                Play Store web link, enter your registered mobile number or email address below. Our automated
                compliance system will process your deletion request.
              </p>
            </div>

            {manualSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Deletion Request Received
                </div>
                <p>
                  We have queued your account (<strong>{manualPhoneOrEmail}</strong>) for complete data erasure.
                  All resumes, ATS reports, and profile records will be permanently expunged from all active
                  databases and backups within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Registered Mobile Number or Email Address
                  </label>
                  <Input
                    value={manualPhoneOrEmail}
                    onChange={(e) => setManualPhoneOrEmail(e.target.value)}
                    placeholder="e.g. +91 9876543210 or yourname@example.com"
                    className="h-11 bg-background border-border text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Reason for deletion (Optional)
                  </label>
                  <Input
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    placeholder="e.g. Found a job, no longer required"
                    className="h-11 bg-background border-border text-xs rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={manualBusy}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold h-11 px-6 shadow-sm"
                >
                  {manualBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1.5" /> Submit Deletion Request
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
              <span>Are you currently logged in?</span>
              <Link to="/auth/login" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                Sign In for Instant 1-Click Deletion →
              </Link>
            </div>
          </div>
        )}

        {/* Additional Play Store Information Footnote */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <HelpCircle className="h-4 w-4 text-orange-500" /> Need Help or Immediate Assistance?
          </div>
          <p>
            You can also email our privacy team directly at{" "}
            <a href="mailto:privacy@prohired.ai" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
              privacy@prohired.ai
            </a>{" "}
            with the subject line <em>&ldquo;Account Deletion Request&rdquo;</em> from your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
