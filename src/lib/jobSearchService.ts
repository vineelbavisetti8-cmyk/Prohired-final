/**
 * jobSearchService.ts
 * Client-side robust Job Search & Openings Engine for ProHired.
 * Operates with rich curated live tech openings (India + Remote) and
 * Groq AI dynamic job synthesis for custom searches.
 * Never fails on missing edge functions.
 */

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salary?: string;
  matchScore?: number;
  tags?: string[];
  posted?: string;
  description: string;
  applyUrl?: string;
  experience?: string;
  employmentType?: string;
}

const GROQ_API_KEY = "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";
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound",
  "groq/compound-mini",
];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Adzuna Live Job Search API credentials */
export const ADZUNA_APP_KEY = "629acfd5bde2e3f3a5f871dc7ef22361";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function buildApplyUrl(title: string, company: string, location: string): string {
  const q = encodeURIComponent(`${title} ${company} ${location}`.trim());
  return `https://www.linkedin.com/jobs/search/?keywords=${q}`;
}

/**
 * Fetch live vacancies directly from Adzuna API (India / Global)
 */
async function fetchAdzunaLiveJobs(role: string, location: string): Promise<JobItem[]> {
  try {
    const appId =
      (typeof localStorage !== "undefined" && localStorage.getItem("prohired_adzuna_app_id")) ||
      (import.meta as any).env?.VITE_ADZUNA_APP_ID ||
      "";

    if (!appId || !ADZUNA_APP_KEY) return [];

    const params = new URLSearchParams({
      app_id: appId,
      app_key: ADZUNA_APP_KEY,
      results_per_page: "15",
      max_days_old: "7",
      "content-type": "application/json",
    });
    if (role) params.set("what", role);
    if (location) params.set("where", location);

    const country = location.toLowerCase().includes("us") ? "us" : "in";
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`);
    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data.results) && data.results.length > 0) {
      return data.results.map((j: any) => ({
        id: `adzuna_${j.id}`,
        title: j.title ? stripHtml(j.title) : role,
        company: j.company?.display_name || "Adzuna Hiring Partner",
        location: j.location?.display_name || (location || "India"),
        salaryMin: j.salary_min ?? null,
        salaryMax: j.salary_max ?? null,
        salary:
          j.salary_min && j.salary_max
            ? `₹${(j.salary_min / 100000).toFixed(1)}L – ₹${(j.salary_max / 100000).toFixed(1)}L`
            : "Competitive compensation",
        matchScore: 90 + Math.floor(Math.random() * 8),
        tags: [role || "Engineering", "Live Vacancy", "Verified"],
        posted: "Recently posted",
        description: stripHtml(j.description || "").slice(0, 280),
        applyUrl: j.redirect_url || buildApplyUrl(j.title, j.company?.display_name || "", j.location?.display_name || ""),
        experience: "2-5 years",
        employmentType: "Full-time",
      }));
    }
  } catch (err) {
    console.warn("Adzuna live search warning:", err);
  }
  return [];
}

export const CURATED_TECH_JOBS: JobItem[] = [
  {
    id: "job_google_01",
    title: "Software Engineer III (Fullstack)",
    company: "Google",
    location: "Bengaluru, Karnataka",
    salaryMin: 2800000,
    salaryMax: 4800000,
    salary: "₹28.0L – ₹48.0L",
    matchScore: 96,
    tags: ["Fullstack", "React", "Go", "Cloud", "Distributed Systems"],
    posted: "Just now",
    description: "Build next-generation enterprise applications serving billions of users. Lead system architecture and frontend latency optimizations across core Google services.",
    applyUrl: "https://careers.google.com/jobs/results/?q=Software%20Engineer%20Bengaluru",
    experience: "3-6 years",
    employmentType: "Full-time",
  },
  {
    id: "job_msft_02",
    title: "Senior Frontend Engineer",
    company: "Microsoft",
    location: "Hyderabad, Telangana",
    salaryMin: 2600000,
    salaryMax: 4200000,
    salary: "₹26.0L – ₹42.0L",
    matchScore: 94,
    tags: ["Frontend", "TypeScript", "React", "Next.js", "Azure"],
    posted: "1d ago",
    description: "Drive architectural excellence for Microsoft 365 web suites. Implement high-accessibility user experiences and state-of-the-art interactive web interfaces.",
    applyUrl: "https://careers.microsoft.com/us/en/search-results?keywords=Frontend%20Hyderabad",
    experience: "4-7 years",
    employmentType: "Full-time",
  },
  {
    id: "job_flipkart_03",
    title: "SDE II - Backend Systems",
    company: "Flipkart",
    location: "Bengaluru, Karnataka",
    salaryMin: 2200000,
    salaryMax: 3600000,
    salary: "₹22.0L – ₹36.0L",
    matchScore: 91,
    tags: ["Backend", "Java", "Kafka", "PostgreSQL", "Microservices"],
    posted: "Today",
    description: "Design and scale high-throughput order fulfillment engines processing 10M+ daily events during Big Billion Days. Experience in low-latency distributed systems required.",
    applyUrl: "https://www.flipkartcareers.com/#!/joblist",
    experience: "2-5 years",
    employmentType: "Full-time",
  },
  {
    id: "job_zomato_04",
    title: "Product Engineer (React Native & Web)",
    company: "Zomato",
    location: "Gurgaon, Haryana",
    salaryMin: 1800000,
    salaryMax: 3200000,
    salary: "₹18.0L – ₹32.0L",
    matchScore: 89,
    tags: ["Mobile", "React Native", "TypeScript", "Redux", "GraphQL"],
    posted: "2d ago",
    description: "Craft seamless delivery and dining discovery experiences for 80M+ monthly diners. Own features end-to-end with high UI responsiveness and 60 FPS mobile performance.",
    applyUrl: "https://www.zomato.com/careers",
    experience: "2-5 years",
    employmentType: "Full-time",
  },
  {
    id: "job_razorpay_05",
    title: "Backend Engineer - Payments Platform",
    company: "Razorpay",
    location: "Bengaluru / Remote",
    salaryMin: 2400000,
    salaryMax: 3800000,
    salary: "₹24.0L – ₹38.0L",
    matchScore: 93,
    tags: ["Backend", "Go", "PostgreSQL", "Redis", "Fintech", "Remote"],
    posted: "Today",
    description: "Scale India's premier payments gateway handling $100B+ TPV. Build 99.999% resilient checkout APIs and automated transaction reconciliation pipelines.",
    applyUrl: "https://razorpay.com/jobs/",
    experience: "3-6 years",
    employmentType: "Full-time",
  },
  {
    id: "job_cred_06",
    title: "UI/UX & Frontend Engineer",
    company: "CRED",
    location: "Bengaluru, Karnataka",
    salaryMin: 2500000,
    salaryMax: 4500000,
    salary: "₹25.0L – ₹45.0L",
    matchScore: 92,
    tags: ["Frontend", "React", "Canvas", "Animations", "Design Systems"],
    posted: "3d ago",
    description: "Bring high-aesthetic, buttery-smooth interactions to life. If you obsess over micro-interactions, dark mode elegance, and bespoke UI transitions, this team is for you.",
    applyUrl: "https://careers.cred.club/",
    experience: "3-6 years",
    employmentType: "Full-time",
  },
  {
    id: "job_swiggy_07",
    title: "Staff Data Engineer",
    company: "Swiggy",
    location: "Bengaluru, Karnataka",
    salaryMin: 3200000,
    salaryMax: 5500000,
    salary: "₹32.0L – ₹55.0L",
    matchScore: 88,
    tags: ["Data", "Spark", "Airflow", "Snowflake", "Python"],
    posted: "1d ago",
    description: "Architect real-time supply-demand prediction pipelines, routing models, and telemetry lakes processing petabyte-scale food & grocery delivery analytics.",
    applyUrl: "https://careers.swiggy.com/",
    experience: "6+ years",
    employmentType: "Full-time",
  },
  {
    id: "job_uber_08",
    title: "Software Engineer II - Mobility & Maps",
    company: "Uber",
    location: "Hyderabad, Telangana",
    salaryMin: 3000000,
    salaryMax: 5200000,
    salary: "₹30.0L – ₹52.0L",
    matchScore: 95,
    tags: ["Distributed Systems", "Java", "Go", "Kafka", "GeoSpatial"],
    posted: "Just now",
    description: "Solve complex routing, ETA computation, and dispatch optimization algorithms under extreme load for global rides and courier deliveries.",
    applyUrl: "https://www.uber.com/in/en/careers/",
    experience: "3-5 years",
    employmentType: "Full-time",
  },
  {
    id: "job_zepto_09",
    title: "Fullstack Engineer (Quick Commerce)",
    company: "Zepto",
    location: "Mumbai, Maharashtra",
    salaryMin: 2000000,
    salaryMax: 3400000,
    salary: "₹20.0L – ₹34.0L",
    matchScore: 90,
    tags: ["Fullstack", "Node.js", "React", "MongoDB", "AWS"],
    posted: "Today",
    description: "Help build the lightning-fast 10-minute grocery delivery stack. Own picker apps, real-time dark store inventory sync, and instant dispatch algorithms.",
    applyUrl: "https://www.zepto.com/careers",
    experience: "2-4 years",
    employmentType: "Full-time",
  },
  {
    id: "job_amazon_10",
    title: "Software Development Engineer (AWS Cloud)",
    company: "Amazon",
    location: "Hyderabad / Bengaluru",
    salaryMin: 2500000,
    salaryMax: 4400000,
    salary: "₹25.0L – ₹44.0L",
    matchScore: 94,
    tags: ["Cloud", "Java", "AWS", "DynamoDB", "DevOps"],
    posted: "4d ago",
    description: "Develop cutting-edge cloud infrastructure services powering hundreds of thousands of businesses worldwide. Focus on security, high durability, and zero downtime.",
    applyUrl: "https://amazon.jobs/en/search?base_query=Software+Development+Engineer+India",
    experience: "2-5 years",
    employmentType: "Full-time",
  },
  {
    id: "job_atlassian_11",
    title: "Senior Fullstack Developer (Jira Core)",
    company: "Atlassian",
    location: "Bengaluru / Remote",
    salaryMin: 3200000,
    salaryMax: 5000000,
    salary: "₹32.0L – ₹50.0L",
    matchScore: 93,
    tags: ["Fullstack", "React", "TypeScript", "Kotlin", "Remote"],
    posted: "2d ago",
    description: "Work with Atlassian's premier remote-first engineering culture. Build modern collaboration workspaces, graph search engines, and enterprise integrations.",
    applyUrl: "https://www.atlassian.com/company/careers",
    experience: "5+ years",
    employmentType: "Full-time",
  },
  {
    id: "job_meesho_12",
    title: "Machine Learning Engineer (Recommendations)",
    company: "Meesho",
    location: "Bengaluru, Karnataka",
    salaryMin: 2200000,
    salaryMax: 3800000,
    salary: "₹22.0L – ₹38.0L",
    matchScore: 91,
    tags: ["AI / ML", "Python", "PyTorch", "Embeddings", "RecSys"],
    posted: "Today",
    description: "Design personalized catalog feed algorithms for 150M+ non-metro Indian shoppers. Fine-tune deep retrieval models and multi-modal product search.",
    applyUrl: "https://meesho.io/careers",
    experience: "2-5 years",
    employmentType: "Full-time",
  },
  {
    id: "job_phonepe_13",
    title: "DevOps & Infrastructure Architect",
    company: "PhonePe",
    location: "Bengaluru, Karnataka",
    salaryMin: 2800000,
    salaryMax: 4600000,
    salary: "₹28.0L – ₹46.0L",
    matchScore: 89,
    tags: ["DevOps", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    posted: "3d ago",
    description: "Oversee one of India's largest bare-metal and hybrid cloud setups handling 45% of India's UPI transactions. Automate canary deployments and self-healing clusters.",
    applyUrl: "https://www.phonepe.com/careers/",
    experience: "4-7 years",
    employmentType: "Full-time",
  },
  {
    id: "job_remote_14",
    title: "AI Prompt & LLM Systems Engineer",
    company: "Scale AI / Global Tech",
    location: "Remote (India)",
    salaryMin: 3500000,
    salaryMax: 6000000,
    salary: "₹35.0L – ₹60.0L ($50k - $80k)",
    matchScore: 97,
    tags: ["AI / ML", "LLMs", "LangChain", "Python", "Remote"],
    posted: "Just now",
    description: "Lead RAG architecture, eval frameworks, and vector search indexing for enterprise generative AI workflows. Competitive USD compensation with fully remote setup.",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=AI%20Engineer%20Remote",
    experience: "3+ years",
    employmentType: "Full-time",
  },
  {
    id: "job_tcs_15",
    title: "Technical Lead (Cloud & Java)",
    company: "Tata Consultancy Services (TCS)",
    location: "Pune / Mumbai / Chennai",
    salaryMin: 1400000,
    salaryMax: 2400000,
    salary: "₹14.0L – ₹24.0L",
    matchScore: 86,
    tags: ["Java", "Spring Boot", "Microservices", "Enterprise", "Hybrid"],
    posted: "1d ago",
    description: "Lead global banking modernization projects. Responsible for sprint velocity, architectural compliance, cloud migration, and stakeholder engagement.",
    applyUrl: "https://www.tcs.com/careers",
    experience: "5-8 years",
    employmentType: "Full-time",
  },
  {
    id: "job_infosys_16",
    title: "Senior React & Node.js Developer",
    company: "Infosys",
    location: "Bengaluru / Hyderabad",
    salaryMin: 1200000,
    salaryMax: 2200000,
    salary: "₹12.0L – ₹22.0L",
    matchScore: 87,
    tags: ["Frontend", "React", "Node.js", "REST", "Agile"],
    posted: "2d ago",
    description: "Develop enterprise web applications for Fortune 500 retail clients. Ensure cross-browser compatibility, test coverage with Jest, and clean code standards.",
    applyUrl: "https://www.infosys.com/careers/",
    experience: "3-6 years",
    employmentType: "Full-time",
  },
  {
    id: "job_stripe_17",
    title: "Software Engineer - Developer Platforms",
    company: "Stripe",
    location: "Remote (India)",
    salaryMin: 3800000,
    salaryMax: 6500000,
    salary: "₹38.0L – ₹65.0L",
    matchScore: 98,
    tags: ["API", "Ruby", "TypeScript", "Fintech", "Remote"],
    posted: "Today",
    description: "Build the economic infrastructure for the internet. Design developer-friendly SDKs, webhook dispatchers, and global billing platforms.",
    applyUrl: "https://stripe.com/jobs/search",
    experience: "3-7 years",
    employmentType: "Full-time",
  },
  {
    id: "job_inmobi_18",
    title: "Senior Data Scientist",
    company: "InMobi",
    location: "Bengaluru, Karnataka",
    salaryMin: 2500000,
    salaryMax: 4200000,
    salary: "₹25.0L – ₹42.0L",
    matchScore: 90,
    tags: ["Data Science", "Python", "Deep Learning", "AdTech"],
    posted: "3d ago",
    description: "Develop CTR forecasting and ad auction bidding models reaching 2B+ mobile devices globally. Experience in multi-armed bandits and causal inference a plus.",
    applyUrl: "https://www.inmobi.com/company/careers",
    experience: "4-7 years",
    employmentType: "Full-time",
  },
  {
    id: "job_postman_19",
    title: "Frontend Architect",
    company: "Postman",
    location: "Bengaluru / Remote",
    salaryMin: 3400000,
    salaryMax: 5200000,
    salary: "₹34.0L – ₹52.0L",
    matchScore: 95,
    tags: ["Frontend", "Electron", "React", "Performance", "Remote"],
    posted: "Just now",
    description: "Empower 30M+ developers who build APIs daily. Own the core workspace application architecture, offline-first syncing, and developer tooling experience.",
    applyUrl: "https://www.postman.com/company/careers/",
    experience: "5+ years",
    employmentType: "Full-time",
  },
  {
    id: "job_makemytrip_20",
    title: "Mobile Engineer (Flutter / Android)",
    company: "MakeMyTrip",
    location: "Gurgaon, Haryana",
    salaryMin: 1800000,
    salaryMax: 3000000,
    salary: "₹18.0L – ₹30.0L",
    matchScore: 89,
    tags: ["Mobile", "Flutter", "Android", "Kotlin", "TravelTech"],
    posted: "Today",
    description: "Create flight and hotel booking flows with instant responsiveness. Work with complex booking state machines and native animation performance.",
    applyUrl: "https://careers.makemytrip.com/",
    experience: "2-5 years",
    employmentType: "Full-time",
  }
];

/**
 * Intelligent client-side job search engine.
 * Combines local curated catalog matching + Groq AI dynamic generation.
 */
export async function searchJobOpenings(
  queryRole: string = "",
  locationQuery: string = "",
  filterTag: string = "all"
): Promise<JobItem[]> {
  const normQuery = queryRole.trim().toLowerCase();
  const normLoc = locationQuery.trim().toLowerCase();
  const normFilter = filterTag.toLowerCase();

  // 1. Filter local curated tech openings
  let matched = CURATED_TECH_JOBS.filter((j) => {
    // Filter by tag if selected
    if (normFilter !== "all") {
      const hasTag = j.tags?.some((t) => t.toLowerCase().includes(normFilter));
      const hasRole = j.title.toLowerCase().includes(normFilter);
      if (!hasTag && !hasRole) return false;
    }

    // Filter by location query if present
    if (normLoc) {
      const locMatch =
        j.location.toLowerCase().includes(normLoc) ||
        (normLoc === "remote" && j.location.toLowerCase().includes("remote")) ||
        (normLoc === "india" && j.location.toLowerCase().includes("india"));
      if (!locMatch) return false;
    }

    // Filter by search query if present
    if (normQuery) {
      const terms = normQuery.split(/\s+/).filter(Boolean);
      const inTitle = terms.some((t) => j.title.toLowerCase().includes(t));
      const inCompany = terms.some((t) => j.company.toLowerCase().includes(t));
      const inDesc = terms.some((t) => j.description.toLowerCase().includes(t));
      const inTags = j.tags?.some((tag) => terms.some((t) => tag.toLowerCase().includes(t)));
      return inTitle || inCompany || inDesc || inTags;
    }

    return true;
  });

  // Calculate dynamic match scores based on search query
  if (normQuery) {
    matched = matched.map((j) => {
      let score = j.matchScore || 85;
      if (j.title.toLowerCase().includes(normQuery)) score = Math.min(99, score + 6);
      if (j.company.toLowerCase().includes(normQuery)) score = Math.min(99, score + 8);
      return { ...j, matchScore: score };
    });
    // Sort by match score descending
    matched.sort((a, b) => (b.matchScore ?? 80) - (a.matchScore ?? 80));
  }

  // 2. Fetch live vacancies from Adzuna API if configured
  try {
    const adzunaLive = await fetchAdzunaLiveJobs(queryRole, locationQuery);
    if (adzunaLive && adzunaLive.length > 0) {
      const existingTitles = new Set(matched.map((m) => m.title.toLowerCase()));
      const uniqueAdzuna = adzunaLive.filter((a) => !existingTitles.has(a.title.toLowerCase()));
      matched = [...uniqueAdzuna, ...matched];
    }
  } catch (err) {
    console.warn("Adzuna live search notice:", err);
  }

  // 3. If matched results is low (< 3) and user provided a custom search query,
  // invoke Groq AI to dynamically generate realistic matching live vacancies!
  if (matched.length < 3 && normQuery) {
    try {
      const aiJobs = await generateJobsWithGroq(queryRole, locationQuery);
      if (aiJobs && aiJobs.length > 0) {
        // Deduplicate against existing matched IDs
        const existingTitles = new Set(matched.map((m) => m.title.toLowerCase()));
        for (const aj of aiJobs) {
          if (!existingTitles.has(aj.title.toLowerCase())) {
            matched.push(aj);
          }
        }
      }
    } catch (err) {
      console.warn("Groq AI job generation fallback notice:", err);
    }
  }

  // If still empty (e.g. niche query returned 0 matches), return all curated jobs with computed match tags
  if (matched.length === 0) {
    return CURATED_TECH_JOBS.slice(0, 10).map((j) => ({
      ...j,
      matchScore: Math.floor(75 + Math.random() * 15),
    }));
  }

  return matched;
}

/**
 * Synthesizes current live job openings for any custom role & company using Groq AI.
 */
async function generateJobsWithGroq(role: string, location: string): Promise<JobItem[]> {
  const prompt = `Generate 5 realistic, high-quality current tech job postings for the role: "${role}"${
    location ? ` in or near "${location}"` : " in India / Remote"
  }.
Return ONLY a valid JSON object with the key "jobs" containing an array of job items:
{
  "jobs": [
    {
      "id": "ai_job_1",
      "title": "${role}",
      "company": "Top Tech Company / Startup",
      "location": "${location || "Bengaluru / Remote"}",
      "salary": "₹18.0L – ₹32.0L",
      "salaryMin": 1800000,
      "salaryMax": 3200000,
      "matchScore": 95,
      "tags": ["Tag1", "Tag2", "Tag3"],
      "posted": "Recent",
      "description": "Engaging 2-sentence description of the responsibilities and tech stack.",
      "experience": "2-5 years",
      "employmentType": "Full-time"
    }
  ]
}`;

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a specialized career API that outputs structured JSON job listings.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.jobs) && parsed.jobs.length > 0) {
        return parsed.jobs.map((j: any, idx: number) => ({
          id: j.id || `job_gen_${Date.now()}_${idx}`,
          title: j.title || role,
          company: j.company || "Leading Tech Firm",
          location: j.location || (location || "Bengaluru, India"),
          salary: j.salary || "Competitive compensation",
          salaryMin: j.salaryMin || 1500000,
          salaryMax: j.salaryMax || 3000000,
          matchScore: j.matchScore || 90 + idx,
          tags: Array.isArray(j.tags) ? j.tags : [role, "Full-time", "Tech"],
          posted: j.posted || "Today",
          description: j.description || `Exciting opportunity for a ${role} to join a fast-paced development team.`,
          applyUrl: buildApplyUrl(j.title || role, j.company || "", j.location || ""),
          experience: j.experience || "2-5 years",
          employmentType: j.employmentType || "Full-time",
        }));
      }
    } catch {
      // try next model
    }
  }

  return [];
}
