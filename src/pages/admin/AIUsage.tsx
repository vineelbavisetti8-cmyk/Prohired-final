import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { 
  Cpu, Zap, AlertTriangle, 
  Clock, DollarSign, Activity,
  BrainCircuit, Sparkles, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const AIUsagePage = () => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const stats = [
    { label: "Total AI Calls", value: "14.2K", sub: "+8% from yesterday", icon: BrainCircuit, color: "text-[#F0562B]" },
    { label: "Avg Latency", value: "1.2s", sub: "Stable performance", icon: Clock, color: "text-[#F59E0B]" },
    { label: "Error Rate", value: "0.04%", sub: "Minimal impact", icon: AlertTriangle, color: "text-[#DC2626]" },
    { label: "Est. Cost", value: "$42.10", sub: "Month to date", icon: DollarSign, color: "text-[#12805B]" },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[#111827] font-syne uppercase tracking-tight">AI Intelligence Metrics</h3>
          <p className="text-[#6B7280] text-sm font-medium">Monitoring LLM performance, latency, and operational costs</p>
        </div>
        <div className="flex bg-[#FAF9F7] p-1.5 rounded-2xl border border-[rgba(0,229,255,0.08)]">
          <button className="px-6 py-2 rounded-xl bg-[#F0562B] text-[#FAF9F7] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-300/30">Live View</button>
          <button className="px-6 py-2 rounded-xl text-[#6B7280] text-[10px] font-black uppercase tracking-widest hover:text-[#111827]">Historical</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-3xl p-7 shadow-2xl relative group overflow-hidden transition-all hover:border-[rgba(0,229,255,0.3)]">
            <div className="space-y-6 relative z-10">
              <div className={cn("p-4 w-fit rounded-2xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.05)] shadow-inner", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-3">{stat.label}</p>
                <h3 className="text-3xl font-bold text-[#111827] font-syne tracking-tight">{stat.value}</h3>
              </div>
              <p className="text-[#6B7280] text-[10px] font-bold">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30">
            <CardTitle className="text-xl font-bold text-[#111827] font-syne flex items-center gap-3">
              <Activity size={20} className="text-[#F0562B]" />
              Usage by Feature
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usage || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.03)" vertical={false} />
                  <XAxis dataKey="feature" stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "20px" }}
                    cursor={{ fill: 'rgba(0,229,255,0.05)' }}
                  />
                  <Bar dataKey="call_count" fill="#F0562B" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30">
            <CardTitle className="text-xl font-bold text-[#111827] font-syne flex items-center gap-3">
              <Zap size={20} className="text-[#F59E0B]" />
              Response Time (ms)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usage || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.03)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "20px" }}
                  />
                  <Line type="monotone" dataKey="avg_response_time" stroke="#F59E0B" strokeWidth={4} dot={{ r: 6, fill: '#F59E0B' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-[#F5F6F8] border border-[rgba(0,229,255,0.05)] rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#F0562B]/10 flex items-center justify-center">
              <Cpu size={24} className="text-[#F0562B]" />
            </div>
            <h4 className="text-[#111827] font-bold text-lg">Model Efficiency</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280]">Claude 3.5 Sonnet</span>
              <span className="text-[#12805B] font-bold">98.2%</span>
            </div>
            <div className="h-2 w-full bg-[#FAF9F7] rounded-full overflow-hidden">
              <div className="h-full bg-[#12805B] w-[98%]"></div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#F5F6F8] border border-[rgba(0,229,255,0.05)] rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Sparkles size={24} className="text-[#F59E0B]" />
            </div>
            <h4 className="text-[#111827] font-bold text-lg">Token Velocity</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280]">Tokens/Sec</span>
              <span className="text-[#F59E0B] font-bold">142.5</span>
            </div>
            <div className="h-2 w-full bg-[#FAF9F7] rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B] w-[75%]"></div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#F5F6F8] border border-[rgba(0,229,255,0.05)] rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#C2410C]/10 flex items-center justify-center">
              <BarChart3 size={24} className="text-[#C2410C]" />
            </div>
            <h4 className="text-[#111827] font-bold text-lg">API Health</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280]">Uptime</span>
              <span className="text-[#C2410C] font-bold">99.99%</span>
            </div>
            <div className="h-2 w-full bg-[#FAF9F7] rounded-full overflow-hidden">
              <div className="h-full bg-[#C2410C] w-[99.9%]"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIUsagePage;
