import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How is ProHired different from a resume builder?", a: "We don't just format your resume — we score it like a real ATS, rewrite weak sections with AI, match you to live job openings, and prep you for the interview. It's an end-to-end career engine." },
  { q: "Is my data private?", a: "Yes. Your resume is stored encrypted, only accessible by you, and never shared. You can delete it anytime from your dashboard." },
  { q: "Which file formats are supported?", a: "PDF and DOCX. We also accept plain text. Files up to 10 MB." },
  { q: "How accurate is the ATS score?", a: "We model the same parsing rules major ATS platforms use — keyword density, section structure, action verbs, and quantification. Most users see real-world callback lifts within 2 weeks." },
  { q: "Can I cancel Pro anytime?", a: "Yes — cancel from your profile in one click. Plus a 7-day no-questions-asked refund." },
  { q: "Do you support roles outside India?", a: "Yes. Job matching covers India first, but the resume + ATS + interview features work for any global role." },
];

export function FAQ() {
  return (
    <section id="faq" className="relative container max-w-3xl px-4 py-12 sm:py-28">
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="section-tag"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.25em" }}
        >
          ✦ FAQ ✦
        </p>
        <h2
          className="mt-3 font-display text-2xl sm:text-4xl font-bold"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: "hsl(42 80% 88%)",
            letterSpacing: "0.02em",
          }}
        >
          Questions? We've Got Answers.
        </h2>
        <div className="divider-gold mx-auto mt-4 sm:mt-6 max-w-xs" />
      </div>

      <Accordion type="single" collapsible className="mt-8 sm:mt-12 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={i}
            value={`f-${i}`}
            className="overflow-hidden rounded-xl px-4 sm:px-5"
            style={{
              background: "linear-gradient(145deg, hsl(25 20% 9% / 0.90), hsl(20 15% 6% / 0.95))",
              border: "1px solid hsl(43 60% 40% / 0.20)",
              boxShadow: "0 4px 20px hsl(20 15% 2% / 0.40)",
            }}
          >
            <AccordionTrigger
              className="text-left hover:no-underline py-4 sm:py-5"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.82rem",
                color: "hsl(42 70% 80%)",
                letterSpacing: "0.03em",
                fontWeight: 600,
              }}
            >
              {f.q}
            </AccordionTrigger>
            <AccordionContent
              className="pb-5"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1rem",
                color: "hsl(38 32% 56%)",
                lineHeight: 1.75,
              }}
            >
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
