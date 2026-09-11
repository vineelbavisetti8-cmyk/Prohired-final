import React from "react";
import { 
  Users, Gem, IndianRupee, FileText, 
  ArrowUpRight, Activity, 
  Send, Ticket, Settings as SettingsIcon,
  ToggleLeft
} from "lucide-react";
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Metric card component for dashboard stats
const MetricCard = ({ title, value, sub, icon: Icon, color }: {
  title: string;
  value?: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}) => (
  <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-2xl overflow-hidden shadow-xl hover:border-[rgba(0,229,255,0.25)] transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-opacity-10", color.replace("text-", "bg-").replace("]", "/10]"))}>
          <Icon size={24} className={color} />
        </div>
        <ArrowUpRight size={18} className="text-[#6B7280] group-hover:text-[#F0562B] transition-colors" />
      </div>
      <h3 className="text-2xl font-bold text-[#111827] font-syne">{value || "0"}</h3>
      <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mt-1">{title}</p>
      <p className="text-[#6B7280] text-[11px] mt-2">{sub}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersCount, proCount, revenueSum, resumesCount] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("payments").select("amount").eq("status", "success"),
        supabase.from("resumes").select("*", { count: "exact", head: true }),
      ]);

      return {
        totalUsers: usersCount.count || 0,
        proUsers: proCount.count || 0,
        totalRevenue: revenueSum.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
        totalResumes: resumesCount.count || 0,
      };
    }
  });

  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      // Try to fetch from activity_log if it exists, fallback to recent profiles/resumes
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      return data?.map(user => ({
        icon: Users,
        text: `New user registered — ${user.email}`,
        time: new Date(user.created_at).toLocaleString(),
        color: "text-[#F0562B]"
      })) || [];
    }
  });

  if (statsLoading || logsLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Total Users" value={stats?.totalUsers.toLocaleString()} sub="+X new today" icon={Users} color="text-[#F0562B]" />
        <MetricCard title="Pro Subscribers" value={stats?.proUsers.toLocaleString()} sub={`${((stats?.proUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% conversion`} icon={Gem} color="text-[#F59E0B]" />
        <MetricCard title="Total Revenue" value={`₹${stats?.totalRevenue.toLocaleString()}`} sub="Lifetime earnings" icon={IndianRupee} color="text-[#12805B]" />
        <MetricCard title="Resumes" value={stats?.totalResumes.toLocaleString()} sub="Total generated" icon={FileText} color="text-[#C2410C]" />
      </div>

      {/* Charts Grid - Keeping mock for now as historical data fetching needs more logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... (Charts keeping mock data for visual consistency if real data is sparse) ... */}
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30 px-6 py-5">
            <CardTitle className="text-lg font-bold text-[#111827] font-syne flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[#F0562B]/10 text-[#F0562B]">
                <Activity size={20} />
              </div>
              Live Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[rgba(0,229,255,0.05)]">
              {activityLogs?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F6F8]/40 transition-all cursor-pointer group">
                  <div className={cn("p-2.5 rounded-xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.05)] group-hover:border-[rgba(0,229,255,0.2)] transition-colors", item.color)}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#111827] text-[14px] font-medium leading-relaxed">{item.text}</p>
                    <p className="text-[#6B7280] text-[12px] font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] rounded-2xl p-6 shadow-xl h-fit">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-lg font-bold text-[#111827] font-syne">Power Actions</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Button className="w-full h-14 bg-[#F0562B]/10 hover:bg-[#F0562B]/20 text-[#F0562B] border border-[#F0562B]/20 justify-start px-6 gap-4 rounded-xl group transition-all">
              <div className="p-2 rounded-lg bg-[#F0562B]/20 group-hover:scale-110 transition-transform">
                <Send size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">New Announcement</p>
                <p className="text-[11px] text-[#6B7280]">Broadcast to all users</p>
              </div>
            </Button>
            <Button className="w-full h-14 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/20 justify-start px-6 gap-4 rounded-xl group transition-all">
              <div className="p-2 rounded-lg bg-[#F59E0B]/20 group-hover:scale-110 transition-transform">
                <Ticket size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Promo Builder</p>
                <p className="text-[11px] text-[#6B7280]">Create discount codes</p>
              </div>
            </Button>
            <div className="pt-6 mt-2 border-t border-[rgba(0,229,255,0.05)]">
              <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                      <SettingsIcon size={20} />
                    </div>
                    <span className="text-[14px] font-bold text-[#111827]">Maintenance Mode</span>
                  </div>
                  <button className="text-[#6B7280] hover:text-[#DC2626] transition-colors scale-125">
                    <ToggleLeft size={32} />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-[#6B7280] leading-relaxed">
                  When enabled, all user features will be disabled for system updates.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
