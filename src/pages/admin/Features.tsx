import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeaturesPage = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["admin-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("config")
        .eq("id", "featureFlags")
        .single();
      
      if (error) throw error;
      return data.config as any;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const { error } = await supabase
        .from("app_config")
        .update({ config: newConfig })
        .eq("id", "featureFlags");
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-features"] });
      toast.success("Feature flags updated successfully");
    }
  });

  const handleToggle = (plan: "free" | "pro", feature: string) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig[plan][feature] = !newConfig[plan][feature];
    updateMutation.mutate(newConfig);
  };

  const handleLimitChange = (limit: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.free.resumeLimit = limit;
    updateMutation.mutate(newConfig);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  const FeatureItem = ({ plan, feature, label, description, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F7]/40 border border-[rgba(0,229,255,0.03)] hover:border-[rgba(0,229,255,0.1)] transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-lg", plan === 'pro' ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#F0562B]/10 text-[#F0562B]")}>
          <Icon size={18} />
        </div>
        <div>
          <Label className="text-[#111827] font-bold text-sm cursor-pointer">{label}</Label>
          <p className="text-[#6B7280] text-xs">{description}</p>
        </div>
      </div>
      <Switch 
        checked={config?.[plan]?.[feature]} 
        onCheckedChange={() => handleToggle(plan, feature)}
        className="data-[state=checked]:bg-[#12805B]"
      />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[#111827] font-syne uppercase tracking-tight">Feature Control</h3>
          <p className="text-[#6B7280] text-sm font-medium">Manage platform capabilities for different tiers in real-time</p>
        </div>
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="text-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] font-black uppercase tracking-widest">Live Updates Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Plan Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Shield size={24} className="text-[#F0562B]" />
            <h4 className="text-xl font-bold text-[#111827] font-syne">Free Plan Toggles</h4>
          </div>
          
          <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2rem] overflow-hidden shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <FeatureItem plan="free" feature="resumeRewrite" label="AI Resume Rewrite" description="Allow AI to optimize resume content" icon={Sparkles} />
              <FeatureItem plan="free" feature="atsAnalysis" label="ATS Deep Analysis" description="Score and breakdown resume quality" icon={Zap} />
              <FeatureItem plan="free" feature="jobMatchesView" label="AI Job Matching" description="Find jobs based on resume content" icon={CheckCircle2} />
              <FeatureItem plan="free" feature="interviewPrep" label="Interview Prep" description="Generate AI interview questions" icon={Zap} />
              <FeatureItem plan="free" feature="pdfDownload" label="PDF Export" description="Download resume as PDF" icon={CheckCircle2} />
              
              <div className="mt-6 p-6 rounded-2xl bg-[#FAF9F7] border border-[rgba(0,229,255,0.08)]">
                <Label className="text-[#6B7280] text-[10px] uppercase font-bold tracking-[0.2em]">Resume Limit</Label>
                <div className="flex items-center gap-4 mt-3">
                  <Input 
                    type="number" 
                    value={config?.free?.resumeLimit} 
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                    className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] text-2xl font-bold h-14 rounded-xl w-32"
                  />
                  <div className="flex-1">
                    <p className="text-[#111827] text-sm font-bold">Files allowed</p>
                    <p className="text-[#6B7280] text-xs">Maximum resumes a free user can create</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro Plan Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Shield size={24} className="text-[#F59E0B]" />
            <h4 className="text-xl font-bold text-[#111827] font-syne">Pro Plan Toggles</h4>
          </div>
          
          <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <FeatureItem plan="pro" feature="resumeRewrite" label="AI Resume Rewrite" description="Premium rewriting capabilities" icon={Sparkles} />
              <FeatureItem plan="pro" feature="atsAnalysis" label="ATS Deep Analysis" description="Unlimited detailed scoring" icon={Zap} />
              <FeatureItem plan="pro" feature="jobMatchesView" label="AI Job Matching" description="Real-time premium job links" icon={CheckCircle2} />
              <FeatureItem plan="pro" feature="interviewPrep" label="Interview Prep" description="Unlimited prep sessions" icon={Zap} />
              <FeatureItem plan="pro" feature="pdfDownload" label="PDF Export" description="High quality PDF downloads" icon={CheckCircle2} />
              <FeatureItem plan="pro" feature="docxDownload" label="DOCX Export" description="Download as Word document" icon={CheckCircle2} />
              
              <div className="mt-6 p-6 rounded-3xl bg-[#F59E0B]/5 border border-[#F59E0B]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[#F59E0B] font-bold text-sm">Unlimited Mode</h5>
                    <p className="text-[#6B7280] text-xs">Pro users have 999 limit by default</p>
                  </div>
                  <CheckCircle2 className="text-[#F59E0B]" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      <Card className="bg-[#F5F6F8]/50 border border-[rgba(0,229,255,0.05)] rounded-3xl p-8 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-bold text-[#111827] font-syne">Experience Preview</h4>
            <p className="text-[#6B7280] text-sm">See how the application looks for different user tiers with current settings</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-[#F0562B]/10 text-[#F0562B] border border-[#F0562B]/20 h-12 px-8 rounded-xl font-bold">
              Preview Free App
            </Button>
            <Button className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 h-12 px-8 rounded-xl font-bold font-syne">
              Preview Pro App
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeaturesPage;
