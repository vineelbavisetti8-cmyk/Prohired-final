import React, { useEffect, useRef, useState } from "react";
import {
  Search, FileText, Trash2, TrendingUp, Activity,
  ShieldAlert, Sparkles, Loader2, CheckCircle2, AlertTriangle,
  ClipboardList, RefreshCw, ChevronDown, LayoutList,
  BarChart3, Tag, Lightbulb, User, BookOpen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AuditDrawback { title: string; severity: "critical" | "warning" | "minor"; detail: string; fix: string }
interface AuditReport {
  summary: string;
  verdict: string;
  overallScore: number;
  drawbacks: AuditDrawback[];
  missingEssentials: { item: string; why: string }[];
  missingKeywords: string[];
  sections: { name: string; present: boolean; quality: number; note: string }[];
  recommendations: string[];
}

async function callAudit(body: Record<string, unknown>) {
  const session = Cookies.get("admin_session") || "";
  const { data, error } = await supabase.functions.invoke("admin-resume-audit", {
    body,
    headers: { "x-admin-session": session },
  });
  if (error) {
    let msg = error.message;
    try {
      const ctx = (error as any).context;
      if (ctx?.json) msg = (await ctx.json())?.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

/* ─────────────────────────────────────────────────────── */
/*  Reusable full-detail Audit Report Block               */
/* ─────────────────────────────────────────────────────── */
const AuditReportBlock = ({
  resume,
  auditingId,
  onAudit,
  onDelete,
  compact = false,
}: {
  resume: any;
  auditingId: string | null;
  onAudit: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) => {
  const report = resume.audit_report as AuditReport | null;
  const isRunning = auditingId === resume.id;
  const scoreColor =
    (report?.overallScore ?? 0) > 75 ? "#12805B" :
    (report?.overallScore ?? 0) > 50 ? "#F59E0B" : "#DC2626";
  const atsColor =
    (resume.ats_score ?? 0) > 75 ? "#12805B" :
    (resume.ats_score ?? 0) > 50 ? "#F59E0B" : "#DC2626";

  return (
    <div className={cn(
      "bg-[#FFFFFF] border border-[rgba(0,229,255,0.10)] rounded-2xl overflow-hidden",
      compact ? "" : "shadow-xl"
    )}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#F5F6F8]/60 border-b border-[rgba(0,229,255,0.07)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-[#C2410C]/15 flex items-center justify-center shrink-0">
            <User size={16} className="text-[#C2410C]" />
          </div>
          <div className="min-w-0">
            <p className="text-[#111827] font-bold text-sm truncate">
              {resume.profiles?.email || "Unknown user"}
            </p>
            <p className="text-[#6B7280] text-[10px] font-mono truncate">
              {resume.file_name || resume.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-3 py-1 rounded-lg text-xs font-black border"
            style={{ color: atsColor, borderColor: atsColor + "33", backgroundColor: atsColor + "15" }}
          >
            ATS {resume.ats_score ?? 0}%
          </span>
          <span className="hidden md:block text-[#6B7280] text-[10px] font-medium">
            {new Date(resume.created_at).toLocaleDateString()}
          </span>
          <Button
            disabled={isRunning}
            onClick={() => onAudit(resume.id)}
            size="sm"
            className="h-8 gap-1.5 bg-[#C2410C]/90 hover:bg-[#C2410C] text-white rounded-lg text-xs font-bold px-3"
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : report ? <RefreshCw size={13} /> : <Sparkles size={13} />}
            {report ? "Re-Audit" : "Generate"}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-[#6B7280] hover:text-[#DC2626]"
            onClick={() => { if (confirm("Delete this resume?")) onDelete(resume.id); }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {isRunning && !report ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={28} className="animate-spin text-[#F0562B]" />
            <p className="text-[#6B7280] text-sm font-semibold">Running AI audit…</p>
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <ClipboardList size={36} className="text-[#6B7280]/40" />
            <p className="text-[#111827] font-bold text-sm">No audit report yet</p>
            <p className="text-[#6B7280] text-xs max-w-xs">
              Click <strong>Generate</strong> to run the AI audit and see drawbacks, missing keywords, and recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Score + Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1 flex flex-col items-center justify-center bg-[#FAF9F7] rounded-xl border border-[rgba(0,229,255,0.06)] p-5">
                <p className="text-[#6B7280] text-[9px] font-black uppercase tracking-[0.18em] mb-1">Audit Score</p>
                <p className="text-5xl font-black leading-none" style={{ color: scoreColor }}>
                  {report.overallScore ?? 0}
                </p>
                <p className="text-[#6B7280] text-[9px] uppercase font-bold tracking-widest mt-2">{report.verdict}</p>
                {resume.audited_at && (
                  <p className="text-[#6B7280]/50 text-[8px] mt-3 text-center">
                    {new Date(resume.audited_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="sm:col-span-3 bg-[#FAF9F7] rounded-xl border border-[rgba(0,229,255,0.06)] p-5">
                <h5 className="text-[#111827] font-bold text-sm mb-2 flex items-center gap-2">
                  <BookOpen size={14} className="text-[#F0562B]" /> Summary
                </h5>
                <p className="text-[#6B7280] text-sm leading-relaxed">{report.summary}</p>
              </div>
            </div>

            {/* Drawbacks */}
            {!!report.drawbacks?.length && (
              <div>
                <h5 className="text-[#111827] font-bold text-sm flex items-center gap-2 mb-3">
                  <ShieldAlert size={14} className="text-[#DC2626]" />
                  Drawbacks
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#DC2626]/15 text-[#DC2626] text-[9px] font-black">
                    {report.drawbacks.length}
                  </span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.drawbacks.map((d, i) => {
                    const col = d.severity === "critical" ? "#DC2626" : d.severity === "warning" ? "#F59E0B" : "#6B7280";
                    return (
                      <div key={i} className="bg-[#FAF9F7] rounded-xl border p-4" style={{ borderColor: col + "22" }}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={14} style={{ color: col }} className="mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[#111827] font-bold text-xs">{d.title}</p>
                              <span
                                className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase border"
                                style={{ color: col, borderColor: col + "33", backgroundColor: col + "1A" }}
                              >
                                {d.severity}
                              </span>
                            </div>
                            <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{d.detail}</p>
                            <p className="text-[#F0562B] text-xs mt-1.5">
                              <span className="font-bold">Fix: </span>{d.fix}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Coverage + Missing Essentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-[#111827] font-bold text-sm flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-[#C2410C]" /> Section Coverage
                </h5>
                <div className="space-y-2">
                  {report.sections?.map((s, i) => (
                    <div key={i} className="bg-[#FAF9F7] rounded-xl border border-[rgba(0,229,255,0.05)] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[#111827] text-xs font-bold">{s.name}</p>
                        <span className={cn("text-[10px] font-black", s.present ? "text-[#12805B]" : "text-[#DC2626]")}>
                          {s.present ? `${s.quality}%` : "Missing"}
                        </span>
                      </div>
                      {s.note && <p className="text-[#6B7280] text-[10px] mt-1">{s.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-[#111827] font-bold text-sm flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-[#F59E0B]" /> Missing Essentials
                </h5>
                {report.missingEssentials?.length ? (
                  <div className="space-y-2">
                    {report.missingEssentials.map((m, i) => (
                      <div key={i} className="bg-[#FAF9F7] rounded-xl border border-[#DC2626]/10 px-4 py-3">
                        <p className="text-[#DC2626] font-bold text-xs">{m.item}</p>
                        <p className="text-[#6B7280] text-[10px] mt-1">{m.why}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAF9F7] rounded-xl border border-[#12805B]/10 px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#12805B]" />
                    <p className="text-[#12805B] text-xs font-bold">All essentials present</p>
                  </div>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            {!!report.missingKeywords?.length && (
              <div>
                <h5 className="text-[#111827] font-bold text-sm flex items-center gap-2 mb-3">
                  <Tag size={14} className="text-[#F59E0B]" /> Missing Keywords
                </h5>
                <div className="flex flex-wrap gap-2">
                  {report.missingKeywords.map((k, i) => (
                    <Badge key={i} className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 py-1 px-3 text-[10px] font-bold">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {!!report.recommendations?.length && (
              <div>
                <h5 className="text-[#111827] font-bold text-sm flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-[#F0562B]" /> Recommendations
                </h5>
                <ul className="space-y-2">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#6B7280] text-xs leading-relaxed">
                      <CheckCircle2 size={13} className="text-[#12805B] mt-0.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  Main Page                                             */
/* ─────────────────────────────────────────────────────── */
const ResumesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "reports">("table");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const autoRunRef = useRef(false);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ["admin-resumes"],
    queryFn: async () => (await callAudit({ action: "list" })).resumes as any[],
  });

  const auditMutation = useMutation({
    mutationFn: async (id: string) => {
      setAuditingId(id);
      return await callAudit({ action: "audit", resumeId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resumes"] });
      toast.success("Audit report generated");
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setAuditingId(null),
  });

  useEffect(() => {
    if (!resumes || autoRunRef.current) return;
    const pending = resumes.filter((r: any) => !r.audit_report && r.status !== "processing").slice(0, 5);
    if (pending.length === 0) return;
    autoRunRef.current = true;
    (async () => {
      for (const r of pending) {
        try { setAuditingId(r.id); await callAudit({ action: "audit", resumeId: r.id }); } catch { /* skip */ }
      }
      setAuditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-resumes"] });
    })();
  }, [resumes, queryClient]);

  const deleteResumeMutation = useMutation({
    mutationFn: async (id: string) => { await callAudit({ action: "delete", resumeId: id }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resumes"] });
      toast.success("Resume deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredResumes = resumes?.filter(res => {
    const matchesSearch =
      (res.profiles?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      res.id.includes(searchTerm);
    const score = res.ats_score || 0;
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "low" && score <= 50) ||
      (scoreFilter === "medium" && score > 50 && score <= 75) ||
      (scoreFilter === "high" && score > 75);
    return matchesSearch && matchesScore;
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const ScoreBadge = ({ score }: { score: number }) => {
    const color = score > 75
      ? "bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20"
      : score > 50
      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
      : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20";
    return <Badge className={cn("px-3 py-1 font-bold", color)}>{score || 0}%</Badge>;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#F0562B]/20 border-t-[#F0562B] rounded-full animate-spin" />
    </div>
  );

  const auditedCount = resumes?.filter((r: any) => r.audit_report).length || 0;
  const pendingCount = (resumes?.length || 0) - auditedCount;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#C2410C]/10 text-[#C2410C]"><FileText size={20} /></div>
            <div>
              <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Total</p>
              <h3 className="text-2xl font-bold text-[#111827]">{resumes?.length || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#12805B]/10 text-[#12805B]"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Avg ATS</p>
              <h3 className="text-2xl font-bold text-[#111827]">
                {Math.round((resumes?.reduce((acc: number, curr: any) => acc + (curr.ats_score || 0), 0) || 0) / (resumes?.length || 1))}%
              </h3>
            </div>
          </div>
        </Card>
        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#F0562B]/10 text-[#F0562B]"><CheckCircle2 size={20} /></div>
            <div>
              <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Audited</p>
              <h3 className="text-2xl font-bold text-[#111827]">{auditedCount}</h3>
            </div>
          </div>
        </Card>
        <Card className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]"><Activity size={20} /></div>
            <div>
              <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-bold text-[#111827]">{pendingCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Controls Bar ── */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
          <Input
            placeholder="Search by user email or resume ID..."
            className="pl-10 bg-[#FFFFFF] border-[rgba(0,229,255,0.12)] text-[#111827] rounded-xl h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Score filter */}
          <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-[rgba(0,229,255,0.08)]">
            {["all", "low", "medium", "high"].map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                  scoreFilter === f ? "bg-[#F0562B] text-[#FAF9F7]" : "text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {/* View mode */}
          <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-[rgba(0,229,255,0.08)]">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5",
                viewMode === "table" ? "bg-[#C2410C] text-white" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <LayoutList size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode("reports")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5",
                viewMode === "reports" ? "bg-[#C2410C] text-white" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <ClipboardList size={13} /> All Reports
            </button>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  TABLE VIEW — inline expandable audit rows           */}
      {/* ═════════════════════════════════════════════════════ */}
      {viewMode === "table" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[#6B7280] text-xs">
              {filteredResumes?.length || 0} resume{filteredResumes?.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedRows(new Set(filteredResumes?.map((r: any) => r.id) || []))}
                className="text-[#F0562B] text-[10px] font-bold uppercase tracking-wider hover:underline"
              >
                Expand All
              </button>
              <span className="text-[#6B7280]">·</span>
              <button
                onClick={() => setExpandedRows(new Set())}
                className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider hover:text-[#111827]"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-3xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-[#F5F6F8]/40">
                <TableRow className="border-b border-[rgba(0,229,255,0.05)]">
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5 px-6 w-10" />
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5">User Email</TableHead>
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5">ATS Score</TableHead>
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5">Audit Status</TableHead>
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5">Date</TableHead>
                  <TableHead className="text-[#6B7280] font-bold uppercase text-[10px] tracking-[0.2em] py-5 text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResumes?.map((res) => {
                  const isExpanded = expandedRows.has(res.id);
                  const isRunning = auditingId === res.id;
                  return (
                    <React.Fragment key={res.id}>
                      <TableRow
                        className={cn(
                          "border-b border-[rgba(0,229,255,0.02)] hover:bg-[#F5F6F8]/40 cursor-pointer transition-colors",
                          isExpanded && "bg-[#F5F6F8]/30"
                        )}
                        onClick={() => toggleRow(res.id)}
                      >
                        <TableCell className="py-4 px-6">
                          <ChevronDown
                            size={16}
                            className={cn("text-[#6B7280] transition-transform duration-200", isExpanded && "rotate-180")}
                          />
                        </TableCell>
                        <TableCell className="py-4 font-bold text-[#111827] text-sm">
                          {res.profiles?.email || "Unknown"}
                        </TableCell>
                        <TableCell className="py-4">
                          <ScoreBadge score={res.ats_score || 0} />
                        </TableCell>
                        <TableCell className="py-4">
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1.5 text-[#F0562B] text-xs font-bold">
                              <Loader2 size={12} className="animate-spin" /> Analyzing…
                            </span>
                          ) : res.audit_report ? (
                            <Badge className="bg-[#12805B]/10 text-[#12805B] border-[#12805B]/20 px-2.5 py-0.5 font-bold gap-1 text-xs">
                              <CheckCircle2 size={11} />
                              {res.audit_report.drawbacks?.length || 0} issues · Score {res.audit_report.overallScore ?? "–"}
                            </Badge>
                          ) : (
                            <Badge className="bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20 px-2.5 py-0.5 font-bold text-xs">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-[#6B7280] text-xs">
                          {new Date(res.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-4 text-right px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost" size="icon"
                              disabled={isRunning}
                              className="h-8 w-8 text-[#6B7280] hover:text-[#C2410C]"
                              onClick={() => auditMutation.mutate(res.id)}
                            >
                              {isRunning
                                ? <Loader2 size={15} className="animate-spin" />
                                : res.audit_report ? <RefreshCw size={15} /> : <Sparkles size={15} />}
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-[#6B7280] hover:text-[#DC2626]"
                              onClick={() => { if (confirm("Delete this resume?")) deleteResumeMutation.mutate(res.id); }}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Inline expanded audit block */}
                      {isExpanded && (
                        <TableRow className="border-b border-[rgba(0,229,255,0.04)] bg-[#FFFFFF]">
                          <TableCell colSpan={6} className="p-4">
                            <AuditReportBlock
                              resume={res}
                              auditingId={auditingId}
                              onAudit={(id) => auditMutation.mutate(id)}
                              onDelete={(id) => deleteResumeMutation.mutate(id)}
                              compact
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/*  ALL REPORTS VIEW — wide tabular grid, 1 row per user                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "reports" && (
        <div className="space-y-4">

          {/* Banner */}
          <div className="flex items-center justify-between bg-[#FFFFFF] border border-[rgba(0,229,255,0.12)] rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F0562B]/10 flex items-center justify-center">
                <ClipboardList size={18} className="text-[#F0562B]" />
              </div>
              <div>
                <h3 className="text-[#111827] font-bold text-sm">All Audit Reports — Tabular View</h3>
                <p className="text-[#6B7280] text-[10px]">
                  Each row = one user · each column = audit section · scroll horizontally to see all columns
                </p>
              </div>
            </div>
            <Badge className="bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20 px-3 py-1 font-bold">
              {auditedCount} / {resumes?.length || 0} Audited
            </Badge>
          </div>

          {(!filteredResumes || filteredResumes.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#FFFFFF] border border-[rgba(0,229,255,0.08)] rounded-2xl">
              <FileText size={40} className="text-[#6B7280]/30" />
              <p className="text-[#111827] font-bold">No resumes found</p>
              <p className="text-[#6B7280] text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : (
            /* ── Horizontally scrollable table ── */
            <div className="w-full overflow-x-auto rounded-2xl border border-[rgba(0,229,255,0.12)] shadow-2xl">
              <table className="min-w-[1600px] w-full border-collapse" style={{ tableLayout: "fixed" }}>

                {/* ── Column widths ── */}
                <colgroup>
                  <col style={{ width: "180px" }} />  {/* User */}
                  <col style={{ width: "90px"  }} />  {/* ATS */}
                  <col style={{ width: "110px" }} />  {/* Audit Score */}
                  <col style={{ width: "240px" }} />  {/* Drawbacks */}
                  <col style={{ width: "190px" }} />  {/* Missing Keywords */}
                  <col style={{ width: "200px" }} />  {/* Section Coverage */}
                  <col style={{ width: "190px" }} />  {/* Missing Essentials */}
                  <col style={{ width: "220px" }} />  {/* Recommendations */}
                  <col style={{ width: "220px" }} />  {/* Summary */}
                  <col style={{ width: "100px" }} />  {/* Actions */}
                </colgroup>

                {/* ── Header ── */}
                <thead>
                  <tr className="bg-[#F5F6F8]">
                    {[
                      { label: "User",               icon: <User size={12} />,         color: "#C2410C" },
                      { label: "ATS Score",           icon: <TrendingUp size={12} />,   color: "#12805B" },
                      { label: "Audit Score",         icon: <BarChart3 size={12} />,    color: "#F0562B" },
                      { label: "Drawbacks",           icon: <ShieldAlert size={12} />,  color: "#DC2626" },
                      { label: "Missing Keywords",    icon: <Tag size={12} />,          color: "#F59E0B" },
                      { label: "Section Coverage",    icon: <BarChart3 size={12} />,    color: "#C2410C" },
                      { label: "Missing Essentials",  icon: <AlertTriangle size={12} />,color: "#F59E0B" },
                      { label: "Recommendations",     icon: <Lightbulb size={12} />,    color: "#F0562B" },
                      { label: "Summary",             icon: <BookOpen size={12} />,     color: "#F0562B" },
                      { label: "Actions",             icon: null,                       color: "#6B7280" },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="text-left py-4 px-3 border-b border-r border-[rgba(0,229,255,0.06)] last:border-r-0"
                      >
                        <span
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
                          style={{ color: col.color }}
                        >
                          {col.icon}{col.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* ── Rows ── */}
                <tbody>
                  {filteredResumes.map((res, rowIdx) => {
                    const rpt = res.audit_report as AuditReport | null;
                    const isRunning = auditingId === res.id;
                    const atsCol = (res.ats_score ?? 0) > 75 ? "#12805B" : (res.ats_score ?? 0) > 50 ? "#F59E0B" : "#DC2626";
                    const scoreCol = (rpt?.overallScore ?? 0) > 75 ? "#12805B" : (rpt?.overallScore ?? 0) > 50 ? "#F59E0B" : "#DC2626";
                    const rowBg = rowIdx % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FFFFFF]";
                    const cellBase = "py-3 px-3 border-b border-r border-[rgba(0,229,255,0.04)] last:border-r-0 align-top text-xs";

                    return (
                      <tr key={res.id} className={cn(rowBg, "hover:bg-[#F5F6F8]/50 transition-colors group")}>

                        {/* ── User ── */}
                        <td className={cn(cellBase, "font-semibold")} style={{ verticalAlign: "middle" }}>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-[#C2410C]/15 flex items-center justify-center shrink-0">
                              <User size={12} className="text-[#C2410C]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[#111827] font-bold text-[11px] truncate" title={res.profiles?.email}>
                                {res.profiles?.email || "Unknown"}
                              </p>
                              <p className="text-[#6B7280] text-[9px] font-mono truncate">
                                {new Date(res.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ── ATS Score ── */}
                        <td className={cellBase} style={{ verticalAlign: "middle" }}>
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className="text-2xl font-black leading-none"
                              style={{ color: atsCol }}
                            >
                              {res.ats_score ?? 0}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: atsCol }}>
                              / 100
                            </span>
                            {/* Mini bar */}
                            <div className="w-full h-1 rounded-full bg-[#EEF0F3] mt-1">
                              <div
                                className="h-1 rounded-full transition-all"
                                style={{ width: `${res.ats_score ?? 0}%`, backgroundColor: atsCol }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* ── Audit Score ── */}
                        <td className={cellBase} style={{ verticalAlign: "middle" }}>
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1 text-[#F0562B] text-[10px] font-bold">
                              <Loader2 size={11} className="animate-spin" /> Auditing…
                            </span>
                          ) : rpt ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-2xl font-black leading-none" style={{ color: scoreCol }}>
                                {rpt.overallScore ?? 0}
                              </span>
                              <span
                                className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit"
                                style={{ color: scoreCol, borderColor: scoreCol + "33", backgroundColor: scoreCol + "15" }}
                              >
                                {rpt.verdict}
                              </span>
                              <div className="w-full h-1 rounded-full bg-[#EEF0F3]">
                                <div
                                  className="h-1 rounded-full"
                                  style={{ width: `${rpt.overallScore ?? 0}%`, backgroundColor: scoreCol }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#6B7280] text-[10px] italic">Pending</span>
                          )}
                        </td>

                        {/* ── Drawbacks ── */}
                        <td className={cellBase} style={{ verticalAlign: "top" }}>
                          {rpt?.drawbacks?.length ? (
                            <div className="space-y-1.5">
                              {rpt.drawbacks.slice(0, 4).map((d, i) => {
                                const col = d.severity === "critical" ? "#DC2626" : d.severity === "warning" ? "#F59E0B" : "#6B7280";
                                return (
                                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                                    <AlertTriangle size={10} style={{ color: col }} className="mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <span className="font-bold" style={{ color: col }}>{d.title}</span>
                                      <span
                                        className="ml-1 text-[8px] font-black uppercase px-1 py-0.5 rounded border"
                                        style={{ color: col, borderColor: col + "44", backgroundColor: col + "18" }}
                                      >
                                        {d.severity}
                                      </span>
                                      <p className="text-[#6B7280] text-[9px] mt-0.5 truncate">{d.detail}</p>
                                    </div>
                                  </div>
                                );
                              })}
                              {rpt.drawbacks.length > 4 && (
                                <p className="text-[#6B7280]/60 text-[9px] italic">+{rpt.drawbacks.length - 4} more</p>
                              )}
                            </div>
                          ) : rpt ? (
                            <span className="inline-flex items-center gap-1 text-[#12805B] text-[10px] font-bold">
                              <CheckCircle2 size={11} /> No drawbacks
                            </span>
                          ) : (
                            <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* ── Missing Keywords ── */}
                        <td className={cellBase} style={{ verticalAlign: "top" }}>
                          {rpt?.missingKeywords?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {rpt.missingKeywords.slice(0, 8).map((k, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[8px] font-bold border border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#F59E0B] whitespace-nowrap"
                                >
                                  {k}
                                </span>
                              ))}
                              {rpt.missingKeywords.length > 8 && (
                                <span className="text-[#6B7280]/60 text-[9px] italic self-center">
                                  +{rpt.missingKeywords.length - 8}
                                </span>
                              )}
                            </div>
                          ) : rpt ? (
                            <span className="inline-flex items-center gap-1 text-[#12805B] text-[10px] font-bold">
                              <CheckCircle2 size={11} /> None missing
                            </span>
                          ) : (
                            <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* ── Section Coverage ── */}
                        <td className={cellBase} style={{ verticalAlign: "top" }}>
                          {rpt?.sections?.length ? (
                            <div className="space-y-1.5">
                              {rpt.sections.map((s, i) => (
                                <div key={i} className="flex items-center justify-between gap-2">
                                  <span className="text-[#111827] text-[9px] font-bold truncate flex-1">{s.name}</span>
                                  <span
                                    className={cn("text-[9px] font-black shrink-0", s.present ? "text-[#12805B]" : "text-[#DC2626]")}
                                  >
                                    {s.present ? `${s.quality}%` : "✗"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* ── Missing Essentials ── */}
                        <td className={cellBase} style={{ verticalAlign: "top" }}>
                          {rpt?.missingEssentials?.length ? (
                            <div className="space-y-1.5">
                              {rpt.missingEssentials.slice(0, 5).map((m, i) => (
                                <div key={i} className="flex items-start gap-1">
                                  <AlertTriangle size={9} className="text-[#DC2626] mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[#DC2626] font-bold text-[9px]">{m.item}</p>
                                    <p className="text-[#6B7280] text-[8px] leading-snug">{m.why}</p>
                                  </div>
                                </div>
                              ))}
                              {rpt.missingEssentials.length > 5 && (
                                <p className="text-[#6B7280]/60 text-[9px] italic">+{rpt.missingEssentials.length - 5} more</p>
                              )}
                            </div>
                          ) : rpt ? (
                            <span className="inline-flex items-center gap-1 text-[#12805B] text-[10px] font-bold">
                              <CheckCircle2 size={11} /> All present
                            </span>
                          ) : (
                            <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* ── Recommendations ── */}
                        <td className={cellBase} style={{ verticalAlign: "top" }}>
                          {rpt?.recommendations?.length ? (
                            <ul className="space-y-1.5">
                              {rpt.recommendations.slice(0, 4).map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[10px]">
                                  <CheckCircle2 size={10} className="text-[#F0562B] mt-0.5 shrink-0" />
                                  <span className="text-[#6B7280] leading-snug">{r}</span>
                                </li>
                              ))}
                              {rpt.recommendations.length > 4 && (
                                <li className="text-[#6B7280]/60 text-[9px] italic pl-4">
                                  +{rpt.recommendations.length - 4} more
                                </li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* ── Summary ── */}
                        <td className={cn(cellBase, "text-[#6B7280] leading-relaxed")} style={{ verticalAlign: "top" }}>
                          {rpt?.summary
                            ? <p className="text-[10px] leading-relaxed line-clamp-5">{rpt.summary}</p>
                            : <span className="text-[#6B7280]/40 italic text-[10px]">—</span>
                          }
                        </td>

                        {/* ── Actions ── */}
                        <td className={cellBase} style={{ verticalAlign: "middle" }}>
                          <div className="flex flex-col gap-1.5">
                            <Button
                              disabled={isRunning}
                              onClick={() => auditMutation.mutate(res.id)}
                              size="sm"
                              className="h-7 gap-1 bg-[#C2410C]/80 hover:bg-[#C2410C] text-white rounded-lg text-[9px] font-bold px-2 w-full"
                            >
                              {isRunning
                                ? <Loader2 size={11} className="animate-spin" />
                                : rpt ? <RefreshCw size={11} /> : <Sparkles size={11} />}
                              {rpt ? "Re-Audit" : "Audit"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg text-[9px] font-bold px-2 w-full"
                              onClick={() => { if (confirm("Delete this resume?")) deleteResumeMutation.mutate(res.id); }}
                            >
                              <Trash2 size={11} /> Delete
                            </Button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ResumesPage;

