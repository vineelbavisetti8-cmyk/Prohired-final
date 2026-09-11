import { ReactNode } from "react";
import { Construction } from "lucide-react";

export default function ComingSoon({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="container max-w-3xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {children ?? "This screen is in active development. Coming in the next iteration."}
      </p>
    </div>
  );
}
