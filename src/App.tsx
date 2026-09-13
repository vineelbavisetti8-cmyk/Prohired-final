import { lazy, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { NativeBridge } from "@/components/NativeBridge";
import { Loader2 } from "lucide-react";
import AppLayout from "./components/app/AppLayout.tsx";

// Lazy-loaded App Prototype Routes
const AppExplore = lazy(() => import("./pages/app/AppExplore.tsx"));
const ResumeUpload = lazy(() => import("./pages/app/ResumeUpload.tsx"));
const ResumeAnalysis = lazy(() => import("./pages/app/ResumeAnalysis.tsx"));
const ResumeBuilder = lazy(() => import("./pages/app/ResumeBuilder.tsx"));
const Jobs = lazy(() => import("./pages/app/Jobs.tsx"));
const JobFeed = lazy(() => import("./pages/app/JobFeed.tsx"));
const Interview = lazy(() => import("./pages/app/Interview.tsx"));
const Profile = lazy(() => import("./pages/app/Profile.tsx"));

// Legal & Compliance Routes
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy.tsx"));
const AccountDeletion = lazy(() => import("./pages/legal/AccountDeletion.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Lazy-loaded Auth Routes
const Login = lazy(() => import("./pages/auth/Login.tsx"));
const Register = lazy(() => import("./pages/auth/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.tsx"));

// Lazy-loaded Admin Suite (100% isolated from general mobile user bundle)
const AdminGuard = lazy(() => import("./components/admin/AdminGuard.tsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const Users = lazy(() => import("./pages/admin/Users.tsx"));
const Revenue = lazy(() => import("./pages/admin/Revenue.tsx"));
const Resumes = lazy(() => import("./pages/admin/Resumes.tsx"));
const Features = lazy(() => import("./pages/admin/Features.tsx"));
const Announcements = lazy(() => import("./pages/admin/Announcements.tsx"));
const PromoCodes = lazy(() => import("./pages/admin/PromoCodes.tsx"));
const Feedback = lazy(() => import("./pages/admin/Feedback.tsx"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs.tsx"));
const AIUsage = lazy(() => import("./pages/admin/AIUsage.tsx"));
const Settings = lazy(() => import("./pages/admin/Settings.tsx"));

// High-concurrency enterprise query cache configuration (tuned for 50k+ users)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes fresh data
      gcTime: 10 * 60 * 1000,       // 10 minutes memory persistence
      refetchOnWindowFocus: false, // Prevents 50k mobile re-fetch storms on app resume
      retry: 1,
    },
  },
});

/** Smooth branded loading indicator for code-split boundaries */
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 animate-fade-in p-6">
      <div className="h-11 w-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground tracking-wide">Loading ProHired...</p>
    </div>
  );
}

/** Only show splash once per session */
const hasSeenSplash =
  sessionStorage.getItem("prohired_splash_seen") === "true" ||
  sessionStorage.getItem("hirerapid_splash_seen") === "true";

const App = () => {
  const [splashDone, setSplashDone] = useState(hasSeenSplash);

  const handleSplashFinish = () => {
    sessionStorage.setItem("prohired_splash_seen", "true");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />

        {/* Animated Splash Screen — shown once per session */}
        {!splashDone && (
          <SplashScreen onFinished={handleSplashFinish} duration={2400} />
        )}

        {/* Main App Shell with Suspense Boundaries */}
        <BrowserRouter>
          <AuthProvider>
            <NativeBridge />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Root launches straight into the Modern App Prototype Shell */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<AppExplore />} />
                  <Route path="app" element={<Navigate to="/app/explore" replace />} />
                  <Route path="app/explore" element={<AppExplore />} />
                  <Route path="app/dashboard" element={<AppExplore />} />
                  <Route path="app/resume/upload" element={<ResumeUpload />} />
                  <Route path="app/resume/:id/analysis" element={<ResumeAnalysis />} />
                  <Route path="app/resume/:id/builder" element={<ResumeBuilder />} />
                  <Route path="app/jobs" element={<Jobs />} />
                  <Route path="app/job-feed" element={<JobFeed />} />
                  <Route path="app/interview" element={<Interview />} />
                  <Route path="app/profile" element={<Profile />} />
                  <Route path="app/privacy" element={<PrivacyPolicy />} />
                  <Route path="app/delete-account" element={<AccountDeletion />} />
                </Route>

                {/* Public Legal & Play Store compliance routes */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/account-deletion" element={<AccountDeletion />} />
                <Route path="/delete-account" element={<AccountDeletion />} />

                {/* Legacy Landing Page available at /landing */}
                <Route path="/landing" element={<Index />} />

                {/* Auth routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="revenue" element={<Revenue />} />
                  <Route path="resumes" element={<Resumes />} />
                  <Route path="features" element={<Features />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="promo-codes" element={<PromoCodes />} />
                  <Route path="feedback" element={<Feedback />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="ai-usage" element={<AIUsage />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

