import React, { useState } from "react";
import { 
  Search, Download, MoreVertical, 
  Eye, ArrowUp, ArrowDown, Mail, 
  Slash, Trash2, X, Phone, User as UserIcon
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function parseNameAndPhoneFromResume(text?: string, fileName?: string, email?: string): { name?: string; phone?: string } {
  let name: string | undefined;
  let phone: string | undefined;

  if (text) {
    const phoneMatch = text.match(/(?:\+91[\s-]?)?\b([6-9]\d{9})\b/);
    if (phoneMatch && phoneMatch[1]) {
      phone = phoneMatch[1];
    }

    const nameLabelMatch = text.match(/(?:Name|Candidate|Full Name|Applicant)\s*:\s*([A-Za-z\s.]{2,35})/i);
    if (nameLabelMatch && nameLabelMatch[1]) {
      name = nameLabelMatch[1].trim();
    } else {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      for (const l of lines) {
        const cleanLine = l.replace(/^[#*_\s]+/, "").replace(/[#*_\s]+$/, "").trim();
        if (
          cleanLine && 
          !cleanLine.toLowerCase().includes("resume") && 
          !cleanLine.toLowerCase().includes("curriculum") && 
          !cleanLine.toLowerCase().includes("email") &&
          !cleanLine.toLowerCase().includes("phone") &&
          !cleanLine.toLowerCase().includes("location") &&
          !cleanLine.toLowerCase().includes("experience") &&
          !cleanLine.toLowerCase().includes("skills") &&
          cleanLine.length >= 2 && 
          cleanLine.length <= 35
        ) {
          if (/^[a-zA-Z\s.]+$/.test(cleanLine) && !cleanLine.includes("@")) {
            name = cleanLine.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
            break;
          }
        }
      }
    }
  }

  if (!name && fileName) {
    const base = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const cleanBase = base.replace(/resume|cv|biodata|profile|ats/gi, "").trim();
    if (cleanBase.length >= 2 && /^[a-zA-Z\s.]+$/.test(cleanBase)) {
      name = cleanBase.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  if (!name && email && !email.includes("@prohired.user")) {
    const prefix = email.split("@")[0].replace(/[._-]/g, " ");
    if (prefix.length >= 2 && /^[a-zA-Z\s]+$/.test(prefix)) {
      name = prefix.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  return { name, phone };
}

function extractPhone(user: any): string {
  if (user.phone) return String(user.phone).replace(/\D/g, "");
  if (user.phone_number) return String(user.phone_number).replace(/\D/g, "");
  if (user.id) {
    const match = String(user.id).match(/\b([6-9]\d{9})\b/);
    if (match && match[1]) return match[1];
  }
  if (user.email) {
    const match = String(user.email).match(/\b([6-9]\d{9})\b/);
    if (match && match[1]) return match[1];
  }
  if (user.original_text || user.rewritten_resume) {
    const parsed = parseNameAndPhoneFromResume(user.original_text || user.rewritten_resume, user.file_name, user.email);
    if (parsed.phone) return parsed.phone;
  }
  return "";
}

function formatPhone(user: any): string {
  const raw = extractPhone(user);
  if (raw.length === 10) return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  if (raw) return `+91 ${raw}`;
  return "Not provided";
}

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const userMap = new Map<string, any>();

      // 1. Fetch Supabase profiles
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          data.forEach((p) => {
            if (p.id) userMap.set(p.id, p);
          });
        }
      } catch {
        // ignore
      }

      // 2. Fetch Supabase resumes to extract candidate details & counts
      try {
        const { data: dbResumes } = await supabase
          .from("resumes")
          .select("id, user_id, file_name, original_text, rewritten_resume, created_at");
        if (dbResumes && dbResumes.length > 0) {
          dbResumes.forEach((r: any) => {
            if (r.user_id) {
              const parsed = parseNameAndPhoneFromResume(r.original_text || r.rewritten_resume, r.file_name);
              const phone = parsed.phone || extractPhone({ id: r.user_id });
              const name = parsed.name || (phone ? `Candidate (${phone.slice(-4)})` : undefined);

              const existing = userMap.get(r.user_id);
              if (existing) {
                existing.resume_count = (existing.resume_count || 0) + 1;
                if ((!existing.full_name || existing.full_name.includes("Registered User") || existing.full_name.includes("Prohired User")) && name) {
                  existing.full_name = name;
                }
                if (!existing.phone && phone) existing.phone = phone;
              } else {
                userMap.set(r.user_id, {
                  id: r.user_id,
                  full_name: name || "Candidate User",
                  email: phone ? `phone_${phone}@prohired.user` : `user_${r.user_id.slice(-6)}@prohired.user`,
                  phone: phone,
                  plan: "free",
                  resume_count: 1,
                  created_at: r.created_at || new Date().toISOString(),
                  updated_at: r.created_at || new Date().toISOString(),
                });
              }
            }
          });
        }
      } catch {
        // ignore
      }

      // 3. Fetch all registered phone users from localStorage
      try {
        const allUsersRaw = localStorage.getItem("hirerapid_all_users") || localStorage.getItem("prohired_all_users");
        if (allUsersRaw) {
          const allUsers = JSON.parse(allUsersRaw);
          if (Array.isArray(allUsers)) {
            allUsers.forEach((u: any) => {
              if (u && (u.id || u.phone_number)) {
                const key = u.id || `user_phone_${u.phone_number}`;
                const existing = userMap.get(key);
                userMap.set(key, {
                  id: key,
                  full_name: u.full_name || existing?.full_name || "Registered Candidate",
                  email: u.email || existing?.email || `phone_${u.phone_number}@prohired.user`,
                  phone: u.phone_number || u.phone || existing?.phone,
                  plan: u.plan || existing?.plan || "free",
                  resume_count: existing?.resume_count || 0,
                  created_at: u.created_at || existing?.created_at || new Date().toISOString(),
                  updated_at: u.updated_at || existing?.updated_at || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch {
        // ignore
      }

      // 4. Fetch current logged-in phone user from localStorage
      try {
        const singleRaw = localStorage.getItem("hirerapid_phone_user") || localStorage.getItem("prohired_phone_user");
        if (singleRaw) {
          const u = JSON.parse(singleRaw);
          if (u && (u.id || u.phone_number)) {
            const key = u.id || `user_phone_${u.phone_number}`;
            const existing = userMap.get(key);
            userMap.set(key, {
              id: key,
              full_name: u.full_name || existing?.full_name || "Active Candidate",
              email: u.email || existing?.email || `phone_${u.phone_number}@prohired.user`,
              phone: u.phone_number || u.phone || existing?.phone,
              plan: u.plan || existing?.plan || "free",
              resume_count: existing?.resume_count || 0,
              created_at: u.created_at || existing?.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch {
        // ignore
      }

      // 5. Extract users and resume counts from localStorage
      try {
        const resumesRaw = localStorage.getItem("hirerapid_local_resumes") || localStorage.getItem("prohired_local_resumes");
        if (resumesRaw) {
          const resumes = JSON.parse(resumesRaw);
          if (Array.isArray(resumes)) {
            resumes.forEach((r: any) => {
              if (r.user_id) {
                const parsed = parseNameAndPhoneFromResume(r.original_text || r.rewritten_resume, r.file_name);
                const derivedPhone = parsed.phone || extractPhone({ id: r.user_id });
                const derivedName = parsed.name || (derivedPhone ? `Candidate (${derivedPhone.slice(-4)})` : "Registered Candidate");

                const existing = userMap.get(r.user_id);
                if (existing) {
                  existing.resume_count = (existing.resume_count || 0) + 1;
                  if ((!existing.full_name || existing.full_name.includes("User") || existing.full_name.includes("Registered")) && derivedName) {
                    existing.full_name = derivedName;
                  }
                  if (!existing.phone && derivedPhone) {
                    existing.phone = derivedPhone;
                  }
                } else {
                  userMap.set(r.user_id, {
                    id: r.user_id,
                    full_name: derivedName,
                    email: derivedPhone ? `phone_${derivedPhone}@prohired.user` : `user_${r.user_id.slice(-6)}@prohired.user`,
                    phone: derivedPhone,
                    plan: "free",
                    resume_count: 1,
                    created_at: r.created_at || new Date().toISOString(),
                    updated_at: r.updated_at || new Date().toISOString(),
                  });
                }
              }
            });
          }
        }
      } catch {
        // ignore
      }

      // Final cleanup of names, phones, and plan overrides for all map entries
      let planOverrides: Record<string, string> = {};
      try {
        const planMapRaw = localStorage.getItem("hirerapid_user_plans") || localStorage.getItem("prohired_user_plans");
        if (planMapRaw) planOverrides = JSON.parse(planMapRaw);
      } catch {
        // ignore
      }

      userMap.forEach((u, key) => {
        if (!u.phone) {
          const p = extractPhone(u);
          if (p) u.phone = p;
        }
        if (!u.full_name || u.full_name === "Prohired User" || u.full_name === "Registered User") {
          const rawP = extractPhone(u);
          if (rawP) {
            u.full_name = `Candidate (${rawP.slice(-4)})`;
          }
        }

        // Apply plan override if present
        const phone = extractPhone(u);
        const override = planOverrides[u.id] || (phone ? planOverrides[phone] : null) || (u.email ? planOverrides[u.email] : null);
        if (override) {
          u.plan = override;
        }
      });

      const result = Array.from(userMap.values());
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return result;
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan, userObj }: { userId?: string; plan: string; userObj?: any }) => {
      const targetUser = userObj || { id: userId };
      const uId = targetUser.id || userId;
      const phone = extractPhone(targetUser) || (uId && uId.includes("user_phone_") ? uId.replace("user_phone_", "") : "");
      const email = targetUser.email || (phone ? `phone_${phone}@prohired.user` : "");

      // 1. Update localStorage plan map
      try {
        const rawMap = localStorage.getItem("hirerapid_user_plans") || localStorage.getItem("prohired_user_plans");
        const map = rawMap ? JSON.parse(rawMap) : {};
        if (uId) map[uId] = plan;
        if (phone) map[phone] = plan;
        localStorage.setItem("hirerapid_user_plans", JSON.stringify(map));
        localStorage.setItem("prohired_user_plans", JSON.stringify(map));
      } catch {
        // ignore
      }

      // 2. Database Upsert & Update across ID, Email, and Phone
      try {
        if (uId) {
          await supabase
            .from("profiles")
            .upsert({ 
              id: uId, 
              plan, 
              full_name: targetUser.full_name || undefined, 
              email: email || undefined, 
              phone: phone || undefined, 
              updated_at: new Date().toISOString() 
            }, { onConflict: "id" });
        }
        if (email) {
          await supabase.from("profiles").update({ plan, updated_at: new Date().toISOString() }).eq("email", email);
        }
        if (phone) {
          await supabase.from("profiles").update({ plan, updated_at: new Date().toISOString() }).eq("phone", phone);
        }
      } catch (err) {
        console.warn("Supabase plan update error:", err);
      }

      // 3. Update local storage registry
      try {
        const allUsersRaw = localStorage.getItem("hirerapid_all_users") || localStorage.getItem("prohired_all_users");
        if (allUsersRaw) {
          const allUsers = JSON.parse(allUsersRaw);
          if (Array.isArray(allUsers)) {
            allUsers.forEach((u: any) => {
              const uPhone = extractPhone(u);
              if (u.id === uId || uPhone === phone || (email && u.email === email)) {
                u.plan = plan;
              }
            });
            localStorage.setItem("hirerapid_all_users", JSON.stringify(allUsers));
            localStorage.setItem("prohired_all_users", JSON.stringify(allUsers));
          }
        }
      } catch {
        // ignore
      }

      // 4. Update active session user if matching
      try {
        const singleRaw = localStorage.getItem("hirerapid_phone_user") || localStorage.getItem("prohired_phone_user");
        if (singleRaw) {
          const single = JSON.parse(singleRaw);
          const sPhone = extractPhone(single);
          if (single.id === uId || sPhone === phone || (email && single.email === email)) {
            single.plan = plan;
            localStorage.setItem("hirerapid_phone_user", JSON.stringify(single));
            localStorage.setItem("prohired_phone_user", JSON.stringify(single));
          }
        }
      } catch {
        // ignore
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`User membership plan updated to ${variables.plan.toUpperCase()}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user plan");
    }
  });

  const filteredUsers = users?.filter(user => {
    const rawP = extractPhone(user);
    const fmtP = formatPhone(user);
    const matchesSearch = 
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      rawP.includes(searchTerm) ||
      fmtP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm);
    
    const matchesPlan = planFilter === "all" || user.plan === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  const PlanBadge = ({ plan }: { plan: string }) => (
    <Badge className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      plan === "pro" 
        ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 shadow-[0_0_15px_rgba(255,209,102,0.15)]" 
        : "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20"
    )}>
      {plan || "free"}
    </Badge>
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  if (error) return <div className="text-red-500">Error loading users</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Bar - Filter & Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <Input 
            placeholder="Search by name, phone number, email, or ID..." 
            className="pl-12 bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] text-[#111827] h-14 rounded-2xl focus:ring-[#F0562B]/30 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
          <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-[rgba(0,229,255,0.08)]">
            <button 
              onClick={() => setPlanFilter("all")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", planFilter === 'all' ? "bg-[#F0562B] text-[#FAF9F7]" : "text-[#6B7280] hover:text-[#111827]")}
            >All</button>
            <button 
              onClick={() => setPlanFilter("pro")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", planFilter === 'pro' ? "bg-[#F59E0B] text-[#FAF9F7]" : "text-[#6B7280] hover:text-[#111827]")}
            >Pro</button>
            <button 
              onClick={() => setPlanFilter("free")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", planFilter === 'free' ? "bg-white text-[#FAF9F7]" : "text-[#6B7280] hover:text-[#111827]")}
            >Free</button>
          </div>
          <Button variant="outline" className="border-[rgba(0,229,255,0.12)] bg-[#FFFFFF] text-[#F0562B] hover:bg-[#F0562B]/10 gap-2 h-11 rounded-xl font-bold text-sm min-w-fit px-6 shadow-lg shadow-orange-200/40">
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-3xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#F5F6F8]/40">
            <TableRow className="border-b border-[rgba(0,229,255,0.05)] hover:bg-transparent">
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6 px-6">User Name</TableHead>
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6">Mobile / Phone</TableHead>
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6">Membership</TableHead>
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6">Resumes</TableHead>
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6">Joined</TableHead>
              <TableHead className="text-[#6B7280] font-bold uppercase text-[11px] tracking-[0.15em] py-6 text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => {
              const phoneStr = formatPhone(user);
              return (
                <TableRow key={user.id} className="border-b border-[rgba(0,229,255,0.03)] hover:bg-[#F5F6F8]/50 transition-all duration-200 group">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-[rgba(0,229,255,0.1)] group-hover:border-[#F0562B]/40 transition-colors">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{(user.full_name || "U")[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[#111827] font-bold text-base group-hover:text-[#F0562B] transition-colors">{user.full_name || "Registered User"}</p>
                        <p className="text-[#6B7280] text-xs font-mono">{user.id.slice(0, 16)}…</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0562B]/10 text-[#F0562B]">
                        <Phone size={14} />
                      </span>
                      <span className="text-[#111827] font-bold text-sm tracking-wide">
                        {phoneStr}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell><PlanBadge plan={user.plan} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-[#111827] font-bold text-base">{user.resume_count || 0}</span>
                      <span className="text-[#6B7280] text-xs">files</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#6B7280] text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-[#6B7280] hover:text-[#F0562B] hover:bg-[#F0562B]/10 rounded-xl"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={20} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-[#6B7280] hover:text-[#111827] hover:bg-white/5 rounded-xl">
                            <MoreVertical size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] text-[#111827] w-56 p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <DropdownMenuItem 
                            className="gap-3 py-3 px-4 rounded-xl focus:bg-[#F0562B] focus:text-[#FAF9F7] transition-all cursor-pointer font-bold"
                            onClick={() => updatePlanMutation.mutate({ userId: user.id, plan: "pro" })}
                          >
                            <ArrowUp size={18} /> Upgrade to Pro
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-3 py-3 px-4 rounded-xl focus:bg-[#F59E0B] focus:text-[#FAF9F7] transition-all cursor-pointer font-bold"
                            onClick={() => updatePlanMutation.mutate({ userId: user.id, plan: "free" })}
                          >
                            <ArrowDown size={18} /> Downgrade to Free
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-3 px-4 rounded-xl focus:bg-[#C2410C]/20 focus:text-[#C2410C] transition-all cursor-pointer font-bold">
                            <Mail size={18} /> Send Message
                          </DropdownMenuItem>
                          <div className="h-px bg-[rgba(0,229,255,0.05)] my-2"></div>
                          <DropdownMenuItem 
                            className="gap-3 py-3 px-4 rounded-xl focus:bg-[#DC2626]/10 text-[#DC2626] transition-all cursor-pointer font-bold"
                            onClick={() => {
                              if(confirm("Are you sure?")) deleteUserMutation.mutate(user.id);
                            }}
                          >
                            <Trash2 size={18} /> Permanently Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {filteredUsers?.map((user) => {
          const phoneStr = formatPhone(user);
          return (
            <Card key={user.id} className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-3xl overflow-hidden shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-[rgba(0,229,255,0.1)]">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{(user.full_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#111827] font-bold text-lg">{user.full_name || "Registered User"}</p>
                      <p className="text-[#F0562B] text-xs font-bold flex items-center gap-1 mt-0.5">
                        <Phone size={12} /> {phoneStr}
                      </p>
                    </div>
                  </div>
                  <PlanBadge plan={user.plan} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF9F7]/50 border border-[rgba(0,229,255,0.03)]">
                  <div className="space-y-1">
                    <p className="text-[#6B7280] text-[10px] uppercase font-bold tracking-widest">Joined On</p>
                    <p className="text-[#111827] text-sm font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#6B7280] text-[10px] uppercase font-bold tracking-widest">Resumes Made</p>
                    <p className="text-[#111827] text-sm font-bold">{user.resume_count || 0} files</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-12 bg-[#F0562B]/10 text-[#F0562B] hover:bg-[#F0562B] hover:text-[#FAF9F7] border border-[#F0562B]/20 rounded-xl font-bold transition-all"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye size={18} className="mr-2" /> Details
                  </Button>
                  <Button className="flex-1 h-12 bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] text-[#111827] rounded-xl font-bold">
                    <Mail size={18} className="mr-2" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Detail Side Panel / Bottom Sheet */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#FAF9F7]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-lg md:w-[450px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[rgba(0,229,255,0.15)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#F0562B] animate-pulse"></div>
                  <h3 className="text-xl font-bold text-[#111827] font-syne uppercase tracking-wider">User Details</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="h-10 w-10 rounded-full hover:bg-white/5 text-[#6B7280] hover:text-[#111827]">
                  <X size={28} />
                </Button>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F0562B]/20 blur-3xl rounded-full"></div>
                  <Avatar className="h-28 w-28 border-4 border-[#FFFFFF] ring-4 ring-[#F0562B]/20 relative z-10 shadow-2xl">
                    <AvatarImage src={selectedUser.avatar_url || ""} />
                    <AvatarFallback className="text-3xl font-bold">{(selectedUser.full_name || "U")[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold text-[#111827] font-syne tracking-tight">{selectedUser.full_name || "Registered User"}</h4>
                  <p className="text-[#F0562B] text-base font-bold flex items-center justify-center gap-1.5 mt-1">
                    <Phone size={16} /> Mobile: {formatPhone(selectedUser)}
                  </p>
                </div>
                <PlanBadge plan={selectedUser.plan} />
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F6F8] p-5 rounded-3xl border border-[rgba(0,229,255,0.05)] shadow-lg">
                    <p className="text-[#6B7280] text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Resumes</p>
                    <p className="text-3xl font-bold text-[#111827] font-syne">{selectedUser.resume_count || 0}</p>
                  </div>
                  <div className="bg-[#F5F6F8] p-5 rounded-3xl border border-[rgba(0,229,255,0.05)] shadow-lg">
                    <p className="text-[#6B7280] text-[10px] uppercase font-bold tracking-[0.2em] mb-2">ATS Score</p>
                    <p className="text-3xl font-bold text-[#12805B] font-syne">78%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.2em] px-1">Detailed Logs</h5>
                  <div className="bg-[#FAF9F7]/40 rounded-3xl p-6 border border-[rgba(0,229,255,0.03)] space-y-4">
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-[#6B7280]">Full Name</span>
                      <span className="text-[#111827] font-bold">{selectedUser.full_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-[#6B7280]">Phone Number</span>
                      <span className="text-[#F0562B] font-bold">{formatPhone(selectedUser)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-[#6B7280]">Registration Date</span>
                      <span className="text-[#111827] font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-[#6B7280]">Last Online</span>
                      <span className="text-[#111827] font-bold">{selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-[#6B7280]">Total Spend</span>
                      <span className="text-[#F59E0B] font-bold">₹{selectedUser.plan === 'pro' ? '19.00' : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B7280]">Current Status</span>
                      <Badge className={cn("px-3 py-1 font-bold", (selectedUser.status || 'active') === 'active' ? "bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20" : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20")}>
                        {(selectedUser.status || 'ACTIVE').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto grid grid-cols-2 gap-4">
                <Button 
                  className="h-14 bg-[#F0562B] hover:bg-[#F0562B]/90 text-[#FAF9F7] font-bold rounded-2xl text-base shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                  onClick={() => updatePlanMutation.mutate({ userId: selectedUser.id, userObj: selectedUser, plan: selectedUser.plan === 'pro' ? 'free' : 'pro' })}
                >
                  {selectedUser.plan === 'pro' ? 'Downgrade to Free' : 'Gift Pro Access'}
                </Button>
                <Button variant="outline" className="h-14 border-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-2xl font-bold">
                  {selectedUser.status === 'active' ? 'Suspend' : 'Unsuspend'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[rgba(0,229,255,0.05)] gap-4">
        <p className="text-[#6B7280] text-sm font-medium">Showing <span className="text-[#111827]">{filteredUsers?.length || 0}</span> users</p>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 px-6 border-[rgba(0,229,255,0.12)] text-[#6B7280] hover:text-[#111827] rounded-xl font-bold">Previous</Button>
          <Button variant="outline" className="h-11 px-6 bg-[#F0562B]/10 border-[#F0562B]/20 text-[#F0562B] hover:bg-[#F0562B] hover:text-[#FAF9F7] rounded-xl font-bold transition-all shadow-lg shadow-orange-200/40">Next Page</Button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
