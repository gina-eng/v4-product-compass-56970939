import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { computeRoas } from "../format";
import type { ChannelInvestment } from "../types";
import { cn } from "@/lib/utils";

interface ChannelInvestmentListProps {
  options: string[];
  value: ChannelInvestment[];
  errors: Record<string, string>;
  onChange: (next: ChannelInvestment[]) => void;
}

const currencyFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const sumNumbers = (values: string[]): number =>
  values.reduce((acc, v) => {
    const n = Number((v || "").replace(",", "."));
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);

export const ChannelInvestmentList = ({
  options,
  value,
  errors,
  onChange,
}: ChannelInvestmentListProps) => {
  const isActive = (name: string) => value.some((v) => v.channel === name);

  const togglePredefined = (name: string) => {
    if (isActive(name)) {
      onChange(value.filter((v) => v.channel !== name));
    } else {
      onChange([...value, { channel: name, investment: "", revenue: "" }]);
    }
  };

  const updateAt = (index: number, patch: Partial<ChannelInvestment>) => {
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addCustom = () => {
    onChange([...value, { channel: "", investment: "", revenue: "" }]);
  };

  const totalInvestment = sumNumbers(value.map((v) => v.investment));
  const totalRevenue = sumNumbers(value.map((v) => v.revenue));
  const totalRoas = totalInvestment > 0 ? totalRevenue / totalInvestment : null;

  const customEntries = value
    .map((v, i) => ({ entry: v, index: i }))
    .filter(({ entry }) => !options.includes(entry.channel));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((name) => {
          const active = isActive(name);
          const index = value.findIndex((v) => v.channel === name);
          const entry = active ? value[index] : null;
          const roas = entry ? computeRoas(entry.revenue, entry.investment) : null;
          const error = active ? errors[`executarChannels.${index}`] : undefined;

          return (
            <div
              key={name}
              className={cn(
                "rounded-xl border transition-all",
                active
                  ? "border-executar/50 bg-executar/5 shadow-sm"
                  : "border-border/70 bg-background hover:border-executar/40 hover:bg-muted/40",
              )}
            >
              <button
                type="button"
                onClick={() => togglePredefined(name)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span
                  className={cn(
                    "h-4 w-4 rounded border transition-colors",
                    active ? "border-executar bg-executar" : "border-border bg-background",
                  )}
                  aria-hidden
                />
              </button>

              {active && entry && (
                <div className="border-t border-border/60 bg-background/60 px-4 py-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Investimento (R$)
                      </span>
                      <Input
                        type="number"
                        step="any"
                        value={entry.investment}
                        onChange={(e) => updateAt(index, { investment: e.target.value })}
                        placeholder="0,00"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Receita gerada (R$)
                      </span>
                      <Input
                        type="number"
                        step="any"
                        value={entry.revenue}
                        onChange={(e) => updateAt(index, { revenue: e.target.value })}
                        placeholder="0,00"
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ROAS do canal</span>
                    <span
                      className={cn(
                        "font-semibold",
                        roas === null
                          ? "text-muted-foreground"
                          : roas >= 1
                            ? "text-ter"
                            : "text-destructive",
                      )}
                    >
                      {roas === null
                        ? "—"
                        : `${roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                    </span>
                  </div>
                  {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {customEntries.length > 0 && (
        <div className="space-y-2">
          {customEntries.map(({ entry, index }) => {
            const roas = computeRoas(entry.revenue, entry.investment);
            const error = errors[`executarChannels.${index}`];
            return (
              <div
                key={index}
                className="rounded-xl border border-dashed border-executar/40 bg-background p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-executar/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-executar">
                    Canal customizado
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAt(index)}
                    aria-label="Remover canal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    value={entry.channel}
                    onChange={(e) => updateAt(index, { channel: e.target.value })}
                    placeholder="Nome do canal"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={entry.investment}
                    onChange={(e) => updateAt(index, { investment: e.target.value })}
                    placeholder="Investimento (R$)"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={entry.revenue}
                    onChange={(e) => updateAt(index, { revenue: e.target.value })}
                    placeholder="Receita (R$)"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ROAS do canal</span>
                  <span
                    className={cn(
                      "font-semibold",
                      roas === null
                        ? "text-muted-foreground"
                        : roas >= 1
                          ? "text-ter"
                          : "text-destructive",
                    )}
                  >
                    {roas === null
                      ? "—"
                      : `${roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addCustom}>
        <Plus className="mr-1 h-4 w-4" /> Adicionar outro canal
      </Button>

      {value.length > 0 && (
        <div className="rounded-xl border border-executar/30 bg-executar/5 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Investimento total
              </p>
              <p className="text-sm font-bold text-foreground">
                {currencyFmt.format(totalInvestment)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Receita total
              </p>
              <p className="text-sm font-bold text-foreground">{currencyFmt.format(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                ROAS médio
              </p>
              <p
                className={cn(
                  "text-sm font-bold",
                  totalRoas === null
                    ? "text-muted-foreground"
                    : totalRoas >= 1
                      ? "text-ter"
                      : "text-destructive",
                )}
              >
                {totalRoas === null
                  ? "—"
                  : `${totalRoas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
