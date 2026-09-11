import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, Plus, Search, 
  Trash2, Copy, CheckCircle2, 
  Clock, Users, Percent
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PromoCodesPage = () => {
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [maxUses, setMaxUses] = useState("");
  const queryClient = useQueryClient();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase
        .from("promo_codes")
        .insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Promo code created successfully");
      setCode("");
      setDiscountValue("");
      setMaxUses("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Promo code deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    createMutation.mutate({
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: parseInt(maxUses) || 0,
      used_count: 0,
      status: "active"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard");
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Create Form */}
        <Card className="lg:col-span-1 bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] shadow-2xl h-fit">
          <CardHeader className="border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30 p-8">
            <CardTitle className="text-xl font-bold text-[#111827] font-syne flex items-center gap-3">
              <Ticket size={24} className="text-[#F0562B]" />
              Create Code
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Promo Code</Label>
                <Input 
                  placeholder="OFF50" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-14 rounded-2xl focus:ring-[#F0562B]/20 font-mono text-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Discount Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-xs font-bold",
                      discountType === "percentage" ? "bg-[#F0562B]/10 border-[#F0562B] text-[#111827]" : "bg-[#FAF9F7] border-[rgba(0,229,255,0.05)] text-[#6B7280]"
                    )}
                  >Percentage (%)</button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("flat")}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-xs font-bold",
                      discountType === "flat" ? "bg-[#F0562B]/10 border-[#F0562B] text-[#111827]" : "bg-[#FAF9F7] border-[rgba(0,229,255,0.05)] text-[#6B7280]"
                    )}
                  >Flat (₹)</button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Value</Label>
                <Input 
                  type="number"
                  placeholder={discountType === 'percentage' ? "50" : "100"} 
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-14 rounded-2xl focus:ring-[#F0562B]/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Max Redemptions</Label>
                <Input 
                  type="number"
                  placeholder="0 for unlimited" 
                  value={maxUses} 
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-14 rounded-2xl focus:ring-[#F0562B]/20"
                />
              </div>

              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full h-14 bg-[#F0562B] hover:bg-[#F0562B]/90 text-[#FAF9F7] font-black uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.2)]"
              >
                {createMutation.isPending ? "Generating..." : "Generate Code"}
                <Plus size={18} className="ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-[#111827] font-syne flex items-center gap-2">
              <Ticket size={20} className="text-[#6B7280]" />
              Active Promo Codes
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <Input className="pl-10 h-10 bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] text-[#111827] rounded-xl text-xs" placeholder="Search codes..." />
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-[#F5F6F8]/40">
                <TableRow className="border-b border-[rgba(0,229,255,0.05)] hover:bg-transparent">
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 px-10">Code Name</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Discount</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Redemptions</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Status</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 text-right px-10">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes?.map((pc) => (
                  <TableRow key={pc.id} className="border-b border-[rgba(0,229,255,0.02)] hover:bg-[#F5F6F8]/60 transition-all group">
                    <TableCell className="py-8 px-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[rgba(0,229,255,0.05)] group-hover:border-[#F0562B]/30 transition-all">
                          <Percent size={18} className="text-[#F0562B]" />
                        </div>
                        <div>
                          <p className="text-[#111827] font-black text-xl font-mono leading-none">{pc.code}</p>
                          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mt-2">Created: {new Date(pc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex flex-col">
                        <span className="text-[#111827] font-black text-2xl font-syne">
                          {pc.discount_type === 'percentage' ? `${pc.discount_value}%` : `₹${pc.discount_value}`}
                        </span>
                        <span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">OFF TOTAL BILL</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="space-y-2 w-32">
                        <div className="flex justify-between items-end">
                          <span className="text-[#111827] font-bold text-sm">{pc.used_count}</span>
                          <span className="text-[#6B7280] text-[10px] font-bold">/ {pc.max_uses || '∞'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#FAF9F7] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#F0562B] rounded-full" 
                            style={{ width: pc.max_uses ? `${(pc.used_count / pc.max_uses) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <Badge className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        pc.status === 'active' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {pc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-8 text-right px-10">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 text-[#6B7280] hover:text-[#F0562B] hover:bg-[#F0562B]/10 rounded-2xl"
                          onClick={() => copyToClipboard(pc.code)}
                        >
                          <Copy size={20} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 text-[#6B7280] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-2xl"
                          onClick={() => {
                            if(confirm("Delete promo code?")) deleteMutation.mutate(pc.id);
                          }}
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodesPage;
