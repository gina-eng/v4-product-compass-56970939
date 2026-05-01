import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Compass,
  Eraser,
  FileSpreadsheet,
  Filter,
  FlaskConical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { clearAllDrafts, deleteCase, listCases } from "@/features/cases/storage";
import { fuzzyMatch } from "@/features/cases/search";
import {
  clearExampleCases,
  hasExampleCases,
  seedExampleCases,
} from "@/features/cases/seed";
import type { CaseRecord } from "@/features/cases/types";
import {
  computeVariation,
  formatRelativeDate,
  formatVariation,
  isImprovement,
  normalizedImprovement,
} from "@/features/cases/format";
import { getMetricDirection } from "@/features/cases/options";
import {
  BRAZIL_STATES,
  OPERATION_REACH_OPTIONS,
  SALES_MODELS,
  SEGMENTS_MOCK,
  STEPS,
  V4_PRODUCTS,
} from "@/features/cases/options";
import type { V4Product } from "@/features/cases/options";
import { cn } from "@/lib/utils";

const GoogleChatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 192 192"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path fill="#1A73E8" d="M0 0h56v56H0z" />
    <path fill="#FBBC04" d="M56 0h104v56H56z" />
    <path fill="#EA4335" d="M160 0h32l-32 32z" />
    <path fill="#4285F4" d="M0 56h56v64H0z" />
    <path fill="#34A853" d="M160 56v64H77.5L56 141.5V120H0v40h56v32l32-32h72c17.7 0 32-14.3 32-32V56h-32z" />
    <path fill="#188038" d="M0 120h56v40H0z" />
  </svg>
);

const PRODUCT_LABEL = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p.label]));
const PRODUCT_TONE = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p.toneClass]));
const SALES_LABEL = Object.fromEntries(SALES_MODELS.map((m) => [m.value, m.label]));

type SortKey = "recent" | "variation";

const ALL = "__all__";

const PRODUCT_INITIAL: Record<string, string> = {
  saber: "S",
  ter: "T",
  executar: "E",
  potencializar: "P",
};

const ProductDots = ({ products }: { products: CaseRecord["products"] }) => (
  <div className="flex items-center gap-1">
    {products.map((p) => (
      <span
        key={p}
        title={PRODUCT_LABEL[p]}
        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${PRODUCT_TONE[p]}`}
      >
        {PRODUCT_INITIAL[p] ?? "·"}
      </span>
    ))}
  </div>
);

const CaseCard = ({
  record,
  onDelete,
  onOpen,
  isMine,
}: {
  record: CaseRecord;
  onDelete?: () => void;
  onOpen: () => void;
  showOwner?: boolean;
  isMine?: boolean;
}) => {
  const firstMetric = record.primaryMetrics[0];
  const variation = firstMetric
    ? computeVariation(firstMetric.before, firstMetric.after)
    : null;
  const isPositive = firstMetric
    ? isImprovement(variation, getMetricDirection(firstMetric.metricKey))
    : null;
  const extraMetrics = Math.max(0, record.primaryMetrics.length - 1);
  const lastStep = STEPS.find((s) => s.id === record.currentStep);
  const isDraft = record.status === "rascunho";

  const showWarning = record.status === "sem_evidencia";

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleCardKeyDown}
      className="group cursor-pointer border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">
              {record.clientName || "(Cliente sem nome)"}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {record.segment || "—"}
              {(record.clientCity || record.clientState) && (
                <>
                  {" · "}
                  {[record.clientCity, record.clientState].filter(Boolean).join("/")}
                </>
              )}
              {" · "}
              {formatRelativeDate(record.updatedAt)}
            </p>
          </div>
          {record.products.length > 0 && <ProductDots products={record.products} />}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="-mr-2 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!isDraft && firstMetric && firstMetric.label && firstMetric.before && firstMetric.after ? (
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground">
              {firstMetric.label}
              {extraMetrics > 0 && (
                <span className="ml-1 text-[10px] font-semibold text-primary">
                  +{extraMetrics}
                </span>
              )}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-lg font-bold tracking-tight",
                isPositive === null
                  ? "text-muted-foreground"
                  : isPositive
                    ? "text-ter"
                    : "text-destructive",
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {formatVariation(variation)}
            </span>
          </div>
        ) : isDraft ? (
          <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              Parou em <span className="text-foreground">{lastStep?.title ?? "Etapa 1"}</span>
            </span>
            <span className="font-semibold text-foreground">
              {Math.round(((record.currentStep - 1) / STEPS.length) * 100)}%
            </span>
          </div>
        ) : null}

        {(showWarning || isMine || isDraft) && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {showWarning && (
              <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-3 w-3" /> sem evidência
              </span>
            )}
            {isMine && !isDraft && !showWarning && (
              <span className="text-primary">meu</span>
            )}
            {isDraft && <span className="text-amber-600 dark:text-amber-400">rascunho</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EmptyState = ({
  icon: Icon = FileSpreadsheet,
  title,
  description,
  cta,
}: {
  icon?: typeof FileSpreadsheet;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-xs text-muted-foreground">{description}</p>
    </div>
    {cta}
  </div>
);

const Cases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>(ALL);
  const [nichoFilter, setNichoFilter] = useState<string>(ALL);
  const [salesModelFilter, setSalesModelFilter] = useState<string>(ALL);
  const [stateFilter, setStateFilter] = useState<string>(ALL);
  const [reachFilter, setReachFilter] = useState<string>(ALL);
  const [productsFilter, setProductsFilter] = useState<V4Product[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirmClearDrafts, setConfirmClearDrafts] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");

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

  const refresh = () => setCases(listCases());

  useEffect(() => {
    refresh();
  }, []);

  const toggleProduct = (product: V4Product) => {
    setProductsFilter((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSegmentFilter(ALL);
    setNichoFilter(ALL);
    setSalesModelFilter(ALL);
    setStateFilter(ALL);
    setReachFilter(ALL);
    setProductsFilter([]);
  };

  const hasActiveFilters =
    Boolean(search) ||
    segmentFilter !== ALL ||
    nichoFilter !== ALL ||
    salesModelFilter !== ALL ||
    stateFilter !== ALL ||
    reachFilter !== ALL ||
    productsFilter.length > 0;

  const nichoOptions = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      const v = (c.nicho ?? "").trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [cases]);

  const applyCommonFilters = (records: CaseRecord[]): CaseRecord[] => {
    let result = records;
    const term = search.trim();
    if (term) {
      result = result.filter((c) => {
        const haystack = [
          c.clientName,
          c.v4Unit,
          c.segment,
          c.nicho ?? "",
          c.clientCity ?? "",
          c.clientState ?? "",
          c.salesModel ? SALES_LABEL[c.salesModel] : "",
          ...c.products.map((p) => PRODUCT_LABEL[p] ?? p),
          ...(c.primaryMetrics?.map((m) => m.label) ?? []),
          ...(c.initialChallenges ?? []),
          c.problem ?? "",
          c.rootCause ?? "",
          c.ownerEmail ?? "",
        ]
          .filter(Boolean)
          .join(" ");
        return fuzzyMatch(term, haystack);
      });
    }
    if (segmentFilter !== ALL) result = result.filter((c) => c.segment === segmentFilter);
    if (nichoFilter !== ALL) result = result.filter((c) => (c.nicho ?? "") === nichoFilter);
    if (salesModelFilter !== ALL) result = result.filter((c) => c.salesModel === salesModelFilter);
    if (stateFilter !== ALL) result = result.filter((c) => c.clientState === stateFilter);
    if (reachFilter !== ALL) result = result.filter((c) => c.operationReach === reachFilter);
    if (productsFilter.length > 0) {
      result = result.filter((c) => productsFilter.every((p) => c.products.includes(p)));
    }
    return result;
  };

  const sortRecords = (records: CaseRecord[]): CaseRecord[] => {
    const list = [...records];
    if (sortKey === "recent") {
      list.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
    } else if (sortKey === "variation") {
      const score = (c: CaseRecord) => {
        const m = c.primaryMetrics[0];
        if (!m) return -Infinity;
        const v = computeVariation(m.before, m.after);
        return normalizedImprovement(v, m.metricKey);
      };
      list.sort((a, b) => score(b) - score(a));
    }
    return list;
  };

  const myEmailLower = currentEmail.toLowerCase();

  const explore = useMemo(
    () =>
      sortRecords(
        applyCommonFilters(cases.filter((c) => c.status !== "rascunho")),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, search, segmentFilter, nichoFilter, salesModelFilter, stateFilter, reachFilter, productsFilter, sortKey],
  );

  const myCases = useMemo(
    () =>
      sortRecords(
        applyCommonFilters(
          cases.filter(
            (c) =>
              c.status !== "rascunho" &&
              c.ownerEmail?.toLowerCase() === myEmailLower,
          ),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, search, segmentFilter, nichoFilter, salesModelFilter, stateFilter, reachFilter, productsFilter, sortKey, myEmailLower],
  );

  const myDrafts = useMemo(
    () =>
      sortRecords(
        cases.filter(
          (c) =>
            c.status === "rascunho" &&
            (!c.ownerEmail || c.ownerEmail.toLowerCase() === myEmailLower),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, sortKey, myEmailLower],
  );

  const myStats = useMemo(() => {
    const mine = cases.filter(
      (c) => c.ownerEmail?.toLowerCase() === myEmailLower,
    );
    return {
      total: mine.length,
      complete: mine.filter((c) => c.status === "completo").length,
      drafts: mine.filter((c) => c.status === "rascunho").length,
      noEvidence: mine.filter((c) => c.status === "sem_evidencia").length,
    };
  }, [cases, myEmailLower]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCase(pendingDelete);
    setPendingDelete(null);
    refresh();
    toast({ title: "Case removido" });
  };

  const exampleLoaded = hasExampleCases();

  const handleSeed = () => {
    const count = seedExampleCases();
    refresh();
    toast({
      title: `${count} cases de exemplo carregados`,
      description: "Use para visualizar a experiência com a base populada.",
    });
  };

  const handleClearExamples = () => {
    const count = clearExampleCases();
    refresh();
    toast({ title: `${count} exemplos removidos` });
  };

  const renderFiltersBar = () => (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, segmento, métrica…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="variation">Maior variação</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os segmentos</SelectItem>
            {SEGMENTS_MOCK.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={nichoFilter}
          onValueChange={setNichoFilter}
          disabled={nichoOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nicho" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os nichos</SelectItem>
            {nichoOptions.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={salesModelFilter} onValueChange={setSalesModelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Modelo de venda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os modelos</SelectItem>
            {SALES_MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os estados</SelectItem>
            {BRAZIL_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={reachFilter} onValueChange={setReachFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Abrangência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toda abrangência</SelectItem>
            {OPERATION_REACH_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Filter className="h-3 w-3" /> Produtos V4
        </span>
        {V4_PRODUCTS.map((p) => {
          const selected = productsFilter.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => toggleProduct(p.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-all",
                selected
                  ? `${p.toneClass} shadow-sm`
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Layout>
      <section className="space-y-8 animate-fade-in">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> Zyman AI
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Cases
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore cases publicados por todas as unidades V4. Use como munição comercial,
              referência de estratégia e fonte para a Zyman AI por segmento e modelo de venda.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div className="flex justify-end">
              {exampleLoaded ? (
                <Button variant="ghost" size="sm" onClick={handleClearExamples}>
                  <Eraser className="mr-1.5 h-3.5 w-3.5" /> Limpar exemplos
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleSeed}>
                  <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Carregar exemplos
                </Button>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button asChild variant="outline" size="default">
                <a
                  href="https://chat.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GoogleChatIcon className="mr-1.5 h-4 w-4" /> Conversar com Zyman AI
                </a>
              </Button>
              <Button asChild size="default">
                <Link to="/cases/novo">
                  <Plus className="mr-1.5 h-4 w-4" /> Registrar case
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="explorar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="explorar">
              <Compass className="mr-1.5 h-3.5 w-3.5" />
              Explorar ({explore.length})
            </TabsTrigger>
            <TabsTrigger value="meus">
              Meus cases ({myCases.length})
            </TabsTrigger>
            <TabsTrigger value="rascunhos">
              Rascunhos ({myDrafts.length})
              {myDrafts.length > 0 && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorar" className="space-y-4">
            {renderFiltersBar()}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{explore.length}</strong>{" "}
                {explore.length === 1 ? "case encontrado" : "cases encontrados"}
              </span>
            </div>

            {explore.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  icon={Filter}
                  title="Nenhum case com esses filtros"
                  description="Tente afrouxar os critérios ou limpar os filtros para ver mais resultados."
                  cta={
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Compass}
                  title="Nenhum case publicado ainda"
                  description="Quando os primeiros cases forem registrados pelas unidades, eles aparecerão aqui pra todo mundo explorar. Para visualizar como será a experiência, carregue exemplos."
                  cta={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleSeed}>
                        <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Carregar exemplos
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/cases/novo">
                          <Plus className="mr-1.5 h-4 w-4" /> Registrar primeiro case
                        </Link>
                      </Button>
                    </div>
                  }
                />
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {explore.map((c) => (
                  <CaseCard
                    key={c.id}
                    record={c}
                    showOwner
                    isMine={c.ownerEmail?.toLowerCase() === myEmailLower}
                    onOpen={() =>
                      navigate(
                        c.status === "rascunho"
                          ? `/cases/${c.id}/editar`
                          : `/cases/${c.id}`,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meus" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total registrados", value: myStats.total, tone: "text-foreground" },
                { label: "Completos", value: myStats.complete, tone: "text-ter" },
                { label: "Sem evidência", value: myStats.noEvidence, tone: "text-orange-600" },
                { label: "Rascunhos", value: myStats.drafts, tone: "text-amber-600" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {renderFiltersBar()}

            {myCases.length === 0 ? (
              <EmptyState
                title="Você ainda não publicou nenhum case"
                description="Conclua o wizard de 6 etapas e seu case aparecerá aqui — pronto para alimentar a Zyman AI."
                cta={
                  <Button asChild size="sm">
                    <Link to="/cases/novo">
                      <Plus className="mr-1.5 h-4 w-4" /> Registrar primeiro case
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {myCases.map((c) => (
                  <CaseCard
                    key={c.id}
                    record={c}
                    isMine
                    onOpen={() =>
                      navigate(
                        c.status === "rascunho"
                          ? `/cases/${c.id}/editar`
                          : `/cases/${c.id}`,
                      )
                    }
                    onDelete={() => setPendingDelete(c.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rascunhos" className="space-y-4">
            {myDrafts.length === 0 ? (
              <EmptyState
                title="Sem rascunhos pendentes"
                description="Quando você começar um registro e não terminar, ele aparecerá aqui para você retomar de onde parou."
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {myDrafts.length} {myDrafts.length === 1 ? "rascunho" : "rascunhos"} pendentes
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmClearDrafts(true)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Limpar todos os rascunhos
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {myDrafts.map((c) => (
                    <CaseCard
                      key={c.id}
                      record={c}
                      onOpen={() => navigate(`/cases/${c.id}/editar`)}
                      onDelete={() => setPendingDelete(c.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este case?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente do seu
              navegador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClearDrafts} onOpenChange={setConfirmClearDrafts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todos os rascunhos?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os rascunhos serão removidos permanentemente. Cases publicados e
              exemplos não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const count = clearAllDrafts();
                setConfirmClearDrafts(false);
                refresh();
                toast({
                  title: count === 0 ? "Nenhum rascunho encontrado" : `${count} ${count === 1 ? "rascunho removido" : "rascunhos removidos"}`,
                });
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Cases;
