import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mic,
  Monitor,
  PenLine,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LOCAL_PREVIEW_EMAIL, isLocalPreviewAuthEnabled } from "@/lib/auth";
import { deleteCase, getCase } from "@/features/cases/storage";
import type { CaseRecord } from "@/features/cases/types";
import {
  computeRoas,
  computeVariation,
  formatMetricValue,
  formatRelativeDate,
  formatVariation,
  isImprovement,
} from "@/features/cases/format";
import { getMetricDirection } from "@/features/cases/options";
import {
  BRAZIL_STATES,
  OPERATION_REACH_OPTIONS,
  SABER_EXECUTION_OPTIONS,
  SALES_MODELS,
  TIME_TO_RESULT_OPTIONS,
  V4_PRODUCTS,
} from "@/features/cases/options";
import { cn } from "@/lib/utils";

const PRODUCT_META = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p]));
const SALES_LABEL = Object.fromEntries(SALES_MODELS.map((m) => [m.value, m.label]));
const TIME_LABEL = Object.fromEntries(TIME_TO_RESULT_OPTIONS.map((t) => [t.value, t.label]));
const SABER_EXECUTION_LABEL = Object.fromEntries(
  SABER_EXECUTION_OPTIONS.map((s) => [s.value, s.label]),
);
const STATE_LABEL = Object.fromEntries(BRAZIL_STATES.map((s) => [s.value, s.label]));
const REACH_LABEL = Object.fromEntries(
  OPERATION_REACH_OPTIONS.map((r) => [r.value, r.label]),
);

const StatusBadge = ({ status }: { status: CaseRecord["status"] }) => {
  if (status === "rascunho") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        Rascunho
      </span>
    );
  }
  if (status === "sem_evidencia") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-400/10 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
        <AlertCircle className="h-3 w-3" /> Sem evidência
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ter/40 bg-ter/10 px-2.5 py-0.5 text-xs font-semibold text-ter">
      <CheckCircle2 className="h-3 w-3" /> Completo
    </span>
  );
};

const SectionShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
    <header className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

const Field = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="text-sm leading-relaxed text-foreground">
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  </div>
);

const TagList = ({
  items,
  toneClass,
}: {
  items: string[];
  toneClass?: string;
}) => {
  if (!items?.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
            toneClass ?? "border-border/60 bg-muted/40 text-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const Prose = ({ text }: { text: string }) =>
  text ? (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  );

const ProductHeader = ({
  product,
  description,
}: {
  product: keyof typeof PRODUCT_META;
  description: string;
}) => {
  const meta = PRODUCT_META[product];
  return (
    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          meta?.toneClass,
        )}
      >
        {meta?.label}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
};

const EvidenceLink = ({
  icon: Icon,
  label,
  url,
}: {
  icon: typeof Monitor;
  label: string;
  url: string;
}) => {
  const hasUrl = Boolean(url);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-all",
        hasUrl
          ? "border-border/70 bg-background hover:border-primary/40"
          : "border-dashed border-border/50 bg-muted/20",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          hasUrl ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {hasUrl ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 truncate text-xs text-primary transition-colors hover:underline"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">Não informado</p>
        )}
      </div>
    </div>
  );
};

const CaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    const r = getCase(id);
    setRecord(r ?? null);
  }, [id]);

  useEffect(() => {
    const sync = async () => {
      if (isLocalPreviewAuthEnabled()) {
        setCurrentEmail(LOCAL_PREVIEW_EMAIL);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setCurrentEmail(data.session?.user.email ?? "");
    };
    void sync();
  }, []);

  const isOwner = useMemo(
    () =>
      record?.ownerEmail?.toLowerCase() === currentEmail.toLowerCase() &&
      Boolean(currentEmail),
    [record, currentEmail],
  );

  if (!record) {
    return (
      <Layout>
        <section className="mx-auto max-w-md py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Case não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O case que você tentou abrir não existe ou foi removido.
          </p>
          <Button asChild className="mt-6">
            <Link to="/cases">Voltar para Zyman AI (Cases)</Link>
          </Button>
        </section>
      </Layout>
    );
  }

  if (record.status === "rascunho") {
    navigate(`/cases/${record.id}/editar`, { replace: true });
    return null;
  }

  const handleDelete = () => {
    deleteCase(record.id);
    setConfirmDelete(false);
    toast({ title: "Case removido" });
    navigate("/cases", { replace: true });
  };

  const roas = computeRoas(record.attributedRevenue, record.mediaInvestment);

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <Link
          to="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Zyman AI (Cases)
        </Link>

        <header className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={record.status} />
                {isOwner && (
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Meu case
                  </span>
                )}
                {record.products.map((p) => (
                  <span
                    key={p}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      PRODUCT_META[p]?.toneClass,
                    )}
                  >
                    {PRODUCT_META[p]?.label}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {record.clientName || "(Cliente sem nome)"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {[
                  record.salesModel ? SALES_LABEL[record.salesModel] : "",
                  record.segment,
                  record.nicho,
                  [record.clientCity, record.clientState].filter(Boolean).join("/"),
                  record.operationReach
                    ? REACH_LABEL[record.operationReach] ?? record.operationReach
                    : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Registrado por{" "}
                <span className="text-foreground">{record.ownerEmail || "—"}</span>
                {record.v4Unit && <> · {record.v4Unit}</>}
                {" · "}
                atualizado {formatRelativeDate(record.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              {isOwner && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/cases/${record.id}/editar`}>
                      <PenLine className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                  </Button>
                </>
              )}
            </div>
          </div>

          {record.primaryMetrics.filter((m) => m.before && m.after).length > 0 && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {record.primaryMetrics
                .filter((m) => m.before && m.after)
                .map((m, i) => {
                  const variation = computeVariation(m.before, m.after);
                  const positive = isImprovement(variation, getMetricDirection(m.metricKey));
                  const trendingUp = variation !== null && variation >= 0;
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border/60 bg-background px-3 py-2"
                    >
                      <p className="text-[11px] text-muted-foreground">{m.label}</p>
                      <div className="mt-0.5 flex items-baseline justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatMetricValue(m.before, m.unit)}
                          <span className="mx-1">→</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatMetricValue(m.after, m.unit)}
                          </span>
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold",
                            positive ? "text-ter" : "text-destructive",
                          )}
                        >
                          {trendingUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatVariation(variation)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {record.timeToResult && (
            <p className="mt-4 text-xs text-muted-foreground">
              Resultado consolidado em{" "}
              <span className="font-medium text-foreground">
                {TIME_LABEL[record.timeToResult] ?? record.timeToResult}
              </span>
            </p>
          )}
        </header>

        <SectionShell title="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente" value={record.clientName} />
            <Field label="CNPJ" value={record.clientCnpj} />
            <Field
              label="Status do cliente"
              value={record.clientStatus === "ativo" ? "Ativo" : record.clientStatus === "inativo" ? "Inativo" : ""}
            />
            <Field label="Unidade V4" value={record.v4Unit} />
            <Field
              label="Cidade da Empresa"
              value={
                [record.clientCity, record.clientState ? STATE_LABEL[record.clientState] : ""]
                  .filter(Boolean)
                  .join(" / ") || ""
              }
            />
            <Field
              label="Abrangência da operação"
              value={
                record.operationReach ? REACH_LABEL[record.operationReach] ?? record.operationReach : ""
              }
            />
            <Field
              label="Pessoas envolvidas"
              value={
                record.collaborators.length > 0
                  ? record.collaborators.filter(Boolean).join(" · ")
                  : ""
              }
              className="sm:col-span-2"
            />
          </div>
        </SectionShell>

        <SectionShell title="Classificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Modelo de venda"
              value={record.salesModel ? SALES_LABEL[record.salesModel] : ""}
            />
            <Field label="Segmento" value={record.segment} />
            <Field label="Nicho do cliente" value={record.nicho} />
            <Field
              label="Produtos V4 contratados"
              className="sm:col-span-2"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {record.products.map((p) => (
                    <span
                      key={p}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        PRODUCT_META[p]?.toneClass,
                      )}
                    >
                      {PRODUCT_META[p]?.label}
                    </span>
                  ))}
                </div>
              }
            />
          </div>
        </SectionShell>

        <SectionShell title="Contexto do desafio">
          <Field
            label="Desafios iniciais que o cliente trouxe"
            value={
              <TagList
                items={[
                  ...record.initialChallenges,
                  ...(record.initialChallengesOther
                    ? [record.initialChallengesOther]
                    : []),
                ]}
                toneClass="border-primary/30 bg-primary/5 text-primary"
              />
            }
          />
          <Field
            label="Contexto do desafio"
            value={
              <Prose
                text={
                  [record.problem, record.rootCause]
                    .filter((t) => (t ?? "").trim().length > 0)
                    .join("\n\n")
                }
              />
            }
          />
          <Field
            label="Restrições"
            value={
              <TagList
                items={[
                  ...record.restrictions,
                  ...(record.restrictionsOther ? [record.restrictionsOther] : []),
                ]}
              />
            }
          />
        </SectionShell>

        <SectionShell title="Estratégia aplicada">
          {record.products.includes("saber") && (
            <div className="space-y-3">
              <ProductHeader product="saber" description="Direcionamentos estratégicos entregues" />
              {(() => {
                const d = record.saberDirections[0];
                if (!d) return <p className="text-sm text-muted-foreground">—</p>;
                const directionText = [d.direction, d.rationale]
                  .filter((t) => (t ?? "").trim().length > 0)
                  .join("\n\n");
                return (
                  <>
                    <Field
                      label="Direcionamento e racional"
                      value={
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {directionText || "—"}
                        </p>
                      }
                    />
                    {d.impact && <Field label="Impacto observado" value={d.impact} />}
                  </>
                );
              })()}
              {record.saberExecution && (
                <Field
                  label="Execução pelo cliente"
                  value={SABER_EXECUTION_LABEL[record.saberExecution] ?? record.saberExecution}
                />
              )}
            </div>
          )}

          {record.products.includes("ter") && (
            <div className="space-y-3">
              <ProductHeader
                product="ter"
                description="Percepção de valor gerada pela implementação"
              />
              <Prose text={record.terValuePerception} />
            </div>
          )}

          {record.products.includes("executar") && (
            <div className="space-y-4">
              <ProductHeader
                product="executar"
                description="Operação de mídia, criativo e estratégias"
              />
              <Field
                label="Profissionais V4 alocados"
                value={
                  <TagList
                    items={record.executarProfessionals}
                    toneClass="border-executar/30 bg-executar/5 text-executar"
                  />
                }
              />

              <div>
                <p className="text-xs font-medium text-muted-foreground">Canais de mídia operados</p>
                {record.executarChannels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {record.executarChannels.map((c, i) => {
                      const r = computeRoas(c.revenue, c.investment);
                      return (
                        <div
                          key={i}
                          className="rounded-lg border border-border/60 bg-background p-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {c.channel || "Canal sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMetricValue(c.investment, "currency")} →{" "}
                            <span className="font-semibold text-foreground">
                              {formatMetricValue(c.revenue, "currency")}
                            </span>
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-xs font-semibold",
                              r === null
                                ? "text-muted-foreground"
                                : r >= 1
                                  ? "text-ter"
                                  : "text-destructive",
                            )}
                          >
                            ROAS{" "}
                            {r === null
                              ? "—"
                              : `${r.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Field
                label="Tipos de criativo"
                value={<TagList items={record.executarCreatives} />}
              />
              <Field
                label="Comunicação dos criativos"
                value={<Prose text={record.executarCreativesCommunication} />}
              />

              {(() => {
                const s = record.executarStrategies[0];
                if (!s) {
                  return (
                    <Field
                      label="Estratégia aplicada"
                      value={<span className="text-muted-foreground">—</span>}
                    />
                  );
                }
                const strategyText = [s.strategy, s.appliedAt]
                  .filter((t) => (t ?? "").trim().length > 0)
                  .join(s.appliedAt ? " — " : "");
                return (
                  <Field
                    label="Estratégia aplicada"
                    value={
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {strategyText || "—"}
                      </p>
                    }
                  />
                );
              })()}
            </div>
          )}

          {record.products.includes("potencializar") && (
            <div className="space-y-3">
              <ProductHeader
                product="potencializar"
                description="Sucesso direcionado e valor percebido"
              />
              <Field
                label="Modelo de valor percebido"
                value={<Prose text={record.potencializarValueModel} />}
              />
              <Field
                label="Indicador de valor acordado"
                value={record.potencializarIndicator}
              />
            </div>
          )}
        </SectionShell>

        <SectionShell title="Resultado quantitativo">
          <Field
            label="Tempo até o resultado"
            value={record.timeToResult ? TIME_LABEL[record.timeToResult] : ""}
          />

          {(() => {
            const filledPrimary = record.primaryMetrics.filter((m) => m.before && m.after);
            return (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Métricas principais</p>
                {filledPrimary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {filledPrimary.map((m, i) => {
                      const variation = computeVariation(m.before, m.after);
                      const positive = isImprovement(variation, getMetricDirection(m.metricKey));
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {m.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatMetricValue(m.before, m.unit)} →{" "}
                              <span className="font-semibold text-foreground">
                                {formatMetricValue(m.after, m.unit)}
                              </span>
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              positive ? "text-ter" : "text-destructive",
                            )}
                          >
                            {formatVariation(variation)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {record.secondaryMetrics.filter((m) => m.name && m.before && m.after).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Métricas secundárias</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {record.secondaryMetrics
                  .filter((m) => m.name && m.before && m.after)
                  .map((m, i) => {
                    const variation = computeVariation(m.before, m.after);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.before} → <span className="font-semibold">{m.after}</span>
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            variation !== null && variation >= 0
                              ? "text-ter"
                              : "text-destructive",
                          )}
                        >
                          {formatVariation(variation)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {record.products.includes("executar") &&
            (record.mediaInvestment || record.attributedRevenue) && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      PRODUCT_META.executar?.toneClass,
                    )}
                  >
                    EXECUTAR
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Investimento × Receita atribuída
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field
                    label="Investimento total"
                    value={formatMetricValue(record.mediaInvestment, "currency")}
                  />
                  <Field
                    label="Receita atribuída"
                    value={formatMetricValue(record.attributedRevenue, "currency")}
                  />
                  <Field
                    label="ROAS calculado"
                    value={
                      roas === null ? (
                        "—"
                      ) : (
                        <span className="text-xl font-bold text-executar">
                          {roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            )}
        </SectionShell>

        <SectionShell title="Evidências">
          <div className="grid gap-3 sm:grid-cols-3">
            <EvidenceLink
              icon={Monitor}
              label="Dashboard de resultado"
              url={record.dashboardUrl}
            />
            <EvidenceLink
              icon={FileText}
              label="Apresentação completa"
              url={record.presentationUrl}
            />
            <EvidenceLink
              icon={Mic}
              label="Depoimento / chamada"
              url={record.testimonialUrl}
            />
          </div>
          {record.finalNotes && (
            <Field label="Observações finais" value={<Prose text={record.finalNotes} />} />
          )}
        </SectionShell>
      </section>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este case?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CaseDetail;
