import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, User, HardDrive, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AuditLogsPage = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[#111827] font-syne uppercase tracking-tight">System Audit Log</h3>
          <p className="text-[#6B7280] text-sm font-medium">Tracking administrative actions and configuration changes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-10 h-12 bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] text-[#111827] rounded-xl w-64" placeholder="Search by action or email..." />
          </div>
          <Button variant="outline" className="h-12 border-[rgba(0,229,255,0.12)] bg-[#FFFFFF] text-[#111827] rounded-xl px-6 font-bold">
            <Filter size={18} className="mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#F5F6F8]/40">
            <TableRow className="border-b border-[rgba(0,229,255,0.05)] hover:bg-transparent">
              <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 px-10">Admin Identity</TableHead>
              <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Action Taken</TableHead>
              <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Target Entity</TableHead>
              <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8">Timestamp</TableHead>
              <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.25em] py-8 text-right px-10">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id} className="border-b border-[rgba(0,229,255,0.02)] hover:bg-[#F5F6F8]/50 transition-all group">
                <TableCell className="py-7 px-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#F0562B]/10 flex items-center justify-center border border-[#F0562B]/20">
                      <Shield size={18} className="text-[#F0562B]" />
                    </div>
                    <div>
                      <p className="text-[#111827] font-bold text-sm">{log.admin_email}</p>
                      <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Admin Role</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-7 font-bold text-[#111827] text-base">{log.action}</TableCell>
                <TableCell className="py-7">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#6B7280]" />
                    <span className="text-[#6B7280] text-sm font-medium">{log.target_email || 'System'}</span>
                  </div>
                </TableCell>
                <TableCell className="py-7">
                  <div className="flex items-center gap-2 text-[#6B7280] text-sm">
                    <Clock size={16} />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="py-7 text-right px-10">
                  <Badge className="bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-inner">
                    Success
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {logs?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 rounded-3xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.05)]">
              <HardDrive size={48} className="text-[#6B7280] opacity-20" />
            </div>
            <p className="text-[#6B7280] text-sm font-medium">No system actions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
