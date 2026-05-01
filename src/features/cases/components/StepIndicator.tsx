import { Check, CircleDashed, Pencil } from "lucide-react";
import { STEPS } from "../options";
import type { StepCompletion } from "../validation";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  completion: Record<number, StepCompletion>;
  onJump: (step: number) => void;
}

const STATE_LABEL: Record<StepCompletion, string> = {
  empty: "Não iniciada",
  partial: "Em andamento",
  complete: "Completa",
};

export const StepIndicator = ({ currentStep, completion, onJump }: StepIndicatorProps) => {
  return (
    <ol className="flex w-full items-stretch overflow-x-auto rounded-2xl border border-border/70 bg-card p-1.5 shadow-sm">
      {STEPS.map((step, index) => {
        const state = completion[step.id] ?? "empty";
        const isCurrent = currentStep === step.id;

        const badgeClass =
          state === "complete"
            ? "bg-ter text-ter-foreground"
            : state === "partial"
              ? "bg-amber-400 text-amber-950"
              : isCurrent
                ? "bg-primary text-primary-foreground"
                : "border border-border/70 bg-background text-muted-foreground";

        const icon =
          state === "complete" ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : state === "partial" ? (
            <Pencil className="h-3 w-3" strokeWidth={3} />
          ) : isCurrent ? (
            <span className="text-xs font-bold">{step.id}</span>
          ) : (
            <CircleDashed className="h-3.5 w-3.5" />
          );

        const stateBadgeClass =
          state === "complete"
            ? "bg-ter/10 text-ter"
            : state === "partial"
              ? "bg-amber-400/15 text-amber-700 dark:text-amber-400"
              : "bg-muted text-muted-foreground";

        return (
          <li key={step.id} className="flex min-w-[150px] flex-1">
            <button
              type="button"
              onClick={() => onJump(step.id)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                isCurrent
                  ? "bg-primary/5 ring-1 ring-primary/30"
                  : "hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
                  badgeClass,
                )}
              >
                {icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Etapa {step.id}
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {step.title}
                </span>
                <span
                  className={cn(
                    "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    stateBadgeClass,
                  )}
                >
                  {STATE_LABEL[state]}
                </span>
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span aria-hidden className="mx-0.5 hidden self-center text-border md:block">
                ›
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
