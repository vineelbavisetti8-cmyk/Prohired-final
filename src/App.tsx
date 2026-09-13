import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { NativeBridge } from "@/components/NativeBridge";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import AppExplore from "./pages/app/AppExplore.tsx";
import ResumeUpload from "./pages/app/ResumeUpload.tsx";
import ResumeAnalysis from "./pages/app/ResumeAnalysis.tsx";
import Profile from "./pages/app/Profile.tsx";
import Jobs from "./pages/app/Jobs.tsx";
import Interview from "./pages/app/Interview.tsx";
import ResumeBuilder from "./pages/app/ResumeBuilder.tsx";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy.tsx";
import AccountDeletion from "./pages/legal/AccountDeletion.tsx";
import Index from "./pages/Index.tsx";

// Admin Imports
import AdminGuard from "./components/admin/AdminGuard.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import Users from "./pages/admin/Users.tsx";
import Revenue from "./pages/admin/Revenue.tsx";
import Resumes from "./pages/admin/Resumes.tsx";
import Features from "./pages/admin/Features.tsx";
import Announcements from "./pages/admin/Announcements.tsx";
import PromoCodes from "./pages/admin/PromoCodes.tsx";
import Feedback from "./pages/admin/Feedback.tsx";
import AuditLogs from "./pages/admin/AuditLogs.tsx";
import AIUsage from "./pages/admin/AIUsage.tsx";
import Settings from "./pages/admin/Settings.tsx";

const queryClient = new QueryClient();

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

        {/* Main App Prototype */}
        <BrowserRouter>
          <AuthProvider>
            <NativeBridge />
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
                <Route path="app/job-feed" element={<Jobs />} />
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
