import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenText,
  Building2,
  ExternalLink,
  FileText,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingStates";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  buildPlatformScoreCard,
  calculateAverageScore,
  normalizeUrl,
  normalizeScoreMap,
  normalizeUsefulLinks,
  operationalCapacityCriteria,
  quadrantDescriptions,
  resolvePlatformQuadrant,
  strategicPotentialCriteria,
} from "@/lib/platforms";
import { getMockPlatformById, getMockPlatformBySlug } from "@/lib/platformMockData";
import googleChatLogo from "@/assets/google-chat-logo.svg";

type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];

interface PlatformDetailsRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  client_logo_url: string | null;
  short_description: string | null;
  general_description: string | null;
  gtm_maturity: string | null;
  icp_recommended: string | null;
  practical_applications: string | null;
  benefits_and_advantages: string | null;
  client_benefits: string | null;
  unit_benefits: string | null;
  partnership_regulations: string | null;
  base_pricing: string | null;
  commission_and_invoicing: string | null;
  how_to_hire: string | null;
  technical_commercial_support: string | null;
  forum_url: string | null;
  request_form_url: string | null;
  useful_links: unknown;
  operational_capacity_scores: unknown;
  strategic_potential_scores: unknown;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

const quadrantToneMap = {
  "Líder": "bg-emerald-100 text-emerald-800",
  "Visionária": "bg-indigo-100 text-indigo-800",
  "Operacional": "bg-sky-100 text-sky-800",
  "Emergente": "bg-amber-100 text-amber-800",
} as const;

const scoreTierToneMap = {
  Excelente: "bg-emerald-100 text-emerald-800",
  Alto: "bg-sky-100 text-sky-800",
  Médio: "bg-amber-100 text-amber-800",
  Baixo: "bg-rose-100 text-rose-800",
} as const;

const microSectionTitleClassName =
  "mb-3 rounded-md border border-border/80 bg-muted/50 px-3 py-1.5 text-sm font-semibold tracking-wide text-foreground";

const microCardTitleClassName =
  "rounded-md border border-border/70 bg-muted/50 px-2.5 py-1 text-sm font-semibold leading-snug text-foreground";

const renderMultilineText = (value?: string | null) => {
  if (!value?.trim()) {
    return <p className="text-sm text-muted-foreground">Não informado.</p>;
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
      {value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
    </div>
  );
};

const PlatformDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [platform, setPlatform] = useState<PlatformDetailsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const fetchPlatform = async () => {
      const platformIdFromState = (location.state as { platformId?: string } | null)?.platformId;
      const fallbackMockPlatform =
        (platformIdFromState ? getMockPlatformById(platformIdFromState) : null) ||
        (slug ? getMockPlatformBySlug(slug) : null);

      try {
        const query = supabase.from("platforms").select("*");

        const { data, error } = platformIdFromState
          ? await query.eq("id", platformIdFromState).maybeSingle()
          : await query.eq("slug", slug || "").maybeSingle();

        if (error) {
          if (fallbackMockPlatform) {
            setPlatform(fallbackMockPlatform);
            setIsPreviewMode(true);
            return;
          }
          throw error;
        }

        if (!data) {
          if (fallbackMockPlatform) {
            setPlatform(fallbackMockPlatform);
            setIsPreviewMode(true);
          } else {
            setPlatform(null);
          }
          return;
        }

        const rawPlatform = data as PlatformRow;
        setPlatform({
          ...rawPlatform,
          thumbs_up_count: Number(rawPlatform.thumbs_up_count || 0),
          thumbs_down_count: Number(rawPlatform.thumbs_down_count || 0),
        });
        setIsPreviewMode(false);
      } catch (error) {
        console.error("Erro ao carregar plataforma:", error);
        if (fallbackMockPlatform) {
          setPlatform(fallbackMockPlatform);
          setIsPreviewMode(true);
        } else {
          setPlatform(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlatform();
  }, [location.state, slug]);

  const usefulLinks = useMemo(() => normalizeUsefulLinks(platform?.useful_links), [platform?.useful_links]);
  const forumLink = useMemo(() => {
    if (!platform?.forum_url?.trim()) return null;
    return normalizeUrl(platform.forum_url);
  }, [platform?.forum_url]);
  const requestFormLink = useMemo(() => {
    if (!platform?.request_form_url?.trim()) return null;
    return normalizeUrl(platform.request_form_url);
  }, [platform?.request_form_url]);
  const documentationLink = useMemo(() => {
    const documentationCandidate = usefulLinks.find((link) =>
      /documenta[cç][aã]o|documenta|docs|pop/i.test(link.label)
    );

    return documentationCandidate?.url || usefulLinks[0]?.url || null;
  }, [usefulLinks]);

  const operationalScores = useMemo(
    () => normalizeScoreMap(platform?.operational_capacity_scores, operationalCapacityCriteria),
    [platform?.operational_capacity_scores]
  );

  const strategicScores = useMemo(
    () => normalizeScoreMap(platform?.strategic_potential_scores, strategicPotentialCriteria),
    [platform?.strategic_potential_scores]
  );

  const operationalAverage = useMemo(
    () => calculateAverageScore(operationalScores, operationalCapacityCriteria),
    [operationalScores]
  );

  const strategicAverage = useMemo(
    () => calculateAverageScore(strategicScores, strategicPotentialCriteria),
    [strategicScores]
  );

  const quadrant = useMemo(
    () => resolvePlatformQuadrant(operationalAverage, strategicAverage),
    [operationalAverage, strategicAverage]
  );
  const scoreCard = useMemo(
    () => buildPlatformScoreCard(operationalAverage, strategicAverage),
    [operationalAverage, strategicAverage]
  );

  const handleVote = async (type: "up" | "down") => {
    if (!platform || voting) return;

    const nextUp = type === "up" ? platform.thumbs_up_count + 1 : platform.thumbs_up_count;
    const nextDown = type === "down" ? platform.thumbs_down_count + 1 : platform.thumbs_down_count;

    if (isPreviewMode) {
      setPlatform((current) => {
        if (!current) return current;
        return {
          ...current,
          thumbs_up_count: nextUp,
          thumbs_down_count: nextDown,
        };
      });
      return;
    }

    setVoting(true);

    try {
      const { error } = await supabase
        .from("platforms")
        .update({
          thumbs_up_count: nextUp,
          thumbs_down_count: nextDown,
        })
        .eq("id", platform.id);

      if (error) {
        throw error;
      }

      setPlatform((current) => {
        if (!current) return current;
        return {
          ...current,
          thumbs_up_count: nextUp,
          thumbs_down_count: nextDown,
        };
      });
    } catch (error) {
      console.error("Erro ao registrar avaliação:", error);
      toast({
        title: "Não foi possível registrar sua avaliação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!platform) {
    return (
      <Layout>
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Plataforma não encontrada</h2>
          <Button variant="outline" onClick={() => navigate("/stack-digital")}>Voltar ao Stack Digital</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Badge variant="secondary">{platform.category || "Geral"}</Badge>
          <Badge variant="outline">{platform.status || "Ativa"}</Badge>
          {isPreviewMode && <Badge className="bg-amber-100 text-amber-800">Pré-visualização</Badge>}
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm ring-1 ring-border/80">
                    {platform.client_logo_url && !logoLoadError ? (
                      <img
                        src={platform.client_logo_url}
                        alt={`Logo de ${platform.name}`}
                        className="h-full w-full object-contain p-1.5"
                        onError={() => setLogoLoadError(true)}
                      />
                    ) : (
                      <Building2 className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{platform.name}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {platform.short_description || "Sem descrição curta."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {forumLink && (
                      <Button asChild variant="outline" className="h-11 w-full justify-between rounded-xl bg-white">
                        <a href={forumLink} target="_blank" rel="noreferrer">
                          <span className="flex items-center">
                            <img
                              src={googleChatLogo}
                              alt="Google Chat"
                              className="mr-2 h-4 w-4"
                            />
                            Acessar Fórum da Plataforma
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {requestFormLink && (
                      <Button asChild className="h-11 w-full justify-between rounded-xl px-4 font-semibold shadow-sm">
                        <a href={requestFormLink} target="_blank" rel="noreferrer">
                          <span className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Solicitar Contratação
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  {documentationLink ? (
                    <Button
                      asChild
                      className="h-11 w-full justify-between rounded-xl border border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <a href={documentationLink} target="_blank" rel="noreferrer">
                        <span className="flex items-center">
                          <BookOpenText className="mr-2 h-4 w-4" />
                          Documentação Completa e POPs
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="h-11 w-full justify-between rounded-xl border border-slate-300 bg-slate-200 text-slate-600"
                    >
                      <span className="flex items-center">
                        <BookOpenText className="mr-2 h-4 w-4" />
                        Documentação Completa e POPs
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide">Em breve</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full max-w-[360px] space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                  <p className="inline-flex rounded-md border border-border/70 bg-muted/50 px-2.5 py-1 text-sm font-semibold tracking-wide text-foreground">
                    Maturidade de GTM
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {platform.gtm_maturity?.trim() || "Não informado"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="inline-flex rounded-md border border-border/70 bg-muted/50 px-2.5 py-1 text-sm font-semibold tracking-wide text-foreground">
                      Avaliação da Plataforma
                    </p>
                    {isPreviewMode && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        Preview
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      disabled={voting}
                      onClick={() => handleVote("up")}
                      className="justify-start border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Positivos: {platform.thumbs_up_count}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={voting}
                      onClick={() => handleVote("down")}
                      className="justify-start border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Negativos: {platform.thumbs_down_count}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Descrição Geral da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>{renderMultilineText(platform.general_description)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Para Que e Quem Serve</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>ICP Recomendado</h3>
              {renderMultilineText(platform.icp_recommended)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Aplicações Práticas</h3>
              {renderMultilineText(platform.practical_applications)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Benefícios e Vantagens</h3>
              {renderMultilineText(platform.benefits_and_advantages)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Negociação e Benefício da Parceria</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Benefício para o Cliente</h3>
              {renderMultilineText(platform.client_benefits)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Benefício para a Unidade</h3>
              {renderMultilineText(platform.unit_benefits)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Regulamentos da Parceria</h3>
              {renderMultilineText(platform.partnership_regulations)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <h3 className={microSectionTitleClassName}>Precificação Base</h3>
              {renderMultilineText(platform.base_pricing)}
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 md:col-span-2">
              <h3 className={microSectionTitleClassName}>Comissionamento e Notas Fiscais</h3>
              {renderMultilineText(platform.commission_and_invoicing)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Como Contratar</CardTitle>
          </CardHeader>
          <CardContent>{renderMultilineText(platform.how_to_hire)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Suporte Técnico e Comercial</CardTitle>
          </CardHeader>
          <CardContent>{renderMultilineText(platform.technical_commercial_support)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Links Úteis</CardTitle>
          </CardHeader>
          <CardContent>
            {usefulLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum link cadastrado.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {usefulLinks.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="mr-4 truncate font-medium">{link.label}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Complexidade Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-border/70 bg-gradient-to-r from-slate-50 to-slate-100">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Score Card da Plataforma</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{scoreCard.overallScore}/100</p>
                  </div>

                  <Badge className={scoreTierToneMap[scoreCard.tier]}>{scoreCard.tier}</Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/80 transition-all"
                      style={{ width: `${scoreCard.overallScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Score consolidado gerado automaticamente com base nas notas de todos os critérios da seção 7.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Média Operacional</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{scoreCard.operationalAverage.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Média Estratégica</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{scoreCard.strategicAverage.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Média Geral</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{scoreCard.overallAverage.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-base">Capacidade Operacional (6 critérios)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {operationalCapacityCriteria.map((criterion) => (
                    <div key={criterion.key} className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className={microCardTitleClassName}>{criterion.title}</p>
                        <Badge variant="outline">{operationalScores[criterion.key].toFixed(1)}</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{criterion.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-base">Potencial Estratégico (6 critérios)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {strategicPotentialCriteria.map((criterion) => (
                    <div key={criterion.key} className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className={microCardTitleClassName}>{criterion.title}</p>
                        <Badge variant="outline">{strategicScores[criterion.key].toFixed(1)}</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{criterion.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 bg-muted/30">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Média operacional</p>
                    <p className="text-lg font-semibold text-foreground">{operationalAverage.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Média estratégica</p>
                    <p className="text-lg font-semibold text-foreground">{strategicAverage.toFixed(2)}</p>
                  </div>
                  <Badge className={quadrantToneMap[quadrant]}>{quadrant}</Badge>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {quadrantDescriptions[quadrant]}
                </p>

                <div className="mt-4 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                  {Object.entries(quadrantDescriptions).map(([label, description]) => (
                    <div key={label} className="rounded-lg border border-border/70 bg-background p-3">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-1">{description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

      </section>
    </Layout>
  );
};

export default PlatformDetails;
