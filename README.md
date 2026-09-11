<div align="center">

<img src="src/assets/prohired-logo.png" alt="ProHired Logo" width="80" />

# ProHired

### 🏆 India-First AI Resume Intelligence Platform

**Land interviews with a resume that beats the bots.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[**Live Demo**](https://prohired.vercel.app) · [**Report Bug**](https://github.com/vineelbavisetti8-cmyk/Prohired-final/issues) · [**Request Feature**](https://github.com/vineelbavisetti8-cmyk/Prohired-final/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [App Architecture](#-app-architecture)
- [Screenshots & Pages](#-screenshots--pages)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Supabase Edge Functions](#-supabase-edge-functions)
- [API Integrations](#-api-integrations)
- [Project Structure](#-project-structure)
- [Admin Panel](#-admin-panel)
- [Mobile App (Android)](#-mobile-app-android)
- [Deployment](#-deployment)
- [Pricing Plans](#-pricing-plans)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

**ProHired** is a full-stack, AI-powered career acceleration platform built specifically for the Indian job market. It transforms your raw resume into an ATS-optimized masterpiece within 60 seconds — giving you an honest score, a rewritten resume, role-match predictions, live job openings, and interview prep, all in one place.

> *"Upload your resume in seconds. Receive an honest ATS score, an AI-rewritten masterpiece, the top 5 roles you qualify for, and live job openings — all within 60 seconds."*

### Why ProHired?

| Problem | ProHired Solution |
|---|---|
| 75% of resumes are rejected by ATS before a human reads them | Deep ATS scoring (0–100) with breakdown by Content, Keywords, Format, Quantification |
| Candidates don't know which roles they qualify for | AI-driven job match engine with India salary ranges |
| Job hunting is scattered across multiple platforms | Unified live job feed with 20+ top Indian & remote companies |
| Interview prep is expensive and generic | Role-specific coding questions with real-time AI code execution |
| Resume rewriting services cost thousands | AI-powered full rewrite in seconds, under ₹19/month |

---

## ✨ Key Features

### 🎯 Resume Intelligence
- **ATS Score (0–100)** — Scored across 4 dimensions: Content, Keywords, Format & Quantification
- **AI Resume Rewrite** — Full ATS-optimized rewrite using frontier LLMs with action verbs, metrics, and relevant keywords
- **Weakness Breakdown** — Severity-tagged issues (Critical / Warning / Suggestion) with exact fix suggestions
- **Smart Resume Builder** — Edit, rewrite sections, and export to PDF or DOCX
- **Multi-format Upload** — Supports PDF and DOCX files with client-side text extraction
- **LaTeX Export** — Professional LaTeX templates with one-click Overleaf integration

### 🏢 Job Search Engine
- **Live Adzuna API Jobs** — Real-time job listings from Adzuna (India + Global)
- **Curated Tech Openings** — 20+ hand-picked openings at Google, Microsoft, Flipkart, Amazon, Razorpay, Stripe, and more
- **Groq AI Synthesis** — When live results are sparse, Groq AI generates realistic, contextual job postings
- **Smart Filtering** — Filter by role, location, type (Frontend, Backend, AI/ML, Data, DevOps, Mobile, Remote)
- **LinkedIn Apply Links** — Direct apply URLs with fallback to LinkedIn job search

### 🤖 AI Interview Preparation
- **Role-specific Questions** — Coding questions tailored to your target role and difficulty (Easy / Medium / Hard)
- **Multi-language IDE** — In-browser code editor supporting Python, JavaScript, Java, C++
- **Real Code Execution** — JavaScript runs natively in-browser; Python/Java/C++ executed via Groq AI engine
- **Instant Code Feedback** — Correctness score, time/space complexity analysis, optimization suggestions
- **DSA Focus** — Arrays, Strings, Trees, Graphs, DP, System Design, SQL, OOP, Algorithms

### 📊 Dashboard & Profile
- **Resume History** — All uploaded resumes with ATS scores, analysis, and build links
- **Daily Job Feed** — Personalized job feed shown when ATS score is 60 or above
- **User Profile** — Full name, avatar, LinkedIn/GitHub/portfolio links, bio, skills, and headline
- **Plan Management** — Free / Pro tier with Razorpay payment integration

### 🔐 Authentication & Security
- **Supabase Auth** — Email/password registration, login, forgot password, reset password flows
- **Row Level Security (RLS)** — PostgreSQL RLS policies ensure users can only access their own data
- **Session-based Splash Screen** — Animated branded intro shown once per browser session
- **Pro Gate** — Feature gating that prompts upgrade for Pro-only features

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.8 | Type-safe development |
| **Vite** | 5.4 | Build tool & dev server |
| **React Router DOM** | 6.30 | Client-side routing |
| **TailwindCSS** | 3.4 | Utility-first CSS |
| **Radix UI** | Latest | Accessible, headless UI primitives |
| **shadcn/ui** | Custom | Pre-built component library |
| **TanStack Query** | 5.83 | Server state management & caching |
| **React Hook Form** | 7.61 | Form handling |
| **Zod** | 3.25 | Schema validation |
| **Lucide React** | 1.44 | Icon system |
| **Recharts** | 2.15 | Data visualization |
| **Sonner** | 1.7 | Toast notifications |
| **React Markdown** | 10.1 | Markdown rendering |

### Backend & AI

| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Edge Functions |
| **Groq API** | LLM inference for resume analysis, job synthesis, code evaluation |
| **Adzuna API** | Live job search (India + Global markets) |
| **Razorpay** | Payment gateway for Pro subscriptions |

### Document Processing

| Library | Purpose |
|---|---|
| **pdfjs-dist** | PDF text extraction (client-side) |
| **mammoth** | DOCX to text/HTML conversion |
| **docx** | DOCX generation for resume export |
| **file-saver** | Client-side file download |

### Mobile

| Technology | Purpose |
|---|---|
| **Capacitor** | Native Android wrapper |
| **@capacitor/android** | Android build target |
| **@capacitor/splash-screen** | Native splash screen |
| **@capacitor/status-bar** | Android status bar customization |

### Development

| Tool | Purpose |
|---|---|
| **Vitest** | Unit testing |
| **@testing-library/react** | Component testing |
| **ESLint** | Code linting |

---

## 🏗 App Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ProHired Platform                       │
├──────────────────────────┬──────────────────────────────────────┤
│      Web App (React)     │         Admin Panel (React)          │
│  ┌─────────────────────┐ │  ┌────────────────────────────────┐  │
│  │  Landing Page       │ │  │  Dashboard / Users / Revenue   │  │
│  │  Auth (Login/Reg)   │ │  │  Resumes / Announcements       │  │
│  │  App Shell          │ │  │  Promo Codes / Feedback        │  │
│  │  ├─ Explore/Dash    │ │  │  AI Usage / Audit Logs         │  │
│  │  ├─ Resume Upload   │ │  └────────────────────────────────┘  │
│  │  ├─ Resume Analysis │ │                                      │
│  │  ├─ Resume Builder  │ │                                      │
│  │  ├─ Job Feed        │ │                                      │
│  │  ├─ Interview Prep  │ │                                      │
│  │  └─ Profile         │ │                                      │
│  └─────────────────────┘ │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│                        AI Services Layer                        │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐│
│  │ groqResume    │  │ groqInterview │  │ jobSearchService     ││
│  │ Analyzer.ts   │  │ Questions.ts  │  │ (Adzuna+Groq+Curated)││
│  └───────────────┘  └───────────────┘  └──────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                    Supabase Backend                             │
│  ┌────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │  Auth      │  │ PostgreSQL  │  │  Edge Functions (11)   │  │
│  │  (JWT)     │  │ (RLS)       │  │  - analyze-resume      │  │
│  └────────────┘  └─────────────┘  │  - interview-questions │  │
│                                   │  - jobs-search         │  │
│                                   │  - razorpay-*          │  │
│                                   │  - compile-latex       │  │
│                                   │  - admin-auth          │  │
│                                   └────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                 External APIs                                   │
│   Adzuna Jobs API  │  Groq LLM API  │  Razorpay Payments       │
└─────────────────────────────────────────────────────────────────┘
```

### Routing Structure

```
/                        → AppExplore (main dashboard/explore page)
/app/explore             → AppExplore
/app/resume/upload       → ResumeUpload
/app/resume/:id/analysis → ResumeAnalysis
/app/resume/:id/builder  → ResumeBuilder
/app/jobs                → Jobs (job search + feed)
/app/job-feed            → Jobs (alias)
/app/interview           → Interview (AI coding prep)
/app/profile             → Profile

/landing                 → Landing Page (marketing)
/auth/login              → Login
/auth/register           → Register
/auth/forgot-password    → ForgotPassword
/auth/reset-password     → ResetPassword

/admin                   → AdminDashboard (guarded)
/admin/users             → User management
/admin/revenue           → Revenue analytics
/admin/resumes           → All resumes
/admin/features          → Feature flags
/admin/announcements     → User announcements
/admin/promo-codes       → Discount codes
/admin/feedback          → User feedback
/admin/audit-logs        → System audit trail
/admin/ai-usage          → AI consumption metrics
/admin/settings          → Platform settings
```

---

## 📸 Screenshots & Pages

### User-Facing App

| Page | Description |
|---|---|
| **Splash Screen** | Animated brand intro shown once per session |
| **Landing Page** (`/landing`) | Hero, Features, How It Works, Pricing, Testimonials, FAQ |
| **Explore / Dashboard** | Greeting, resume stats, daily job feed card |
| **Resume Upload** | Drag-and-drop PDF/DOCX uploader with role & company targeting |
| **Resume Analysis** | ATS score breakdown, weakness list, strengths, job matches, AI rewrite |
| **Resume Builder** | Section-by-section editor with export to PDF/DOCX/LaTeX |
| **Jobs** | Search bar, tag filters, live Adzuna results + curated openings |
| **Interview** | Role selector, coding IDE, AI judge, complexity analysis |
| **Profile** | Avatar, bio, skills, social links, plan info |

### Admin Panel

| Page | Description |
|---|---|
| **Dashboard** | Platform KPIs — users, revenue, resumes, AI calls |
| **Users** | Full user list with plan, signup date, search, and controls |
| **Revenue** | Payment history, MRR, ARR, transaction logs |
| **Resumes** | All uploaded resumes with scores and admin preview |
| **Features** | Toggle feature flags for free/pro tiers |
| **Announcements** | Broadcast banners to all users |
| **Promo Codes** | Create, manage, and expire discount codes |
| **Feedback** | User-submitted feedback with ratings |
| **Audit Logs** | Full system event trail |
| **AI Usage** | Groq API call metrics by feature |
| **Settings** | Platform configuration |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **bun**
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key
- An [Adzuna](https://developer.adzuna.com/) App ID & Key (for live jobs)
- A [Razorpay](https://razorpay.com) account (optional, for payments)

### 1. Clone the Repository

```bash
git clone https://github.com/vineelbavisetti8-cmyk/Prohired-final.git
cd Prohired-final
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

### 4. Set Up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy
```

Or run the SQL migrations manually in your Supabase SQL Editor from the `supabase/migrations/` folder.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

---

## 🔑 Environment Variables

Create a `.env` file at the project root:

```env
# Supabase — Required
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"

# Razorpay — Required for payments
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

> **Note:** The Groq API key and Adzuna credentials are embedded in client-side service files (`src/lib/`). For production, move these to Supabase Edge Function secrets or server-side environment variables.

---

## 🗄 Database Schema

ProHired uses **Supabase (PostgreSQL)** with Row Level Security (RLS) on all tables.

### `public.profiles`
Auto-created on signup via `handle_new_user()` trigger.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` PK | References `auth.users(id)` |
| `full_name` | `text` | User's full name |
| `email` | `text` | User email |
| `avatar_url` | `text` | Profile picture URL |
| `plan` | `text` | `'free'` or `'pro'` |
| `resume_count` | `integer` | Number of resumes uploaded |
| `created_at` | `timestamptz` | Account creation timestamp |
| `updated_at` | `timestamptz` | Auto-updated on change |

### `public.resumes`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK | References `auth.users(id)` |
| `file_name` | `text` | Original filename |
| `original_text` | `text` | Extracted resume text |
| `rewritten_resume` | `text` | AI-rewritten version |
| `ats_score` | `integer` | ATS score (0–100) |
| `score_breakdown` | `jsonb` | Content, Keywords, Format, Quantification |
| `weaknesses` | `jsonb` | Array of issue objects with severity |
| `missing_keywords` | `jsonb` | Missing keywords list |
| `strengths` | `jsonb` | Strengths list |
| `job_matches` | `jsonb` | Matched roles with India salary ranges |
| `status` | `text` | `'processing'`, `'complete'`, or `'error'` |

### `public.saved_jobs`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK | References `auth.users(id)` |
| `external_job_id` | `text` | Adzuna/curated job ID |
| `title` | `text` | Job title |
| `company` | `text` | Company name |
| `location` | `text` | Job location |
| `apply_url` | `text` | Apply URL |
| `salary_min` | `integer` | Min salary (INR) |
| `salary_max` | `integer` | Max salary (INR) |

### `public.interview_sessions`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK | References `auth.users(id)` |
| `role` | `text` | Target role |
| `difficulty` | `text` | `'easy'`, `'medium'`, or `'hard'` |
| `questions` | `jsonb` | Array of coding questions |
| `created_at` | `timestamptz` | Session timestamp |

### Row Level Security

All tables enforce user-scoped RLS:

```sql
-- Example
create policy "Resumes: owner select"
  on public.resumes for select using (auth.uid() = user_id);
```

---

## ⚡ Supabase Edge Functions

| Function | Description |
|---|---|
| `analyze-resume` | Deep Groq LLM resume analysis |
| `generate-tailored-resume` | AI resume tailoring for specific roles |
| `improve-section` | AI-powered resume section improvement |
| `interview-questions` | Role-specific coding question generation |
| `jobs-search` | Server-side job search aggregation |
| `compile-latex` | LaTeX resume compilation |
| `razorpay-create-order` | Razorpay payment order creation |
| `razorpay-verify-payment` | Payment signature verification |
| `admin-auth` | Admin authentication |
| `admin-resume-audit` | Admin resume audit operations |
| `_shared` | Shared CORS headers and utilities |

---

## 🔌 API Integrations

### Groq AI (LLM Inference)

Multi-model fallback strategy for maximum reliability:

```
1. openai/gpt-oss-120b   (primary)
2. openai/gpt-oss-20b    (fallback)
3. groq/compound         (fallback)
4. groq/compound-mini    (fallback)
```

**Used for:**
- Resume ATS analysis & full rewrite
- Coding question generation
- Code evaluation & feedback
- AI code execution (Python, Java, C++ simulation)
- Job posting synthesis (when live results are sparse)

### Adzuna Jobs API

Real-time job listings from [Adzuna](https://developer.adzuna.com/):

- **Endpoint:** `https://api.adzuna.com/v1/api/jobs/{country}/search/1`
- **Countries:** `in` (India), `us` (US/Global)
- **Default:** 20 results, max 14 days old
- **Fallback chain:** Adzuna Live → Curated Catalog → Groq AI Synthesis

### Razorpay Payments

Secure INR payment processing for Pro plan:
- Order creation via Edge Function
- Webhook signature verification
- Automatic plan upgrade on successful payment

---

## 📁 Project Structure

```
prohired-final/
├── src/
│   ├── App.tsx                    # Root app — routing & providers
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global CSS, design tokens, animations
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components (50+)
│   │   ├── landing/               # Landing page sections
│   │   │   ├── Hero.tsx           # Hero section with stats
│   │   │   ├── Features.tsx       # 6-feature grid
│   │   │   ├── HowItWorks.tsx     # 4-step process
│   │   │   ├── Pricing.tsx        # Free & Pro plans
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   ├── app/                   # App shell components
│   │   │   ├── AppShell.tsx
│   │   │   ├── AppHeader.tsx      # Top navigation bar
│   │   │   ├── AppBottomNav.tsx   # Mobile bottom nav
│   │   │   ├── AppSubNav.tsx
│   │   │   └── AppSpotlight.tsx   # Command palette
│   │   ├── admin/                 # Admin panel components
│   │   ├── Navbar.tsx             # Landing page navbar
│   │   ├── ProGate.tsx            # Pro feature gate
│   │   ├── SplashScreen.tsx       # Animated splash screen
│   │   ├── NativeBridge.tsx       # Capacitor native bridge
│   │   └── TailorResumeDialog.tsx
│   ├── pages/
│   │   ├── app/
│   │   │   ├── AppExplore.tsx     # Main explore/dashboard
│   │   │   ├── Dashboard.tsx      # Resume history
│   │   │   ├── ResumeUpload.tsx   # File upload + targeting
│   │   │   ├── ResumeAnalysis.tsx # ATS analysis view
│   │   │   ├── ResumeBuilder.tsx  # Resume editor
│   │   │   ├── Jobs.tsx           # Job search & feed
│   │   │   ├── Interview.tsx      # AI coding interview (38KB)
│   │   │   └── Profile.tsx        # User profile
│   │   └── admin/                 # 12 admin pages
│   ├── lib/
│   │   ├── groqResumeAnalyzer.ts  # Groq resume analysis engine
│   │   ├── groqInterviewQuestions.ts  # Question gen + code exec
│   │   ├── jobSearchService.ts    # Adzuna + Groq + Curated jobs
│   │   ├── smartResumeAnalyzer.ts # Client-side resume parsing
│   │   ├── resumeExport.ts        # PDF/DOCX export engine
│   │   ├── latexResumeTemplate.ts # LaTeX template generator
│   │   └── overleaf.ts            # Overleaf integration
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth state management
│   └── integrations/
│       └── supabase/client.ts     # Supabase client singleton
├── supabase/
│   ├── functions/                 # 11 Edge Functions
│   └── migrations/                # 7 SQL migration files
├── android/                       # Capacitor Android project
├── capacitor.config.ts            # Android configuration
├── vite.config.ts
├── tailwind.config.ts
└── vercel.json                    # Vercel SPA routing
```

---

## 🛡 Admin Panel

Accessible at `/admin`, protected by `AdminGuard`.

| Feature | Description |
|---|---|
| **Dashboard** | Real-time platform metrics and KPIs |
| **User Management** | View, search, filter, manage all users |
| **Revenue** | Transaction history, MRR, ARR |
| **Feature Flags** | Toggle features per tier |
| **Announcements** | Broadcast messages to users |
| **Promo Codes** | Create/expire discount codes |
| **Feedback** | User-submitted ratings & feedback |
| **Audit Logs** | Full chronological event trail |
| **AI Usage** | Groq API consumption metrics |
| **Settings** | Platform-wide configuration |

---

## 📱 Mobile App (Android)

ProHired is a native Android app using **Capacitor 8**.

```bash
# Build web app
npm run build

# Sync Capacitor
npx cap sync android

# Open Android Studio
npx cap open android
```

**App ID:** `com.prohired.app`

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The included `vercel.json` handles SPA routing automatically.

### Manual / Static Host

```bash
npm run build
# Deploy the dist/ folder to any static host
```

---

## 💰 Pricing Plans

| Feature | Free | Pro (₹19/month) |
|---|:---:|:---:|
| Resume analyses | 1 | Unlimited |
| ATS score & breakdown | ✅ | ✅ |
| AI rewrite preview | ✅ | ✅ |
| Full AI rewrite + PDF export | ❌ | ✅ |
| Job matches | Top 3 | Top 5 with live openings |
| AI interview prep | ❌ | 10 questions/role |
| Apply-fix suggestions | ❌ | ✅ |
| Priority support | ❌ | ✅ |

> 🔥 **Launch Offer:** Pro plan at ₹19/month (was ₹299). Cancel anytime. 7-day refund guarantee.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests use **Vitest** and **@testing-library/react**, located in `src/test/`.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a branch: `git checkout -b feature/amazing-feature`
3. **Commit:** `git commit -m 'feat: add amazing feature'`
4. **Push:** `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code refactoring
test:     Tests
chore:    Build / tooling
```

---

## 📜 License

Licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Indian job seekers.**

*"Land interviews with a resume that beats the bots."*

[![GitHub stars](https://img.shields.io/github/stars/vineelbavisetti8-cmyk/Prohired-final?style=social)](https://github.com/vineelbavisetti8-cmyk/Prohired-final/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/vineelbavisetti8-cmyk/Prohired-final?style=social)](https://github.com/vineelbavisetti8-cmyk/Prohired-final/network)

</div>
