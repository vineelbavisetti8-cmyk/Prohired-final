// Shared TypeScript types for ProHired
export type Plan = "free" | "pro";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null;
  avatar_url: string | null;
  plan: Plan;
  resume_count: number;
  created_at: string;
  updated_at: string;
}

export type ResumeStatus = "processing" | "complete" | "error";
export type WeaknessSeverity = "critical" | "warning" | "suggestion";

export interface Weakness {
  issue: string;
  severity: WeaknessSeverity;
  suggestion: string;
}

export interface ScoreBreakdown {
  content: number;
  keywords: number;
  format: number;
  quantification: number;
}

export interface JobMatch {
  role: string;
  matchPercent: number;
  reasoning: string;
  skillsNeeded: string[];
  salaryRangeIndia: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  file_name: string;
  original_text: string | null;
  rewritten_resume: string | null;
  ats_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  weaknesses: Weakness[] | null;
  missing_keywords: string[] | null;
  strengths: string[] | null;
  job_matches: JobMatch[] | null;
  status: ResumeStatus;
  created_at: string;
  updated_at: string;
}

export interface SavedJobRecord {
  id: string;
  user_id: string;
  external_job_id: string;
  title: string;
  company: string | null;
  location: string | null;
  apply_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  saved_at: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  idealAnswer: string;
  tips: string;
  userRating?: number;
  userNotes?: string;
}
