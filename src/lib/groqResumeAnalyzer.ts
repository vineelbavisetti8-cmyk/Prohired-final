/**
 * groqResumeAnalyzer.ts
 * Deep ATS resume analysis powered by Groq LLM (llama-3.3-70b-versatile).
 * Called client-side — no edge function required.
 */

const GROQ_API_KEY = "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";
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound",
  "groq/compound-mini",
];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqATSResult {
  atsScore: number;
  breakdown: {
    content: number;
    keywords: number;
    format: number;
    quantification: number;
  };
  weaknesses: Array<{
    issue: string;
    suggestion: string;
    severity: "critical" | "warning" | "suggestion";
  }>;
  strengths: string[];
  missingKeywords: string[];
  jobMatches: Array<{
    role: string;
    matchPercent: number;
    salaryRangeIndia: string;
    reasoning: string;
    skillsNeeded: string[];
  }>;
  rewrittenResume: string;
  targetRole?: string;
  targetCompany?: string;
}

export async function analyzeResumeWithGroq(
  resumeText: string,
  targetRole: string,
  targetCompany?: string
): Promise<GroqATSResult> {
  const companyContext = targetCompany
    ? `The candidate is specifically targeting **${targetCompany}**.`
    : "";

  const systemPrompt = `You are a 1000+ year senior HR expert who reviews 1000+ resumes per day. You have deep knowledge of ATS systems (Greenhouse, Workday, Lever, iCIMS) and hiring patterns at top companies. You provide extremely detailed, honest, actionable resume analysis.`;

  const userPrompt = `Analyze the following resume for a candidate targeting a **${targetRole}** position. ${companyContext}

Provide a comprehensive ATS analysis and return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:

{
  "atsScore": <integer 0-100 reflecting real ATS pass probability>,
  "breakdown": {
    "content": <0-100 content relevance & impact>,
    "keywords": <0-100 tech stack & keyword density for ${targetRole}>,
    "format": <0-100 ATS parser friendliness, layout, typography>,
    "quantification": <0-100 measurable business metrics & numbers>
  },
  "weaknesses": [
    {
      "issue": "<specific problem in this resume>",
      "suggestion": "<exact fix with example>",
      "severity": "<critical|warning|suggestion>"
    }
  ],
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "missingKeywords": ["<keyword missing for ${targetRole}>", ...],
  "jobMatches": [
    {
      "role": "<matched role title>",
      "matchPercent": <integer 60-99>,
      "salaryRangeIndia": "<e.g. ₹12L – ₹18L>",
      "reasoning": "<why they match this role>",
      "skillsNeeded": ["<skill>", ...]
    }
  ],
  "rewrittenResume": "<Full ATS-optimized markdown resume rewritten for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}. Use strong action verbs, quantify every achievement, include all missing keywords naturally. Format with ## sections.>"
}

Provide at least 5 weaknesses (mix of critical/warning/suggestion), 5 strengths, 8+ missing keywords relevant to ${targetRole}, and 4 job matches.

RESUME TEXT:
---
${resumeText.slice(0, 6000)}
---`;

  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`Groq model ${model} error ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error(`Empty content from Groq model ${model}`);
        continue;
      }

      let parsed: GroqATSResult;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse Groq response as JSON");
        parsed = JSON.parse(match[0]);
      }

      return {
        atsScore: Math.min(100, Math.max(0, parsed.atsScore ?? 60)),
        breakdown: {
          content: parsed.breakdown?.content ?? 65,
          keywords: parsed.breakdown?.keywords ?? 60,
          format: parsed.breakdown?.format ?? 70,
          quantification: parsed.breakdown?.quantification ?? 55,
        },
        weaknesses: parsed.weaknesses ?? [],
        strengths: parsed.strengths ?? [],
        missingKeywords: parsed.missingKeywords ?? [],
        jobMatches: parsed.jobMatches ?? [],
        rewrittenResume: parsed.rewrittenResume ?? resumeText,
        targetRole,
        targetCompany,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Groq models failed to analyze resume");
}

