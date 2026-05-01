import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "../components/FieldShell";
import { METRICS_BY_MODEL, TIME_TO_RESULT_OPTIONS } from "../options";
import type { SalesModel } from "../options";
import type { CaseRecord, PrimaryMetricEntry, SecondaryMetric } from "../types";
import {
  computeRoas,
  computeVariation,
  formatMetricValue,
  formatVariation,
  isImprovement,
} from "../format";
import { cn } from "@/lib/utils";

const sumChannelField = (
  channels: CaseRecord["executarChannels"],
  field: "investment" | "revenue",
): number =>
  channels.reduce((acc, c) => {
    const n = Number((c[field] || "").replace(",", "."));
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const MAX_SECONDARY_METRICS = 2;

const emptySecondary: SecondaryMetric = { name: "", before: "", after: "" };

const isFilledPrimary = (m: PrimaryMetricEntry) =>
  Boolean((m.before ?? "").trim() || (m.after ?? "").trim());
const isFilledSecondary = (m: SecondaryMetric) =>
  Boolean(
    (m.name ?? "").trim() ||
      (m.before ?? "").trim() ||
      (m.after ?? "").trim(),
  );

export const Step5Results = ({ record, errors, update }: StepProps) => {
  const salesModel = (record.salesModel || "hibrido") as SalesModel;
  const metrics = METRICS_BY_MODEL[salesModel];

  const roas = computeRoas(record.attributedRevenue, record.mediaInvestment);
  const roasMode = record.products.includes("executar");

  const channelTotalInvestment = useMemo(
    () => sumChannelField(record.executarChannels, "investment"),
    [record.executarChannels],
  );
  const channelTotalRevenue = useMemo(
    () => sumChannelField(record.executarChannels, "revenue"),
    [record.executarChannels],
  );

  // Auto-fill on first entry: se há canais com valores e os campos estão vazios,
  // puxa a soma da Etapa 4. Roda uma vez por sessão de edição.
  const autoFilledRef = useRef(false);
  useEffect(() => {
    if (!roasMode || autoFilledRef.current) return;
    if (record.executarChannels.length === 0) return;
    const patch: Partial<CaseRecord> = {};
    if (!record.mediaInvestment && channelTotalInvestment > 0) {
      patch.mediaInvestment = String(channelTotalInvestment);
    }
    if (!record.attributedRevenue && channelTotalRevenue > 0) {
      patch.attributedRevenue = String(channelTotalRevenue);
    }
    if (Object.keys(patch).length > 0) {
      autoFilledRef.current = true;
      update(patch);
    } else if (record.mediaInvestment && record.attributedRevenue) {
      autoFilledRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roasMode, channelTotalInvestment, channelTotalRevenue, record.executarChannels.length]);

  const syncFromChannels = () => {
    update({
      mediaInvestment: channelTotalInvestment > 0 ? String(channelTotalInvestment) : "",
      attributedRevenue: channelTotalRevenue > 0 ? String(channelTotalRevenue) : "",
    });
  };

  const investmentDiverges =
    channelTotalInvestment > 0 &&
    record.mediaInvestment !== "" &&
    Number(record.mediaInvestment.replace(",", ".")) !== channelTotalInvestment;
  const revenueDiverges =
    channelTotalRevenue > 0 &&
    record.attributedRevenue !== "" &&
    Number(record.attributedRevenue.replace(",", ".")) !== channelTotalRevenue;
  const showSyncBanner = roasMode && (investmentDiverges || revenueDiverges);

  // Sincroniza primaryMetrics com o catálogo do modelo de venda — cada métrica vira uma linha fixa.
  // Preserva valores antes/depois de entradas existentes; entradas fora do catálogo (legado de outro modelo) são descartadas.
  useEffect(() => {
    const catalog = metrics;
    const byKey = new Map(record.primaryMetrics.map((m) => [m.metricKey, m]));
    const next: PrimaryMetricEntry[] = catalog.map((m) => {
      const existing = byKey.get(m.value);
      return {
        metricKey: m.value,
        label: m.label,
        unit: m.unit,
        before: existing?.before ?? "",
        after: existing?.after ?? "",
      };
    });
    const same =
      next.length === record.primaryMetrics.length &&
      next.every((m, i) => {
        const cur = record.primaryMetrics[i];
        return (
          cur &&
          cur.metricKey === m.metricKey &&
          cur.label === m.label &&
          cur.unit === m.unit &&
          cur.before === m.before &&
          cur.after === m.after
        );
      });
    if (!same) update({ primaryMetrics: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesModel]);

  // Pad slots de métricas secundárias na primeira entrada.
  const secondaryPadRef = useRef(false);
  useEffect(() => {
    if (secondaryPadRef.current) return;
    secondaryPadRef.current = true;
    if (record.secondaryMetrics.length < MAX_SECONDARY_METRICS) {
      update({
        secondaryMetrics: [
          ...record.secondaryMetrics,
          ...Array.from(
            { length: MAX_SECONDARY_METRICS - record.secondaryMetrics.length },
            () => ({ ...emptySecondary }),
          ),
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filledPrimaryCount = record.primaryMetrics.filter(isFilledPrimary).length;
  const filledSecondaryCount = record.secondaryMetrics.filter(isFilledSecondary).length;

  // Particiona as métricas em principais (visíveis sempre) e extras (atrás de toggle).
  const principalIndices = useMemo(() => {
    return record.primaryMetrics
      .map((entry, index) => {
        const meta = metrics.find((m) => m.value === entry.metricKey);
        return meta?.principal ? index : -1;
      })
      .filter((i) => i >= 0);
  }, [record.primaryMetrics, metrics]);

  const extraIndices = useMemo(
    () =>
      record.primaryMetrics
        .map((_, i) => i)
        .filter((i) => !principalIndices.includes(i)),
    [record.primaryMetrics, principalIndices],
  );

  const hasFilledExtras = extraIndices.some((i) =>
    isFilledPrimary(record.primaryMetrics[i]),
  );

  const [showExtras, setShowExtras] = useState(false);
  // Auto-expande se já tem extras preenchidos (ex.: case carregado de seed).
  useEffect(() => {
    if (hasFilledExtras) setShowExtras(true);
  }, [hasFilledExtras]);

  const updatePrimary = (index: number, patch: Partial<PrimaryMetricEntry>) => {
    const next = record.primaryMetrics.map((m, i) =>
      i === index ? { ...m, ...patch } : m,
    );
    update({ primaryMetrics: next });
  };

  const clearPrimary = (index: number) => {
    updatePrimary(index, { before: "", after: "" });
  };

  const renderMetricRow = (index: number) => {
    const entry = record.primaryMetrics[index];
    if (!entry) return null;
    const variation = computeVariation(entry.before, entry.after);
    const metricMeta = metrics.find((m) => m.value === entry.metricKey);
    const positive = isImprovement(variation, metricMeta?.direction);
    const error = errors[`primaryMetrics.${index}`];
    const isEmpty = !isFilledPrimary(entry);
    const hasResult =
      Boolean(entry.before) && Boolean(entry.after) && variation !== null;

    return (
      <div key={entry.metricKey || index}>
        <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_110px_36px] md:items-center md:gap-3">
          <div className="flex items-center rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
            {entry.label}
          </div>

          <Input
            type="number"
            step="any"
            value={entry.before}
            onChange={(e) => updatePrimary(index, { before: e.target.value })}
            placeholder="Antes"
          />

          <Input
            type="number"
            step="any"
            value={entry.after}
            onChange={(e) => updatePrimary(index, { after: e.target.value })}
            placeholder="Depois"
          />

          <div className="flex items-center justify-end gap-1 text-sm font-bold md:justify-start">
            {hasResult ? (
              <>
                {variation !== null && variation >= 0 ? (
                  <TrendingUp
                    className={cn("h-3.5 w-3.5", positive ? "text-ter" : "text-destructive")}
                  />
                ) : (
                  <TrendingDown
                    className={cn("h-3.5 w-3.5", positive ? "text-ter" : "text-destructive")}
                  />
                )}
                <span className={positive ? "text-ter" : "text-destructive"}>
                  {formatVariation(variation)}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>

          <div className="flex justify-end">
            {!isEmpty ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => clearPrimary(index)}
                aria-label="Limpar métrica"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <span className="hidden md:block" />
            )}
          </div>
        </div>

        {hasResult && entry.unit && (
          <p className="mt-1 px-1 text-[11px] text-muted-foreground">
            {formatMetricValue(entry.before, entry.unit)}
            {" → "}
            <span className="font-semibold text-foreground">
              {formatMetricValue(entry.after, entry.unit)}
            </span>
          </p>
        )}

        {error && <p className="mt-1 px-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  };

  const updateSecondary = (index: number, patch: Partial<SecondaryMetric>) => {
    const next = record.secondaryMetrics.map((m, i) =>
      i === index ? { ...m, ...patch } : m,
    );
    update({ secondaryMetrics: next });
  };
  const clearSecondary = (index: number) => {
    updateSecondary(index, { ...emptySecondary });
  };

  return (
    <div className="space-y-6">
      <FieldShell
        label="Em quanto tempo o cliente atingiu esse novo patamar?"
        required
        error={errors.timeToResult}
        hint="Esse pode ser diferente do tempo de contrato — considere desde o início do trabalho até o resultado consolidado."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {TIME_TO_RESULT_OPTIONS.map((opt) => {
            const selected = record.timeToResult === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => update({ timeToResult: opt.value })}
                className={[
                  "rounded-lg border px-3 py-2 text-sm transition-all",
                  selected
                    ? "border-primary/60 bg-primary/5 font-semibold shadow-sm"
                    : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FieldShell>

      <FieldShell
        label="Métricas principais de resultado"
        required
        error={errors.primaryMetrics}
        hint="As métricas mostradas dependem do modelo de venda. Preencha as principais que se aplicam (mínimo 1) — abaixo, expanda para registrar outras."
      >
        <div className="space-y-2">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_110px_36px] gap-3 px-1 md:grid">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Métrica</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Antes</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Depois</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Variação</span>
            <span />
          </div>

          {principalIndices.map((index) => renderMetricRow(index))}

          {extraIndices.length > 0 && (
            <>
              {!showExtras ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExtras(true)}
                  className="w-full justify-center"
                >
                  <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                  Mostrar outras {extraIndices.length} métricas
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Outras métricas
                    </span>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>
                  {extraIndices.map((index) => renderMetricRow(index))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExtras(false)}
                    disabled={hasFilledExtras}
                    className="w-full justify-center"
                  >
                    <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                    {hasFilledExtras ? "Há métricas extras preenchidas" : "Ocultar outras métricas"}
                  </Button>
                </>
              )}
            </>
          )}

          <p className="text-[11px] text-muted-foreground">
            {filledPrimaryCount}/{record.primaryMetrics.length} métricas preenchidas
          </p>
        </div>
      </FieldShell>

      <FieldShell
        label="Métricas secundárias"
        hint="Indicadores complementares com nome livre (até 2)."
      >
        <div className="space-y-2">
          {record.secondaryMetrics.map((metric, index) => {
            const isEmpty = !isFilledSecondary(metric);
            return (
              <div key={index}>
                <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_110px_36px] md:items-center md:gap-3">
                  <Input
                    value={metric.name}
                    onChange={(e) => updateSecondary(index, { name: e.target.value })}
                    placeholder="Nome da métrica"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={metric.before}
                    onChange={(e) => updateSecondary(index, { before: e.target.value })}
                    placeholder="Antes"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={metric.after}
                    onChange={(e) => updateSecondary(index, { after: e.target.value })}
                    placeholder="Depois"
                  />
                  <span className="hidden md:block" />
                  <div className="flex justify-end">
                    {!isEmpty ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => clearSecondary(index)}
                        aria-label="Limpar métrica"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="hidden md:block" />
                    )}
                  </div>
                </div>
                {errors[`secondaryMetrics.${index}`] && (
                  <p className="mt-1 px-1 text-xs text-destructive">
                    {errors[`secondaryMetrics.${index}`]}
                  </p>
                )}
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground">
            {filledSecondaryCount}/{MAX_SECONDARY_METRICS} métricas secundárias preenchidas
          </p>
        </div>
      </FieldShell>

      {roasMode && (
        <section className="rounded-2xl border border-executar/40 bg-executar/5 p-5">
          <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-executar/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-executar">
                EXECUTAR
              </span>
              <span className="text-xs text-muted-foreground">
                Investimento e receita atribuída no período do case.
              </span>
            </div>
            {record.executarChannels.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={syncFromChannels}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Atualizar com soma dos canais (Etapa 4)
              </Button>
            )}
          </header>

          {showSyncBanner && (
            <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Os totais informados aqui divergem da soma dos canais da Etapa 4
              {investmentDiverges && (
                <> · investimento somado: <strong>R$ {channelTotalInvestment.toLocaleString("pt-BR")}</strong></>
              )}
              {revenueDiverges && (
                <> · receita somada: <strong>R$ {channelTotalRevenue.toLocaleString("pt-BR")}</strong></>
              )}
              .
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell
              label="Investimento total em mídia (R$)"
              required
              error={errors.mediaInvestment}
              hint={
                channelTotalInvestment > 0
                  ? `Sugerido pela soma dos canais: R$ ${channelTotalInvestment.toLocaleString("pt-BR")}`
                  : undefined
              }
            >
              <Input
                type="number"
                step="any"
                value={record.mediaInvestment}
                onChange={(e) => update({ mediaInvestment: e.target.value })}
                placeholder="0,00"
              />
            </FieldShell>
            <FieldShell
              label="Receita atribuída (R$)"
              required
              error={errors.attributedRevenue}
              hint={
                channelTotalRevenue > 0
                  ? `Sugerido pela soma dos canais: R$ ${channelTotalRevenue.toLocaleString("pt-BR")}`
                  : undefined
              }
            >
              <Input
                type="number"
                step="any"
                value={record.attributedRevenue}
                onChange={(e) => update({ attributedRevenue: e.target.value })}
                placeholder="0,00"
              />
            </FieldShell>
          </div>
          {roas !== null && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ROAS calculado
              </span>
              <span className="text-2xl font-bold tracking-tight text-executar">
                {roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
