import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  RadioGroup, RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, Send, Clock, 
  Target, Info, AlertTriangle, 
  CheckCircle, Zap, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AnnouncementsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [type, setType] = useState("info");
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase
        .from("announcements")
        .insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement broadcasted successfully");
      setTitle("");
      setMessage("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement removed");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    sendMutation.mutate({
      title,
      message,
      target,
      type,
      status: "sent",
      sent_at: new Date().toISOString()
    });
  };

  const TypeIcon = ({ type, size = 18 }: any) => {
    switch (type) {
      case 'info': return <Info size={size} className="text-blue-600" />;
      case 'warning': return <AlertTriangle size={size} className="text-amber-700" />;
      case 'success': return <CheckCircle size={size} className="text-green-400" />;
      case 'promo': return <Zap size={size} className="text-orange-500" />;
      default: return null;
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-1 bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] shadow-2xl h-fit">
          <CardHeader className="border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30 p-8">
            <CardTitle className="text-xl font-bold text-[#111827] font-syne flex items-center gap-3">
              <Megaphone size={24} className="text-[#F0562B]" />
              New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Title</Label>
                <Input 
                  placeholder="App Update v2.0" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-14 rounded-2xl focus:ring-[#F0562B]/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Message</Label>
                <Textarea 
                  placeholder="Enter broadcast message (max 300 chars)..." 
                  maxLength={300}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] min-h-[120px] rounded-2xl focus:ring-[#F0562B]/20 resize-none"
                />
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#6B7280]">{message.length}/300</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Target Audience</Label>
                <RadioGroup value={target} onValueChange={setTarget} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-[#FAF9F7] p-3 rounded-xl border border-[rgba(0,229,255,0.05)] cursor-pointer">
                    <RadioGroupItem value="all" id="t-all" className="border-[#F0562B] text-[#F0562B]" />
                    <Label htmlFor="t-all" className="text-xs font-bold text-[#111827] cursor-pointer">All Users</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#FAF9F7] p-3 rounded-xl border border-[rgba(0,229,255,0.05)] cursor-pointer">
                    <RadioGroupItem value="free" id="t-free" className="border-[#F0562B] text-[#F0562B]" />
                    <Label htmlFor="t-free" className="text-xs font-bold text-[#111827] cursor-pointer">Free Tier</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#FAF9F7] p-3 rounded-xl border border-[rgba(0,229,255,0.05)] cursor-pointer">
                    <RadioGroupItem value="pro" id="t-pro" className="border-[#F0562B] text-[#F0562B]" />
                    <Label htmlFor="t-pro" className="text-xs font-bold text-[#111827] cursor-pointer">Pro Only</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4 border-t border-[rgba(0,229,255,0.05)]">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['info', 'success', 'warning', 'promo'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                        type === t 
                          ? "bg-[#F0562B]/10 border-[#F0562B] text-[#111827] shadow-[0_0_15px_rgba(0,229,255,0.1)]" 
                          : "bg-[#FAF9F7] border-[rgba(0,229,255,0.05)] text-[#6B7280] hover:border-[rgba(0,229,255,0.2)]"
                      )}
                    >
                      <TypeIcon type={t} size={14} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={sendMutation.isPending}
                className="w-full h-14 bg-[#F0562B] hover:bg-[#F0562B]/90 text-[#FAF9F7] font-black uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.2)]"
              >
                {sendMutation.isPending ? "Broadcasting..." : "Broadcast Now"}
                <Send size={18} className="ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-[#111827] font-syne flex items-center gap-2">
              <Clock size={20} className="text-[#6B7280]" />
              Announcement History
            </h3>
            <Badge className="bg-[#FAF9F7] text-[#6B7280] border border-[rgba(0,229,255,0.12)]">
              {announcements?.length || 0} Total
            </Badge>
          </div>

          <div className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-[#F5F6F8]/40">
                <TableRow className="border-b border-[rgba(0,229,255,0.05)] hover:bg-transparent">
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.2em] py-6 px-8">Content</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.2em] py-6">Audience</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.2em] py-6">Status</TableHead>
                  <TableHead className="text-[#6B7280] font-black uppercase text-[10px] tracking-[0.2em] py-6 text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements?.map((ann) => (
                  <TableRow key={ann.id} className="border-b border-[rgba(0,229,255,0.02)] hover:bg-[#F5F6F8]/50 group transition-all">
                    <TableCell className="py-6 px-8 max-w-[300px]">
                      <div className="flex items-start gap-4">
                        <div className="mt-1"><TypeIcon type={ann.type} /></div>
                        <div>
                          <p className="text-[#111827] font-bold text-sm leading-tight mb-1">{ann.title}</p>
                          <p className="text-[#6B7280] text-xs line-clamp-2">{ann.message}</p>
                          <p className="text-[10px] font-bold text-[#6B7280] mt-2 uppercase tracking-widest">{new Date(ann.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 text-[#111827] text-xs font-bold uppercase tracking-widest">
                        <Target size={14} className="text-[#F0562B]" />
                        {ann.target}
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        ann.status === 'sent' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-amber-50 text-amber-700 border border-amber-200"
                      )}>
                        {ann.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-right px-8">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-[#6B7280] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl"
                        onClick={() => {
                          if(confirm("Delete announcement?")) deleteMutation.mutate(ann.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
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

export default AnnouncementsPage;
