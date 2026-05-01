import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2 | 3;
}

export const CheckboxGroup = ({ options, value, onChange, columns = 2 }: CheckboxGroupProps) => {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridClass)}>
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
              checked
                ? "border-primary/60 bg-primary/5 text-foreground shadow-sm"
                : "border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
              )}
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="leading-snug">{option}</span>
          </button>
        );
      })}
    </div>
  );
};
