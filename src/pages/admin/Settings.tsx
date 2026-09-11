import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, Save, Globe, 
  Mail, Shield, Bell, 
  Database, RefreshCcw, HardDrive
} from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("config")
        .eq("id", "settings")
        .single();
      
      if (error) throw error;
      return data.config as any;
    }
  });

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const { error } = await supabase
        .from("app_config")
        .update({ config: newConfig })
        .eq("id", "settings");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved successfully");
    }
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-[#111827] font-syne uppercase tracking-tight">App Configuration</h3>
          <p className="text-[#6B7280] text-sm font-medium">Global parameters and system behavior control</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="h-14 bg-[#F0562B] hover:bg-[#F0562B]/90 text-[#FAF9F7] font-black uppercase tracking-widest px-8 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.2)]"
        >
          <Save size={20} className="mr-2" />
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Nav */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#F0562B]/10 text-[#F0562B] border border-[#F0562B]/20 font-bold text-sm">
            <Globe size={18} /> General Settings
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[#6B7280] hover:bg-[#FFFFFF] border border-transparent font-bold text-sm transition-all">
            <Shield size={18} /> Security & Auth
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[#6B7280] hover:bg-[#FFFFFF] border border-transparent font-bold text-sm transition-all">
            <Mail size={18} /> Email Templates
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[#6B7280] hover:bg-[#FFFFFF] border border-transparent font-bold text-sm transition-all">
            <Database size={18} /> Database Maintenance
          </button>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30">
              <CardTitle className="text-xl font-bold text-[#111827] font-syne">General Branding</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest ml-1">Application Name</Label>
                  <Input 
                    value={formData.appName} 
                    onChange={(e) => handleChange('appName', e.target.value)}
                    className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest ml-1">Support Email</Label>
                  <Input 
                    value={formData.supportEmail} 
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest ml-1">Tagline</Label>
                <Input 
                  value={formData.appTagline} 
                  onChange={(e) => handleChange('appTagline', e.target.value)}
                  className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] h-12 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30">
              <CardTitle className="text-xl font-bold text-[#111827] font-syne">System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-[#DC2626]/5 border border-[#DC2626]/10">
                <div className="space-y-1">
                  <Label className="text-[#111827] font-bold text-base">Maintenance Mode</Label>
                  <p className="text-[#6B7280] text-xs">Instantly disable public access to the platform</p>
                </div>
                <Switch 
                  checked={formData.maintenanceMode} 
                  onCheckedChange={(val) => handleChange('maintenanceMode', val)}
                  className="data-[state=checked]:bg-[#DC2626]"
                />
              </div>

              {formData.maintenanceMode && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest ml-1">Maintenance Message</Label>
                  <Input 
                    value={formData.maintenanceMessage} 
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    className="bg-[#F5F6F8] border-[#DC2626]/20 text-[#111827] h-12 rounded-xl"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-[rgba(0,229,255,0.05)] bg-[#F5F6F8]/30">
              <CardTitle className="text-xl font-bold text-[#111827] font-syne">Pricing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-1 space-y-2">
                  <Label className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest ml-1">Pro Plan Monthly Price (₹)</Label>
                  <Input 
                    type="number"
                    value={formData.proPrice} 
                    onChange={(e) => handleChange('proPrice', parseInt(e.target.value))}
                    className="bg-[#F5F6F8] border-[rgba(0,229,255,0.1)] text-[#111827] text-xl font-bold h-14 rounded-xl"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#111827] font-bold text-sm">Launch Promo</Label>
                    <Switch 
                      checked={formData.showLaunchBanner} 
                      onCheckedChange={(val) => handleChange('showLaunchBanner', val)}
                    />
                  </div>
                  <p className="text-[#6B7280] text-[10px] leading-relaxed">Show "Introductory Offer" badge on pricing page</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center p-12 space-y-6 rounded-[2.5rem] bg-[#DC2626]/5 border border-[#DC2626]/10 mt-10">
            <HardDrive size={48} className="text-[#DC2626] opacity-50" />
            <div className="text-center space-y-2">
              <h4 className="text-[#DC2626] font-black uppercase tracking-widest text-sm">Danger Zone</h4>
              <p className="text-[#6B7280] text-xs">These actions are irreversible and will impact all users</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/10 h-12 px-8 rounded-xl font-bold">
                Clear System Cache
              </Button>
              <Button variant="outline" className="border-[#DC2626]/20 bg-[#DC2626] text-white hover:bg-[#DC2626]/90 h-12 px-8 rounded-xl font-bold">
                Wipe User Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
