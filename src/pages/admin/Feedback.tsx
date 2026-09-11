import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, User, Clock, 
  CheckCircle2, AlertCircle, Trash2, 
  Filter, Bug, Sparkles, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeedbackPage = () => {
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast.success("Feedback status updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast.success("Feedback removed");
    }
  });

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'bug': return <Bug size={16} className="text-[#DC2626]" />;
      case 'feature': return <Sparkles size={16} className="text-[#F59E0B]" />;
      default: return <MessageCircle size={16} className="text-[#F0562B]" />;
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[#111827] font-syne uppercase tracking-tight">User Feedback</h3>
          <p className="text-[#6B7280] text-sm font-medium">Hear what your users are saying about ProHired</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[rgba(0,229,255,0.12)] bg-[#FFFFFF] text-[#111827] hover:bg-[#F0562B]/10 rounded-xl font-bold gap-2">
            <Filter size={18} />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {feedback?.map((f) => (
          <Card key={f.id} className={cn(
            "bg-[#FFFFFF] border rounded-[2rem] overflow-hidden transition-all group shadow-xl",
            f.status === 'resolved' ? "border-[rgba(0,229,255,0.05)] opacity-80" : "border-[rgba(0,229,255,0.15)] hover:border-[#F0562B]/30"
          )}>
            <CardHeader className="p-7 pb-4 flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-2xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.05)]",
                  f.type === 'bug' ? "text-[#DC2626]" : f.type === 'feature' ? "text-[#F59E0B]" : "text-[#F0562B]"
                )}>
                  <TypeIcon type={f.type} />
                </div>
                <div>
                  <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5",
                    f.type === 'bug' ? "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20" : 
                    f.type === 'feature' ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" : 
                    "bg-[#F0562B]/10 text-[#F0562B] border-[#F0562B]/20"
                  )}>
                    {f.type}
                  </Badge>
                  <p className="text-[#6B7280] text-[10px] font-bold mt-1 uppercase tracking-widest">{new Date(f.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {f.status === 'resolved' && <CheckCircle2 size={20} className="text-[#12805B]" />}
            </CardHeader>
            <CardContent className="p-7 pt-2 space-y-6">
              <p className="text-[#111827] text-[15px] font-medium leading-relaxed italic">
                "{f.message}"
              </p>
              
              <div className="pt-6 border-t border-[rgba(0,229,255,0.03)] flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#6B7280]" />
                  <span className="text-[#111827] text-sm font-bold">{f.email || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#6B7280] font-bold uppercase tracking-widest pl-5">
                  <Clock size={12} />
                  {new Date(f.created_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {f.status === 'open' ? (
                  <Button 
                    className="flex-1 h-12 bg-[#F0562B]/10 text-[#F0562B] border border-[#F0562B]/20 hover:bg-[#F0562B] hover:text-[#FAF9F7] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    onClick={() => resolveMutation.mutate({ id: f.id, status: 'resolved' })}
                  >
                    Mark Resolved
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 h-12 bg-[#FAF9F7] text-[#6B7280] border border-[rgba(0,229,255,0.05)] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    onClick={() => resolveMutation.mutate({ id: f.id, status: 'open' })}
                  >
                    Reopen
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 text-[#6B7280] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl"
                  onClick={() => {
                    if(confirm("Delete feedback?")) deleteMutation.mutate(f.id);
                  }}
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedback?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 rounded-full bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)]">
            <MessageSquare size={48} className="text-[#6B7280] opacity-20" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[#111827] font-bold text-lg">No feedback yet</h4>
            <p className="text-[#6B7280] text-sm">Once users submit feedback, they will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
