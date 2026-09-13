import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Crown,
  Zap,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";
import { JobItem, searchJobOpenings, CURATED_TECH_JOBS } from "@/lib/jobSearchService";
import JobFeed from "./JobFeed.tsx";

const SUB_TABS: SubNavTab[] = [
  { id: "feed", label: "Daily ATS Feed", icon: Sparkles, badge: "Daily 8 AM" },
  { id: "search", label: "Job Search & Openings", icon: Search },
  { id: "saved", label: "Saved Jobs", icon: Bookmark },
  { id: "applied", label: "Applied Tracker", icon: CheckCircle2 },
];

const FILTER_TAGS = [
  "All",
  "Remote",
  "Frontend",
  "Backend",
  "Fullstack",
  "AI / ML",
  "Mobile",
  "DevOps",
];

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "feed";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobItem[]>(() => CURATED_TECH_JOBS.slice(0, 12));
  const [hasSearched, setHasSearched] = useState(false);

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("prohired_saved_job_ids") ||
        localStorage.getItem("hirerapid_saved_job_ids") ||
        "[]"
      );
    } catch {
      return [];
    }
  });

  const [savedJobsList, setSavedJobsList] = useState<JobItem[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("prohired_saved_jobs_data") ||
        localStorage.getItem("hirerapid_saved_jobs_data") ||
        "[]"
      );
    } catch {
      return [];
    }
  });

  const [appliedJobsList, setAppliedJobsList] = useState<JobItem[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("prohired_applied_jobs_data") ||
        localStorage.getItem("hirerapid_applied_jobs_data") ||
        "[]"
      );
    } catch {
      return [];
    }
  });

  const performSearch = useCallback(async (queryRole: string, loc: string, filterTag: string = "All") => {
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchJobOpenings(queryRole, loc, filterTag);
      setJobs(results);
    } catch (e) {
      console.warn("Job search fallback notice:", e);
      setJobs(CURATED_TECH_JOBS.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, []);

  // Attempt to load default jobs based on user's actual uploaded resume
  useEffect(() => {
    try {
      const localList = JSON.parse(
        localStorage.getItem("prohired_local_resumes") ||
        localStorage.getItem("hirerapid_local_resumes") ||
        "[]"
      );
      const latestResume = localList[0];
      if (latestResume?.job_matches && latestResume.job_matches.length > 0) {
        const role = latestResume.job_matches[0].role;
        setSearchQuery(role);
        performSearch(role, "", "All");
      } else {
        performSearch("", "India", "All");
      }
    } catch {
      performSearch("", "India", "All");
    }
  }, [performSearch]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, locationQuery, activeFilter);
  };

  const handleFilterClick = (tag: string) => {
    setActiveFilter(tag);
    performSearch(searchQuery, locationQuery, tag);
  };

  const handleToggleSave = (job: JobItem) => {
    let nextIds: string[];
    let nextList: JobItem[];

    if (savedJobIds.includes(job.id)) {
      nextIds = savedJobIds.filter((x) => x !== job.id);
      nextList = savedJobsList.filter((j) => j.id !== job.id);
      toast.success("Removed from saved bookmarks");
    } else {
      nextIds = [...savedJobIds, job.id];
      nextList = [job, ...savedJobsList.filter((j) => j.id !== job.id)];
      toast.success("Job saved to your bookmarks");
    }

    setSavedJobIds(nextIds);
    setSavedJobsList(nextList);
    try {
      localStorage.setItem("prohired_saved_job_ids", JSON.stringify(nextIds));
      localStorage.setItem("prohired_saved_jobs_data", JSON.stringify(nextList));
    } catch {}
  };

  const handleApply = (job: JobItem) => {
    const exists = appliedJobsList.some((j) => j.id === job.id);
    if (!exists) {
      const next = [job, ...appliedJobsList];
      setAppliedJobsList(next);
      try {
        localStorage.setItem("prohired_applied_jobs_data", JSON.stringify(next));
      } catch {}
      toast.success(`Application registered for ${job.title} at ${job.company}!`);
    } else {
      toast.info("You have already submitted an application for this position.");
    }
  };

  const isJobApplied = (id: string) => appliedJobsList.some((j) => j.id === id);

  const tabsWithCounts: SubNavTab[] = [
    { id: "feed", label: "Daily ATS Feed", icon: Sparkles, badge: "Daily" },
    { id: "search", label: "Job Search & Openings", icon: Search, badge: jobs.length },
    { id: "saved", label: "Saved Jobs", icon: Bookmark, badge: savedJobsList.length },
    { id: "applied", label: "Applied Tracker", icon: CheckCircle2, badge: appliedJobsList.length },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub Navigation Bar */}
      <AppSubNav
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setSearchParams({ tab });
        }}
      />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* TAB 0: PERSONALIZED DAILY ATS FEED */}
        {activeTab === "feed" && (
          <div className="animate-fade-in">
            <JobFeed />
          </div>
        )}

        {/* TAB 1: JOB SEARCH & OPENINGS */}
        {activeTab === "search" && (
          <div className="space-y-5 animate-fade-in">
            {/* Search Input Bar */}
            <form onSubmit={handleManualSearch} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Target role, skill or company (e.g. React Developer, Google, Swiggy)..."
                  className="pl-9 bg-white/90 border-gray-200 text-xs sm:text-sm h-11 text-foreground rounded-xl focus:ring-orange-500"
                />
              </div>

              <div className="relative w-full sm:w-60">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location (e.g. Bengaluru, Remote)"
                  className="pl-9 bg-white/90 border-gray-200 text-xs sm:text-sm h-11 text-foreground rounded-xl focus:ring-orange-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 px-5 text-xs font-semibold shrink-0 shadow-glow-primary w-full sm:w-auto"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Search className="h-4 w-4 mr-1.5" />} Search Openings
              </Button>
            </form>

            {/* Quick Filter Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scroll-x-mobile pb-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter className="h-3 w-3 text-orange-500" /> Filter:
              </span>
              {FILTER_TAGS.map((tag) => {
                const isActive = activeFilter.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleFilterClick(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                      isActive
                        ? "bg-orange-500 text-white shadow-sm font-bold"
                        : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span className="font-medium flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                  {loading ? "Searching live verified vacancies..." : `Found ${jobs.length} open position${jobs.length === 1 ? "" : "s"}`}
                </span>
                {hasSearched && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setLocationQuery("");
                      setActiveFilter("All");
                      performSearch("", "India", "All");
                    }}
                    className="text-xs text-orange-600 hover:underline font-semibold"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {loading ? (
                <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                  <p className="text-sm font-bold text-foreground">Fetching live matching openings...</p>
                  <p className="text-xs text-gray-500">Searching verified tech listings across India and remote.</p>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={isJobApplied(job.id)}
                    onToggleSave={() => handleToggleSave(job)}
                    onApply={() => handleApply(job)}
                  />
                ))
              ) : (
                <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
                  <Briefcase className="h-10 w-10 text-gray-400 mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No Openings Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try searching for a different role, company, or location above.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setLocationQuery("");
                      setActiveFilter("All");
                      performSearch("", "India", "All");
                    }}
                    className="rounded-xl text-xs mt-2"
                  >
                    View All Tech Openings
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED JOBS */}
        {activeTab === "saved" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Bookmarked Jobs ({savedJobsList.length})</h3>
              <p className="text-xs text-gray-500">Saved for review and future application</p>
            </div>
            {savedJobsList.length > 0 ? (
              <div className="space-y-4">
                {savedJobsList.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={true}
                    isApplied={isJobApplied(job.id)}
                    onToggleSave={() => handleToggleSave(job)}
                    onApply={() => handleApply(job)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
                <Bookmark className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-sm font-semibold text-foreground">No saved jobs yet</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Bookmark interesting openings from the Job Search tab to compare them and apply later.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("search")}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs mt-2"
                >
                  Browse Job Openings
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLIED TRACKER */}
        {activeTab === "applied" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Application History ({appliedJobsList.length})</h3>
              <p className="text-xs text-gray-500">Track all 1-Click Applications</p>
            </div>
            {appliedJobsList.length > 0 ? (
              <div className="space-y-4">
                {appliedJobsList.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={true}
                    onToggleSave={() => handleToggleSave(job)}
                    onApply={() => handleApply(job)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-3 rounded-2xl">
                <CheckCircle2 className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-sm font-semibold text-foreground">No applications tracked yet</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  When you apply to jobs through ProHired, your submissions and dates will be tracked right here.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("search")}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs mt-2"
                >
                  Find Openings to Apply
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({
  job,
  isSaved,
  isApplied,
  onToggleSave,
  onApply,
}: {
  job: JobItem;
  isSaved: boolean;
  isApplied: boolean;
  onToggleSave: () => void;
  onApply: () => void;
}) {
  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-3.5 hover:border-orange-500/40 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center font-extrabold text-base text-white shadow-sm shrink-0">
            {job.company.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-orange-600">{job.company}</span>
              <span className="text-[10px] text-gray-400">• {job.posted || "Recent"}</span>
              {job.matchScore !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {job.matchScore}% ATS Match
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400 shrink-0" /> {job.location}
            </p>
          </div>
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="self-start sm:self-auto shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 whitespace-nowrap">
              {job.salary}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
        {job.description}
      </p>

      {/* Tags Chips */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {job.tags.map((t, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onToggleSave}
          className={`flex items-center gap-1.5 text-xs font-semibold p-1.5 rounded-lg transition-colors ${
            isSaved ? "text-orange-600 bg-orange-50 font-bold" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Save Job</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-orange-600 font-semibold flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Official Link <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <Button
            size="sm"
            onClick={onApply}
            className={`rounded-xl text-xs font-semibold h-9 px-4 transition-all ${
              isApplied
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-glow-primary"
            }`}
          >
            {isApplied ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
              </span>
            ) : (
              "1-Click Apply"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
