import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  EyeOff,
  Trash2,
  ArrowLeft,
  FileText,
  Mail,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { id: "overview", title: "1. Overview & Scope" },
  { id: "data-collected", title: "2. Information We Collect" },
  { id: "data-usage", title: "3. How We Use Information" },
  { id: "ai-processing", title: "4. AI Resume & Interview Processing" },
  { id: "storage-security", title: "5. Storage, Security & Encryption" },
  { id: "third-parties", title: "6. Third-Party Service Providers" },
  { id: "permissions", title: "7. Device & App Permissions" },
  { id: "user-rights", title: "8. Your Rights & Data Portability" },
  { id: "retention-deletion", title: "9. Data Retention & Deletion" },
  { id: "contact", title: "10. Contact & Grievance Officer" },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Banner */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Last updated: September 2026
            </span>
            <Link to="/app/delete-account">
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Account Deletion
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title & Highlights Header */}
        <div className="space-y-6 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" /> Google Play & DPDP Compliant Policy
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            ProHired Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            At <strong>ProHired</strong>, we respect your privacy and are committed to protecting
            the personal data and career documents you entrust with us. This Privacy Policy outlines
            how we collect, use, store, and safeguard your information across the ProHired mobile
            app and web services.
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 flex flex-col gap-1.5 shadow-xs">
              <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-bold text-foreground">Encrypted Storage</p>
              <p className="text-[11px] text-muted-foreground">TLS in transit & AES-256 at rest</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 flex flex-col gap-1.5 shadow-xs">
              <EyeOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-bold text-foreground">Zero Data Selling</p>
              <p className="text-[11px] text-muted-foreground">We never sell your resume or data</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 flex flex-col gap-1.5 shadow-xs">
              <Trash2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-bold text-foreground">Complete Deletion</p>
              <p className="text-[11px] text-muted-foreground">Permanent self-serve data wipe</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 flex flex-col gap-1.5 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-bold text-foreground">User In Control</p>
              <p className="text-[11px] text-muted-foreground">Export or edit data anytime</p>
            </div>
          </div>
        </div>

        {/* Layout: Sticky Quick Jump + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Jump Sidebar (Hidden on small screens) */}
          <div className="hidden lg:block col-span-1">
            <div className="sticky top-20 space-y-1 p-3 rounded-2xl bg-card border border-border/50">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Contents
              </p>
              <nav className="space-y-0.5 text-xs">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="col-span-1 lg:col-span-3 space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {/* Section 1 */}
            <section id="overview" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <FileText className="h-5 w-5 text-orange-500" />
                <h2>1. Overview & Scope</h2>
              </div>
              <p>
                ProHired operates an AI-assisted career enablement platform providing resume ATS analysis,
                intelligent resume builders, mock interview simulations, and job recommendations.
                This Privacy Policy applies to all users of the ProHired Android mobile application
                (distributed via the Google Play Store) and the associated web portal.
              </p>
              <p>
                By accessing or using ProHired, you consent to the collection, processing, and storage
                of your information in accordance with this policy and applicable data privacy
                statutes (including the India Digital Personal Data Protection Act 2023, EU GDPR,
                and California Consumer Privacy Act CCPA).
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Database className="h-5 w-5 text-orange-500" />
                <h2>2. Information We Collect</h2>
              </div>
              <p>We only collect information necessary to provide and enhance our career intelligence tools:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account Identification:</strong> Full name,
                  mobile phone number, email address, and authentication credentials (or Google OAuth profile tokens).
                </li>
                <li>
                  <strong className="text-foreground">Resume & Career Documents:</strong> Uploaded PDF/Word
                  resumes, extracted text, employment history, skills, education credentials, project portfolios,
                  and target job titles.
                </li>
                <li>
                  <strong className="text-foreground">Interview Performance Data:</strong> Questions answered,
                  spoken/transcribed audio responses during mock interview sessions, and STAR behavioral evaluations.
                </li>
                <li>
                  <strong className="text-foreground">Usage & Device Telemetry:</strong> Device model, OS
                  version, anonymous performance metrics, crash logs, and network connection status to ensure
                  seamless app operation.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="data-usage" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <h2>3. How We Use Your Information</h2>
              </div>
              <p>Your data is used strictly for the following functional purposes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <p className="font-semibold text-foreground text-xs">ATS Resume Scoring</p>
                  <p className="text-[11px]">Benchmarking your resume against recruiter systems and highlighting keywords.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <p className="font-semibold text-foreground text-xs">AI Mock Interview Feedback</p>
                  <p className="text-[11px]">Evaluating your verbal and technical answers to simulate realistic hiring panels.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <p className="font-semibold text-foreground text-xs">Personalized Job Matching</p>
                  <p className="text-[11px]">Presenting openings aligned with your verified competencies and experience level.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <p className="font-semibold text-foreground text-xs">Account Sync & Security</p>
                  <p className="text-[11px]">Synchronizing your saved resumes, membership privileges, and audit history across devices.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="ai-processing" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Cpu className="h-5 w-5 text-orange-500" />
                <h2>4. AI Resume & Interview Processing</h2>
              </div>
              <p>
                ProHired utilizes state-of-the-art Artificial Intelligence to parse, score, and rewrite
                resumes, and generate interview evaluations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Zero Model Training on Your Private Data:</strong> We
                  employ enterprise-grade AI model APIs with strict data protection agreements. Your private resumes
                  and personal identification are <strong>never used to train public foundation models</strong>.
                </li>
                <li>
                  <strong className="text-foreground">Ephemeral Processing:</strong> AI extraction and scoring
                  payloads are processed securely in memory and discarded from model inference queues once
                  your score report is generated.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="storage-security" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Lock className="h-5 w-5 text-orange-500" />
                <h2>5. Storage, Security & Encryption</h2>
              </div>
              <p>
                We enforce industry standard security controls to safeguard your data against unauthorized
                access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Encryption in Transit:</strong> All communications
                  between the ProHired app, device, and our backend utilize Transport Layer Security (TLS 1.3).
                </li>
                <li>
                  <strong className="text-foreground">Encryption at Rest:</strong> Profile data, resumes, and
                  database storage are encrypted using AES-256 bit encryption.
                </li>
                <li>
                  <strong className="text-foreground">Access Controls:</strong> Database tables are guarded by
                  Row Level Security (RLS), meaning each user can only read, update, or delete their own data.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="third-parties" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <ExternalLink className="h-5 w-5 text-orange-500" />
                <h2>6. Third-Party Service Providers</h2>
              </div>
              <p>
                We do not sell, trade, or rent personal identification to any third parties. We only engage
                trusted enterprise infrastructure partners:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Supabase:</strong> Scalable PostgreSQL cloud hosting
                  with SOC 2 Type II compliance for authentication and database management.
                </li>
                <li>
                  <strong className="text-foreground">Razorpay:</strong> PCI-DSS Level 1 certified payment
                  gateway for processing Pro subscriptions. ProHired never stores your credit/debit card numbers or CVVs.
                </li>
                <li>
                  <strong className="text-foreground">Cloudflare & Google Cloud:</strong> Content delivery and
                  DDoS protection.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="permissions" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Smartphone className="h-5 w-5 text-orange-500" />
                <h2>7. Device & App Permissions</h2>
              </div>
              <p>The ProHired Android app may request runtime permissions solely when you trigger specific features:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Storage / Media Files:</strong> Requested only when you
                  choose to upload a resume file (PDF or DOCX) from your device storage.
                </li>
                <li>
                  <strong className="text-foreground">Microphone (Optional):</strong> Requested solely during
                  the interactive AI Voice Mock Interview simulator to capture your voice responses.
                </li>
                <li>
                  <strong className="text-foreground">Network Access:</strong> Required to communicate with
                  ProHired AI cloud endpoints.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="user-rights" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Shield className="h-5 w-5 text-orange-500" />
                <h2>8. Your Rights & Data Portability</h2>
              </div>
              <p>You have full sovereignty over your personal data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Right of Access & Portability:</strong> You can download
                  your formatted resumes, ATS scores, and audit summaries at any time.
                </li>
                <li>
                  <strong className="text-foreground">Right to Rectification:</strong> You can edit your profile
                  name, target jobs, or uploaded materials directly within the Profile section.
                </li>
                <li>
                  <strong className="text-foreground">Right to Erasure (Account Deletion):</strong> You can
                  permanently purge your account, resumes, and interview records directly via the app or web portal.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="retention-deletion" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Trash2 className="h-5 w-5 text-orange-500" />
                <h2>9. Data Retention & Deletion</h2>
              </div>
              <p>
                We retain your resumes and analysis history only as long as you maintain an active account.
                If you choose to delete your account:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All resume uploads, parsed texts, and ATS audits are purged immediately.</li>
                <li>Mock interview feedback history is permanently erased.</li>
                <li>User profile identifiers are scrubbed from database records.</li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/app/delete-account"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Visit the Account & Data Deletion Page →
                </Link>
              </div>
            </section>

            {/* Section 10 */}
            <section id="contact" className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-base sm:text-lg">
                <Mail className="h-5 w-5 text-orange-500" />
                <h2>10. Contact & Grievance Officer</h2>
              </div>
              <p>
                If you have questions, feedback, or grievance requests regarding this Privacy Policy or
                your personal data, please contact our designated Data Protection Officer:
              </p>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1 text-xs">
                <p className="font-bold text-foreground">ProHired Privacy & Compliance Team</p>
                <p>Email: <a href="mailto:privacy@prohired.ai" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">privacy@prohired.ai</a></p>
                <p>Support: <a href="mailto:support@prohired.ai" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">support@prohired.ai</a></p>
                <p className="text-muted-foreground pt-1">Response time: Within 24-48 business hours.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
