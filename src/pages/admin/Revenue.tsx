import React, { useState } from "react";
import { 
  IndianRupee, TrendingUp, Users, 
  Download, Eye, RotateCcw,
  Calendar, CreditCard
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MetricCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-3xl p-7 shadow-2xl relative group overflow-hidden transition-all hover:border-[rgba(0,229,255,0.3)]">
    <div className={cn("absolute -right-6 -top-6 p-10 opacity-5 group-hover:opacity-10 transition-all duration-500 rotate-12 group-hover:rotate-0 scale-125", color)}>
      <Icon size={80} />
    </div>
    <div className="space-y-6 relative z-10">
      <div className={cn("p-4 w-fit rounded-2xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.05)] shadow-inner", color)}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[#6B7280] text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-3">{title}</p>
        <h3 className="text-4xl font-bold text-[#111827] font-syne tracking-tight">{value}</h3>
      </div>
      <div className="flex items-center gap-3 bg-[#FAF9F7]/40 p-2 rounded-xl w-fit border border-[rgba(0,229,255,0.03)]">
        <span className="text-[#12805B] text-[11px] font-black flex items-center gap-1">
          <TrendingUp size={14} strokeWidth={3} /> +12.5%
        </span>
        <span className="text-[#6B7280] text-[11px] font-bold">{sub}</span>
      </div>
    </div>
  </Card>
);

const RevenuePage = () => {
  const [activeTab, setActiveTab] = useState("month");

  const { data: txns, isLoading } = useQuery({
    queryKey: ["admin-revenue-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const stats = {
    total: (txns?.filter(t => t.status === 'success').reduce((acc, curr) => acc + curr.amount, 0) || 0) / 100,
    monthly: (txns?.filter(t => t.status === 'success' && new Date(t.created_at).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.amount, 0) || 0) / 100,
    proCount: txns?.filter(t => t.status === 'success').length || 0,
  };

  // Daily revenue series for the chart
  const chartData = Object.entries(
    (txns || [])
      .filter((t) => t.status === "success")
      .reduce<Record<string, number>>((acc, t) => {
        const day = new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        acc[day] = (acc[day] || 0) + t.amount / 100;
        return acc;
      }, {})
  ).map(([date, revenue]) => ({ date, revenue }));

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Earnings" value={`₹${stats.total.toLocaleString()}`} sub="Lifetime" icon={IndianRupee} color="text-[#12805B]" />
        <MetricCard title="This Month" value={`₹${stats.monthly.toLocaleString()}`} sub={new Date().toLocaleDateString('en-IN', { month: 'long', year: '2-digit' })} icon={Calendar} color="text-[#F0562B]" />
        <MetricCard title="Projected MRR" value="₹38.2K" sub="Recurrent" icon={TrendingUp} color="text-[#C2410C]" />
        <MetricCard title="Active Pro" value={stats.proCount} sub="Users" icon={Users} color="text-[#F59E0B]" />
      </div>

      {/* Analytics Graph */}
      <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="bg-[#F5F6F8]/40 border-b border-[rgba(0,229,255,0.05)] px-10 py-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#111827] font-syne flex items-center gap-3">
              <div className="h-8 w-1.5 bg-[#F0562B] rounded-full"></div>
              Revenue Analytics
            </CardTitle>
            <p className="text-[#6B7280] text-sm font-medium pl-4">Platform monetary flow and growth projection</p>
          </div>
          <div className="flex bg-[#FAF9F7] p-1.5 rounded-2xl border border-[rgba(0,229,255,0.08)] shadow-inner w-fit">
            {["today", "week", "month", "all time"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                  activeTab === tab ? "bg-[#F0562B] text-[#FAF9F7] shadow-[0_0_20px_rgba(0,229,255,0.3)]" : "text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0562B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F0562B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(0,229,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={20} />
                <YAxis stroke="#6B7280" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tickMargin={20} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "20px", color: "#111827", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)", padding: '16px' }}
                  itemStyle={{ color: "#F0562B", fontWeight: "bold", fontSize: '14px' }}
                  cursor={{ stroke: '#F0562B', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F0562B" strokeWidth={5} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Records */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#111827] font-syne uppercase tracking-tight">Recent Transactions</h3>
            <p className="text-[#6B7280] text-sm font-medium">Real-time payment verification logs</p>
          </div>
          <Button variant="outline" className="border-[rgba(0,229,255,0.12)] bg-[#FFFFFF] text-[#111827] hover:bg-[#F0562B] hover:text-[#FAF9F7] hover:border-[#F0562B] gap-3 h-14 rounded-2xl font-black text-xs uppercase tracking-widest px-8 transition-all shadow-2xl">
            <Download size={20} /> Export Report
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden xl:block bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-[#F5F6F8]/40">
              <TableRow className="border-b border-[rgba(0,229,255,0.05)] hover:bg-transparent">
                <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 px-10">Transaction Reference</TableHead>
                <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">User Account</TableHead>
                <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Amount Paid</TableHead>
                <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Status</TableHead>
                <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 text-right px-10">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns?.map((tx) => (
                <TableRow key={tx.id} className="border-b border-[rgba(0,229,255,0.02)] hover:bg-[#F5F6F8]/60 transition-all group">
                  <TableCell className="py-6 px-10 font-mono text-[11px] text-[#6B7280] font-bold group-hover:text-[#111827]">{tx.razorpay_payment_id || tx.id}</TableCell>
                  <TableCell className="py-6 font-bold text-[#111827] text-[15px]">{tx.profiles?.email || 'Unknown'}</TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="text-[#111827] font-black text-lg leading-tight">₹{tx.amount / 100}</span>
                      <span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">{tx.plan}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-inner",
                      tx.status === 'success' ? "bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20" : 
                      tx.status === 'refunded' ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" :
                      "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                    )}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-right px-10">
                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-[#6B7280] hover:text-[#F0562B] hover:bg-[#F0562B]/10 rounded-2xl">
                        <Eye size={22} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-[#6B7280] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-2xl">
                        <RotateCcw size={22} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden space-y-5">
          {txns?.map((tx) => (
            <Card key={tx.id} className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] overflow-hidden shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[rgba(0,229,255,0.05)]">
                    <CreditCard className="text-[#F0562B]" size={20} />
                  </div>
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    tx.status === 'success' ? "bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20" : 
                    tx.status === 'refunded' ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" :
                    "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                  )}>
                    {tx.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[#111827] font-black text-xl tracking-tight leading-none mb-2">{tx.profiles?.email || 'Unknown'}</p>
                  <div className="flex items-center gap-3 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                    <span>{tx.id}</span>
                    <span className="h-1 w-1 bg-[#6B7280]/40 rounded-full"></span>
                    <span>{new Date(tx.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-[rgba(0,229,255,0.05)]">
                  <div className="flex flex-col">
                    <span className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest">Amount</span>
                    <span className="text-3xl font-black text-[#111827]">₹{tx.amount / 100}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="h-12 bg-[#F0562B]/10 text-[#F0562B] border border-[#F0562B]/20 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 transition-all hover:bg-[#F0562B] hover:text-[#FAF9F7]">Inspect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
