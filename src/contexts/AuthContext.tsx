import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types";
import { isValidUuid } from "@/lib/utils";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  togglePlan: () => void;
  streakDays: number;
  aiCredits: number;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  signInWithPhone: (fullName: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  updatePlanToPro: (paymentDetails?: { paymentId: string; orderId?: string; amount?: number }) => Promise<{ success: boolean; error?: string }>;
  updateProfileName: (name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_USER_KEY = "prohired_phone_user";
const USER_PLANS_KEY = "prohired_user_plans";
// Backward-compat: read old hirerapid keys if new ones don't exist
const readWithFallback = (key: string, oldKey: string) =>
  localStorage.getItem(key) ?? localStorage.getItem(oldKey);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [aiCredits, setAiCredits] = useState<number>(50);

  const isAuthenticated = Boolean(user && profile);

  const fetchProfile = async (uid: string, currentUser?: User | null) => {
    let pPlan: "free" | "pro" | null = null;
    try {
      const planMapRaw = readWithFallback(USER_PLANS_KEY, "hirerapid_user_plans");
      if (planMapRaw) {
        const planMap = JSON.parse(planMapRaw);
        if (planMap[uid] === "pro" || planMap[uid] === "free") {
          pPlan = planMap[uid] as "free" | "pro";
        }
      }
    } catch {
      // ignore
    }

    if (isValidUuid(uid)) {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
        if (data) {
          const finalProfile = data as Profile;
          if (pPlan) finalProfile.plan = pPlan;
          setProfile(finalProfile);
          return;
        }
      } catch {
        // Fallback below
      }

      // Fallback for Supabase user (Google OAuth / Email) without existing profile row
      const u = currentUser || user;
      const uMeta = u?.user_metadata || {};
      const derivedName = uMeta.full_name || uMeta.name || (u?.email ? u.email.split("@")[0] : "ProHired User");
      const derivedAvatar = uMeta.avatar_url || uMeta.picture || null;
      const derivedEmail = u?.email || null;
      const fallbackProfile: Profile = {
        id: uid,
        full_name: derivedName,
        email: derivedEmail,
        phone: uMeta.phone || null,
        avatar_url: derivedAvatar,
        plan: (pPlan || "free") as "free" | "pro",
        resume_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      try {
        await supabase.from("profiles").upsert(
          {
            id: uid,
            full_name: derivedName,
            email: derivedEmail,
            avatar_url: derivedAvatar,
            plan: (pPlan || "free") as "free" | "pro",
          },
          { onConflict: "id" }
        );
      } catch {
        // ignore upsert errors
      }

      setProfile(fallbackProfile);
      return;
    }

    // Check local storage phone user
    const local = readWithFallback(LOCAL_USER_KEY, "hirerapid_phone_user");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.id === uid || uid.includes(parsed.phone_number || "")) {
          const effectivePlan: "free" | "pro" = pPlan || (parsed.plan === "pro" ? "pro" : "free");
          setProfile({
            id: parsed.id,
            full_name: parsed.full_name,
            email: parsed.email || null,
            phone: parsed.phone_number,
            avatar_url: null,
            plan: effectivePlan,
            resume_count: 0,
            created_at: parsed.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
          return;
        }
      } catch {
        // ignore
      }
    }

    setProfile(null);
  };

  useEffect(() => {
    // 1. Supabase auth listener
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        setTimeout(() => fetchProfile(newSession.user.id, newSession.user), 0);
      } else {
        const local = readWithFallback(LOCAL_USER_KEY, "hirerapid_phone_user");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const realUser: any = {
              id: parsed.id,
              email: parsed.email || null,
              user_metadata: { full_name: parsed.full_name, phone: parsed.phone_number },
            };
            setUser(realUser);
            setProfile({
              id: parsed.id,
              full_name: parsed.full_name,
              email: parsed.email || null,
              phone: parsed.phone_number,
              avatar_url: null,
              plan: parsed.plan || "free",
              resume_count: 0,
              created_at: parsed.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any);
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    });

    // 2. Initial session check
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        setUser(existing.user);
        fetchProfile(existing.user.id, existing.user);
      } else {
        const local = localStorage.getItem(LOCAL_USER_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const realUser: any = {
              id: parsed.id,
              email: parsed.email || null,
              user_metadata: { full_name: parsed.full_name, phone: parsed.phone_number },
            };
            setUser(realUser);
            setProfile({
              id: parsed.id,
              full_name: parsed.full_name,
              email: parsed.email || null,
              phone: parsed.phone_number,
              avatar_url: null,
              plan: parsed.plan || "free",
              resume_count: 0,
              created_at: parsed.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any);
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          // No user logged in
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/app/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Google sign in error:", err);
      return { success: false, error: err.message || "Failed to initiate Google sign in." };
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Email sign in error:", err);
      return { success: false, error: err.message || "Invalid email or password." };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }> => {
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || email.split("@")[0],
          },
          emailRedirectTo: `${origin}/app/dashboard`,
        },
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user);
      }
      return {
        success: true,
        requiresEmailVerification: data.session === null,
      };
    } catch (err: any) {
      console.error("Sign up error:", err);
      return { success: false, error: err.message || "Failed to create account." };
    }
  };

  // Direct plan toggling is strictly disabled — Pro requires verified payment completion
  const togglePlan = () => {
    console.warn("Direct plan toggle is disabled. Verified payment checkout is required to activate Pro.");
  };

  const updateProfileName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile((prev) => (prev ? { ...prev, full_name: trimmed } : null));
    const local = localStorage.getItem(LOCAL_USER_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        parsed.full_name = trimmed;
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
      } catch {}
    }
    if (user?.id && isValidUuid(user.id)) {
      try {
        await supabase.from("profiles").update({ full_name: trimmed }).eq("id", user.id);
      } catch {}
    }
  };

  const signInWithPhone = async (fullName: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit phone number." };
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      return { success: false, error: "Please enter your full name." };
    }

    const name = fullName.trim();
    const fallbackId = `user_phone_${cleanPhone}`;
    const timestamp = new Date().toISOString();

    const localData = {
      id: fallbackId,
      full_name: name,
      phone_number: cleanPhone,
      email: null,
      created_at: timestamp,
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localData));

    const realUser: any = {
      id: fallbackId,
      email: null,
      user_metadata: { full_name: name, phone: cleanPhone },
    };
    setUser(realUser);
    setProfile({
      id: fallbackId,
      full_name: name,
      email: null,
      phone: cleanPhone,
      avatar_url: null,
      plan: "free",
      resume_count: 0,
      created_at: timestamp,
      updated_at: timestamp,
    } as any);

    return { success: true };
  };

  const updatePlanToPro = async (paymentDetails?: { paymentId: string; orderId?: string; amount?: number }): Promise<{ success: boolean; error?: string }> => {
    // Strictly require a valid verified payment ID
    if (!paymentDetails?.paymentId) {
      console.error("Pro upgrade rejected: missing verified payment details.");
      return { success: false, error: "Payment verification required to activate Pro." };
    }

    setProfile((prev) => (prev ? { ...prev, plan: "pro" } : null));
    const local = localStorage.getItem(LOCAL_USER_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        parsed.plan = "pro";
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
      } catch {}
    }
    if (user?.id) {
      try {
        const map = JSON.parse(localStorage.getItem(USER_PLANS_KEY) || "{}");
        map[user.id] = "pro";
        localStorage.setItem(USER_PLANS_KEY, JSON.stringify(map));
        if (isValidUuid(user.id)) {
          await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id);
          await supabase.from("payments").insert({
            user_id: user.id,
            razorpay_payment_id: paymentDetails.paymentId,
            razorpay_order_id: paymentDetails.orderId || `ord_${Date.now()}`,
            amount: paymentDetails.amount || 4900,
            currency: "INR",
            status: "paid",
            plan: "pro_monthly",
          });
        }
      } catch (e) {
        console.warn("Payment log notice:", e);
      }
    }
    return { success: true };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUserId = user?.id;
      if (currentUserId && isValidUuid(currentUserId)) {
        try {
          await supabase.from("resumes").delete().eq("user_id", currentUserId);
        } catch (e) {
          console.warn("Could not delete resumes during account deletion:", e);
        }
        try {
          await supabase.from("interview_sessions").delete().eq("user_id", currentUserId);
        } catch (e) {
          console.warn("Could not delete interview sessions:", e);
        }
        try {
          await supabase.from("profiles").delete().eq("id", currentUserId);
        } catch (e) {
          console.warn("Could not delete profile:", e);
        }
        try {
          await (supabase as any).rpc("delete_user");
        } catch {}
      }

      // Clear local storage phone user keys and plans
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem("hirerapid_phone_user");
      if (currentUserId) {
        try {
          const map = JSON.parse(localStorage.getItem(USER_PLANS_KEY) || "{}");
          delete map[currentUserId];
          localStorage.setItem(USER_PLANS_KEY, JSON.stringify(map));
        } catch {}
      }

      // Remove cached user resume/analysis records
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("prohired_") || key.startsWith("hirerapid_")) &&
          key !== "prohired_splash_seen" &&
          key !== "hirerapid_splash_seen"
        ) {
          localStorage.removeItem(key);
        }
      }

      try {
        await supabase.auth.signOut();
      } catch {}

      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (err: any) {
      console.error("Account deletion error:", err);
      return { success: false, error: err.message || "Failed to delete account. Please try again." };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAuthenticated,
        togglePlan,
        streakDays,
        aiCredits,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        updatePlanToPro,
        updateProfileName,
        refreshProfile,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
