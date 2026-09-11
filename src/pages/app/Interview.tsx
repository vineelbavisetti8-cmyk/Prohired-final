import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  BookOpen,
  Loader2,
  Code2,
  Play,
  ChevronDown,
  Lightbulb,
  Trophy,
  AlertTriangle,
  Terminal,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";
import {
  generateCodingQuestions,
  executeCode,
  evaluateCode,
  type CodingQuestion,
  type QuestionDifficulty,
  type CodeFeedback,
} from "@/lib/groqInterviewQuestions";
import { supabase } from "@/integrations/supabase/client";

const SUPPORTED_LANGUAGES = [
  { id: "python", label: "Python", ext: "py", color: "#3B82F6" },
  { id: "javascript", label: "JavaScript", ext: "js", color: "#F59E0B" },
  { id: "java", label: "Java", ext: "java", color: "#EF4444" },
  { id: "cpp", label: "C++", ext: "cpp", color: "#8B5CF6" },
  { id: "typescript", label: "TypeScript", ext: "ts", color: "#06B6D4" },
];

const DIFFICULTY_CONFIG: Record<QuestionDifficulty, { label: string; cls: string; dot: string }> = {
  easy: { label: "Easy", cls: "text-emerald-700 border-emerald-300 bg-emerald-50", dot: "bg-emerald-600" },
  medium: { label: "Medium", cls: "text-amber-800 border-amber-300 bg-amber-50", dot: "bg-amber-600" },
  hard: { label: "Hard", cls: "text-rose-700 border-rose-300 bg-rose-50", dot: "bg-rose-600" },
};

const SUB_TABS: SubNavTab[] = [
  { id: "coding", label: "Coding Practice", icon: Code2, badge: "Live" },
  { id: "sim", label: "AI Mock Interview", icon: MessageSquare },
  { id: "star", label: "STAR Framework", icon: BookOpen },
];

export default function Interview() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("coding");

  // ── Coding Practice State ─────────────────────────────────────────────
  const [targetRole, setTargetRole] = useState(() => {
    try { return localStorage.getItem("prohired_target_role") || localStorage.getItem("hirerapid_target_role") || "Software Engineer"; } catch { return "Software Engineer"; }
  });
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [language, setLanguage] = useState("python");
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
  const [feedback, setFeedback] = useState<CodeFeedback | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  // ── Behavioral Mock State ─────────────────────────────────────────────
  const [behaviorRole, setBehaviorRole] = useState(() => {
    try { return localStorage.getItem("prohired_target_role") || "Software Engineer"; } catch { return "Software Engineer"; }
  });
  const [currentQuestion, setCurrentQuestion] = useState(
    "Tell me about a challenging technical or architectural problem you solved recently under tight constraints."
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [generatingQ, setGeneratingQ] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [behaviorFeedback, setBehaviorFeedback] = useState<any>(null);

  // ── Generate a Coding Question ────────────────────────────────────────
  const handleGenerateCodingQ = async () => {
    setLoadingQ(true);
    setQuestion(null);
    setUserCode("");
    setRunOutput(null);
    setFeedback(null);
    setShowHint(false);

    try {
      const questions = await generateCodingQuestions(targetRole, difficulty, 1);
      if (questions.length > 0) {
        const q = questions[0];
        setQuestion(q);
        // Set starter code for selected language
        const starter = q.starterCode?.[language] || `# Write your ${language} solution here\n`;
        setUserCode(starter);
        toast.success(`New ${difficulty} question generated for ${targetRole}!`);
      } else {
        throw new Error("No question returned");
      }
    } catch (err: any) {
      toast.error("Couldn't generate question. Using a sample...");
      // Fallback sample question
      const fallback: CodingQuestion = {
        id: "fallback",
        title: "Two Sum",
        difficulty: "easy",
        category: "arrays",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        starterCode: {
          python: "def twoSum(nums, target):\n    # Write your solution here\n    pass\n\n# Test\nprint(twoSum([2,7,11,15], 9))",
          javascript: "function twoSum(nums, target) {\n  // Write your solution here\n}\n\nconsole.log(twoSum([2,7,11,15], 9));",
          java: "class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[]{};\n  }\n}",
          cpp: "#include <bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n  // Write your solution here\n  return {};\n}",
          typescript: "function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\nconsole.log(twoSum([2,7,11,15], 9));",
        },
        hint: "Try using a hash map to store numbers you've seen. For each number, check if (target - number) is already in the map.",
        optimalApproach: "Use a hash map for O(n) time. For each element, check if complement exists in map, else add current to map.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
      };
      setQuestion(fallback);
      setUserCode(fallback.starterCode?.[language] || "");
    } finally {
      setLoadingQ(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (question?.starterCode?.[lang]) {
      setUserCode(question.starterCode[lang]);
    }
    setRunOutput(null);
    setFeedback(null);
  };

  const handleRunCode = async () => {
    if (!userCode.trim()) { toast.error("Write some code first!"); return; }
    setRunning(true);
    setRunOutput(null);
    setFeedback(null);

    try {
      const result = await executeCode(language, userCode);
      setRunOutput(result);
      if (result.exitCode === 0 && result.stdout) {
        toast.success("Code ran successfully!");
      } else if (result.stderr) {
        toast.error("Code has errors — check the output panel");
      }
    } catch (err: any) {
      toast.error("Code execution failed. Please try again.");
      setRunOutput({ stdout: "", stderr: err?.message || "Execution error", exitCode: 1 });
    } finally {
      setRunning(false);
    }
  };

  const handleEvaluateCode = async () => {
    if (!question || !userCode.trim()) { toast.error("Generate a question and write code first"); return; }
    setEvaluating(true);

    try {
      const fb = await evaluateCode(question, userCode, language, runOutput?.stdout || "");
      setFeedback(fb);
      toast.success(`AI evaluation complete! Score: ${fb.score}/100`);
    } catch {
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Handle Tab key in code editor
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = userCode.substring(0, start) + "    " + userCode.substring(end);
      setUserCode(newCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  // ── Behavioral Interview ──────────────────────────────────────────────
  const handleGenerateBehaviorQuestion = async () => {
    if (!behaviorRole.trim()) { toast.error("Enter a target role"); return; }
    setGeneratingQ(true);
    setBehaviorFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-interview-questions", {
        body: { role: behaviorRole, difficulty: "medium" },
      });
      if (!error && data?.questions?.length > 0) {
        setCurrentQuestion(data.questions[0].question);
      } else {
        const pool = [
          `As a ${behaviorRole}, tell me about a time you identified a critical flaw in production architecture and how you handled the resolution.`,
          `Describe a project where you had to balance technical debt against aggressive release deadlines as a ${behaviorRole}.`,
          `How do you approach code quality, test automation, and code reviews in your daily workflow as a ${behaviorRole}?`,
          `Walk me through an instance where you disagreed with a colleague or product decision as a ${behaviorRole}. What was the resolution?`,
        ];
        setCurrentQuestion(pool[Math.floor(Math.random() * pool.length)]);
      }
      toast.success("New question generated!");
    } catch {
      setCurrentQuestion(`Walk me through a high-impact project you led as a ${behaviorRole} and the quantifiable business outcomes.`);
    } finally {
      setGeneratingQ(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.trim().length < 30) {
      toast.error("Write a detailed response (at least 2-3 sentences).");
      return;
    }
    setAnalyzing(true);
    setBehaviorFeedback(null);
    await new Promise((r) => setTimeout(r, 1000));

    const words = userAnswer.trim().split(/\s+/);
    const hasNumbers = /\d+/.test(userAnswer);
    const hasSituation = /when|at|during|while|project|time|team/i.test(userAnswer);
    const hasAction = /built|developed|created|analyzed|refactored|designed|implemented|resolved|managed|led/i.test(userAnswer);
    const hasResult = /result|saved|increased|reduced|achieved|improved|delivered/i.test(userAnswer);

    let score = 70;
    if (hasNumbers) score += 10;
    if (hasSituation) score += 5;
    if (hasAction) score += 8;
    if (hasResult) score += 7;
    score = Math.min(96, Math.max(65, score));

    setBehaviorFeedback({
      overallScore: score,
      wordCount: words.length,
      starBreakdown: {
        situation: { score: hasSituation ? 90 : 70, comment: hasSituation ? "Clear context and problem framing." : "Provide more background context." },
        task: { score: 85, comment: "Clear statement of technical objectives." },
        action: { score: hasAction ? 92 : 75, comment: hasAction ? "Strong actionable verbs detailing your contribution." : "Focus on specific decisions you implemented." },
        result: { score: hasNumbers ? 94 : 70, comment: hasNumbers ? "Quantified metrics make your answer compelling." : "Quantify the outcome (e.g. % improvement)." },
      },
      recommendations: [
        hasNumbers ? "Great use of measurable metrics." : "Add specific numbers (e.g. latency, throughput, time saved).",
        words.length > 180 ? "Optimal response length." : "Aim for around 150-250 words to explain impact thoroughly.",
      ],
    });
    setAnalyzing(false);
    toast.success(`Analysis ready! Score: ${score}/100`);
  };

  return (
    <div className="flex flex-col min-h-full">
      <AppSubNav tabs={SUB_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-7 space-y-5">

        {/* ── TAB 1: CODING PRACTICE ──────────────────────────────── */}
        {activeTab === "coding" && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Code2 className="h-6 w-6 text-orange-600" />
                ProHired Coding Practice
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                AI-generated DSA & programming questions with live code execution — practice like a real interview.
              </p>
            </div>

            {/* Config Row */}
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Target Role
                  </label>
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Data Scientist"
                    className="bg-white border-gray-200 text-xs rounded-xl h-9"
                  />
                </div>
                <div className="sm:w-36">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Difficulty
                  </label>
                  <div className="flex gap-1">
                    {(["easy", "medium", "hard"] as QuestionDifficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 text-[11px] font-bold rounded-lg py-2 border transition-all ${
                          difficulty === d
                            ? DIFFICULTY_CONFIG[d].cls + " border-current"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {DIFFICULTY_CONFIG[d].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="self-end">
                  <Button
                    onClick={handleGenerateCodingQ}
                    disabled={loadingQ}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl h-9 px-4 shrink-0 shadow-glow-primary w-full sm:w-auto"
                  >
                    {loadingQ ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                    {loadingQ ? "Generating..." : "New Question"}
                  </Button>
                </div>
              </div>
            </div>

            {/* No question yet */}
            {!question && !loadingQ && (
              <div className="glass-card p-10 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-400/40 text-orange-600">
                  <Code2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">Ready to practice?</h3>
                <p className="text-xs text-gray-500">
                  Click "New Question" to get an AI-generated coding problem for your role.
                </p>
                <Button
                  onClick={handleGenerateCodingQ}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generate My First Question
                </Button>
              </div>
            )}

            {loadingQ && (
              <div className="glass-card p-8 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                <p className="text-sm font-semibold text-foreground">Generating {difficulty} question for {targetRole}...</p>
                <p className="text-xs text-gray-400">ProHired AI is crafting a real interview challenge</p>
              </div>
            )}

            {/* Main Coding Interface */}
            {question && !loadingQ && (
              <div className="space-y-4">
                {/* Problem Statement */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-foreground">{question.title}</h3>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${DIFFICULTY_CONFIG[question.difficulty].cls}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${DIFFICULTY_CONFIG[question.difficulty].dot}`} />
                          {DIFFICULTY_CONFIG[question.difficulty].label}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600 font-medium capitalize">
                          {question.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{question.description}</p>

                  {showHint && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-700 flex gap-2">
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{question.hint}</span>
                    </div>
                  )}

                  {/* Examples */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Examples</h4>
                    {question.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs space-y-1">
                        <div><span className="font-bold text-gray-500">Input: </span><span className="text-gray-800">{ex.input}</span></div>
                        <div><span className="font-bold text-gray-500">Output: </span><span className="text-emerald-600 font-bold">{ex.output}</span></div>
                        {ex.explanation && <div className="text-gray-500 mt-0.5"><span className="font-bold">Explanation: </span>{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {question.constraints.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Constraints</h4>
                      <ul className="space-y-0.5">
                        {question.constraints.map((c, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-orange-400 font-bold mt-0.5">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Complexity info */}
                  <div className="flex gap-4 pt-1 border-t border-gray-100">
                    <div className="text-[11px]"><span className="text-gray-400">Time: </span><span className="font-bold text-gray-700">{question.timeComplexity}</span></div>
                    <div className="text-[11px]"><span className="text-gray-400">Space: </span><span className="font-bold text-gray-700">{question.spaceComplexity}</span></div>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  {/* Editor Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-700">
                    <div className="flex gap-1.5 flex-wrap">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => handleLanguageChange(lang.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            language === lang.id
                              ? "bg-orange-500 text-white"
                              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleRunCode}
                        disabled={running}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg h-8 px-3 gap-1.5 font-bold"
                      >
                        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        {running ? "Running..." : "Run Code"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEvaluateCode}
                        disabled={evaluating || !runOutput}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg h-8 px-3 gap-1.5 font-bold"
                      >
                        {evaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {evaluating ? "Evaluating..." : "AI Review"}
                      </Button>
                    </div>
                  </div>

                  {/* Code Textarea — monospace editor */}
                  <div className="relative bg-gray-950">
                    <textarea
                      ref={codeRef}
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      onKeyDown={handleCodeKeyDown}
                      spellCheck={false}
                      className="w-full min-h-[280px] sm:min-h-[340px] bg-transparent text-gray-100 font-mono text-xs sm:text-sm p-4 resize-y focus:outline-none leading-relaxed"
                      placeholder="// Write your solution here..."
                      style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
                    />
                  </div>

                  {/* Output Panel */}
                  <div className="border-t border-gray-700 bg-gray-900">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700">
                      <Terminal className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Output</span>
                      {runOutput && (
                        <span className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                          runOutput.exitCode === 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-rose-50 text-rose-700 border-rose-300"
                        }`}>
                          {runOutput.exitCode === 0 ? "✓ Success" : "✗ Error"}
                        </span>
                      )}
                    </div>
                    <div className="p-4 min-h-[80px] max-h-48 overflow-auto bg-gray-950 rounded-b-2xl">
                      {running ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing code...
                        </div>
                      ) : runOutput ? (
                        <div className="font-mono text-xs space-y-1">
                          {runOutput.stdout && (
                            <pre className="text-emerald-400 whitespace-pre-wrap">{runOutput.stdout}</pre>
                          )}
                          {runOutput.stderr && (
                            <pre className="text-rose-400 whitespace-pre-wrap">{runOutput.stderr}</pre>
                          )}
                          {!runOutput.stdout && !runOutput.stderr && (
                            <span className="text-gray-400">No output</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Click "Run Code" to execute your solution</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                {feedback && (
                  <div className="glass-card p-4 sm:p-5 rounded-2xl border-orange-400/30 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-orange-500" />
                        AI Code Review
                      </h4>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm ${
                        feedback.score >= 80
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : feedback.score >= 60
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-rose-300 bg-rose-50 text-rose-700"
                      }`}>
                        {feedback.score}/100
                        {feedback.correct && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <div className="text-[11px] text-gray-500 uppercase font-bold mb-1">Your Time</div>
                        <div className="text-sm font-extrabold text-foreground">{feedback.timeComplexity}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <div className="text-[11px] text-gray-500 uppercase font-bold mb-1">Your Space</div>
                        <div className="text-sm font-extrabold text-foreground">{feedback.spaceComplexity}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Suggestions</h5>
                      {feedback.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          {s}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-400/20">
                      <h5 className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5" /> Optimal Approach
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed">{feedback.optimizedApproach}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: BEHAVIORAL MOCK ──────────────────────────────── */}
        {activeTab === "sim" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-600" />
                ProHired AI Mock Interview
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Behavioral STAR questions for your role — get instant AI critique on your answer.
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 max-w-sm">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Target Role</label>
                  <Input
                    value={behaviorRole}
                    onChange={(e) => setBehaviorRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Product Manager"
                    className="bg-white border-gray-200 text-xs rounded-xl h-9"
                  />
                </div>
                <Button
                  onClick={handleGenerateBehaviorQuestion}
                  disabled={generatingQ}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl h-9 px-4 shrink-0 self-end w-full sm:w-auto"
                >
                  {generatingQ ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                  New Question
                </Button>
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Interview Question:</span>
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  "{currentQuestion}"
                </h3>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800">Your Answer:</label>
                <span className="text-[11px] text-gray-500">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <Textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your authentic response. Structure it with Situation, Task, Action, and quantifiable Result..."
                className="bg-white/90 border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl focus:ring-orange-500"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Target 150-250 words with measurable impact
                </span>
                <Button
                  onClick={handleEvaluateAnswer}
                  disabled={analyzing}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold h-10 px-5 gap-2 w-full sm:w-auto"
                >
                  {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating...</> : <><Sparkles className="h-4 w-4" /> Evaluate My Answer</>}
                </Button>
              </div>
            </div>

            {behaviorFeedback && (
              <div className="glass-card p-5 sm:p-6 rounded-2xl border-emerald-300 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-700 text-base">
                      {behaviorFeedback.overallScore}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">STAR Assessment Score</h4>
                      <p className="text-xs text-emerald-700 font-bold">
                        {behaviorFeedback.overallScore >= 80 ? "✓ Strong Candidate Response" : "Good Start - Refine STAR details"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {behaviorFeedback.wordCount} words
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(behaviorFeedback.starBreakdown).map(([k, v]: [string, any]) => (
                    <div key={k} className="p-3 rounded-xl bg-white/80 border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase font-bold text-orange-700 text-[10px]">{k}</span>
                        <span className="font-extrabold text-emerald-700">{v.score}%</span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2">{v.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Evaluation Highlights:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {behaviorFeedback.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-orange-600 font-bold">•</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: STAR FRAMEWORK ──────────────────────────────── */}
        {activeTab === "star" && (
          <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
            <h3 className="text-base font-bold text-foreground">The STAR Method Blueprint</h3>
            <div className="space-y-3">
              {[
                { letter: "S", title: "Situation", desc: "Set the scene. Outline the context, team setup, and specific technical or business problem you faced.", color: "bg-blue-500/15 border-blue-400/40 text-blue-600" },
                { letter: "T", title: "Task", desc: "Define your exact responsibility. What goal, milestone, or SLA were you required to achieve?", color: "bg-purple-500/15 border-purple-400/40 text-purple-600" },
                { letter: "A", title: "Action", desc: "Detail your individual technical execution. What code, tool, diagnosis, or leadership did you implement?", color: "bg-orange-500/15 border-orange-400/40 text-orange-600" },
                { letter: "R", title: "Result", desc: "Highlight measurable business outcomes. Mention percentage improvements, cost reductions, or uptime metrics.", color: "bg-emerald-500/15 border-emerald-400/40 text-emerald-600" },
              ].map((s) => (
                <div key={s.letter} className="glass-card p-4 rounded-2xl flex items-start gap-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${s.color} font-bold text-base shrink-0`}>
                    {s.letter}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{s.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
