import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Gauge,
  LayoutGrid,
  List,
  Search,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { mockPlatforms } from "@/lib/platformMockData";
import {
  buildPlatformScoreCard,
  calculateAverageScore,
  normalizeUrl,
  normalizeScoreMap,
  operationalCapacityCriteria,
  strategicPotentialCriteria,
} from "@/lib/platforms";

interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  short_description: string;
  client_logo_url: string | null;
  request_form_url: string | null;
  operational_capacity_scores: unknown;
  strategic_potential_scores: unknown;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];
const stackDigitalRequestFormSettingKey = "stack_digital_request_form_url";
const stackDigitalRequestFormFallbackUrl = "https://forms.gle/solicitacao-contratacao-stack-digital";

const PlatformPortfolio = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [stackRequestFormUrlSetting, setStackRequestFormUrlSetting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logoLoadErrorByPlatform, setLogoLoadErrorByPlatform] = useState<Record<string, boolean>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const mapRowsToItems = (rows: PlatformRow[] | typeof mockPlatforms): PlatformItem[] => {
    return rows.map((platform) => ({
      id: String(platform.id),
      name: String(platform.name || "Plataforma sem nome"),
      slug: String(platform.slug || ""),
      category: String(platform.category || "Geral"),
      status: String(platform.status || "Ativa"),
      short_description: String(platform.short_description || ""),
      client_logo_url:
        typeof platform.client_logo_url === "string" ? platform.client_logo_url : null,
      request_form_url:
        typeof platform.request_form_url === "string" ? platform.request_form_url : null,
      operational_capacity_scores: platform.operational_capacity_scores,
      strategic_potential_scores: platform.strategic_potential_scores,
      thumbs_up_count: Number(platform.thumbs_up_count || 0),
      thumbs_down_count: Number(platform.thumbs_down_count || 0),
    }));
  };

  const getPlatformScoreCard = (platform: PlatformItem) => {
    const operationalScores = normalizeScoreMap(
      platform.operational_capacity_scores,
      operationalCapacityCriteria
    );
    const strategicScores = normalizeScoreMap(
      platform.strategic_potential_scores,
      strategicPotentialCriteria
    );
    const operationalAverage = calculateAverageScore(operationalScores, operationalCapacityCriteria);
    const strategicAverage = calculateAverageScore(strategicScores, strategicPotentialCriteria);
    return buildPlatformScoreCard(operationalAverage, strategicAverage);
  };

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const [{ data, error }, { data: settingsData, error: settingsError }] = await Promise.all([
          supabase
            .from("platforms")
            .select("*")
            .order("updated_at", { ascending: false }),
          supabase
            .from("site_settings")
            .select("setting_value")
            .eq("setting_key", stackDigitalRequestFormSettingKey)
            .maybeSingle(),
        ]);

        if (settingsError) {
          console.error("Erro ao buscar link geral da Stack Digital:", settingsError);
        } else {
          const rawSettingValue =
            settingsData &&
            typeof settingsData === "object" &&
            "setting_value" in settingsData &&
            typeof (settingsData as { setting_value?: unknown }).setting_value === "string"
              ? (settingsData as { setting_value: string }).setting_value
              : null;
          setStackRequestFormUrlSetting(rawSettingValue);
        }

        if (error) {
          console.error("Erro ao buscar plataformas:", error);
          setPlatforms([]);
          return;
        }

        const rows = (data || []) as PlatformRow[];
        setPlatforms(mapRowsToItems(rows));
      } catch (error) {
        console.error("Erro inesperado ao buscar plataformas:", error);
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(platforms.map((platform) => platform.category))).sort(
      (first, second) => first.localeCompare(second)
    );

    return ["all", ...uniqueCategories];
  }, [platforms]);

  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(platforms.map((platform) => platform.status))).sort(
      (first, second) => first.localeCompare(second)
    );

    return ["all", ...uniqueStatuses];
  }, [platforms]);

  const filteredPlatforms = useMemo(() => {
    return platforms
      .filter((platform) => categoryFilter === "all" || platform.category === categoryFilter)
      .filter((platform) => statusFilter === "all" || platform.status === statusFilter)
      .filter((platform) => {
        if (!searchTerm.trim()) return true;
        const normalizedSearch = searchTerm.toLowerCase();
        return (
          platform.name.toLowerCase().includes(normalizedSearch) ||
          platform.short_description.toLowerCase().includes(normalizedSearch) ||
          platform.category.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [platforms, categoryFilter, statusFilter, searchTerm]);

  const stackRequestFormUrl = useMemo(() => {
    const linkFromSetting = stackRequestFormUrlSetting?.trim();
    const linkFromPlatform = platforms.find((platform) => platform.request_form_url?.trim())?.request_form_url;
    return normalizeUrl(linkFromSetting || linkFromPlatform || stackDigitalRequestFormFallbackUrl);
  }, [platforms, stackRequestFormUrlSetting]);

  const handleViewDetails = (platform: PlatformItem) => {
    navigate(`/stack-digital/plataforma/${platform.slug}`, { state: { platformId: platform.id } });
  };

  const handleLogoLoadError = (platformId: string) => {
    setLogoLoadErrorByPlatform((current) => ({
      ...current,
      [platformId]: true,
    }));
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Stack Digital</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Central de plataformas parceiras dentro da stack digital.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[290px]">
          <Button asChild className="h-10 rounded-xl px-4 font-semibold shadow-sm">
            <a href={stackRequestFormUrl} target="_blank" rel="noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Solicitar Contratação
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-border/80 bg-white px-4"
            onClick={() => navigate("/stack-digital/quadrante-gartner")}
          >
            Ver Quadrante Gartner das Plataformas
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por plataforma, categoria ou descrição..."
            className="h-11 rounded-xl border-border/80 bg-white pl-10 shadow-sm"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-11 rounded-xl border-border/80 bg-white shadow-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "Todas categorias" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 rounded-xl border-border/80 bg-white shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "Todos os status" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-white p-1 shadow-sm">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-9 rounded-lg px-3"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-9 rounded-lg px-3"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]">
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">Carregando plataformas...</div>
          )}

          {!loading && filteredPlatforms.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma plataforma encontrada para os filtros selecionados.
            </div>
          )}

          {!loading && filteredPlatforms.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPlatforms.map((platform) => {
                const scoreCard = getPlatformScoreCard(platform);

                return (
                  <Card
                    key={platform.id}
                    className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm ring-1 ring-border/80">
                            {platform.client_logo_url && !logoLoadErrorByPlatform[platform.id] ? (
                              <img
                                src={platform.client_logo_url}
                                alt={`Logo de ${platform.name}`}
                                className="h-full w-full object-contain p-1"
                                onError={() => handleLogoLoadError(platform.id)}
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <CardTitle className="line-clamp-2 pt-1 text-base leading-tight">{platform.name}</CardTitle>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-border/80 bg-white px-2.5"
                          onClick={() => handleViewDetails(platform)}
                        >
                          Abrir
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {platform.category}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {platform.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {platform.short_description || "Sem descrição curta"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {platform.thumbs_up_count}
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                          <ThumbsDown className="h-3.5 w-3.5" />
                          {platform.thumbs_down_count}
                        </div>
                        <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">
                          <Gauge className="h-3.5 w-3.5" />
                          Score: {scoreCard.overallScore}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-muted/55">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Logo</th>
                  <th className="px-4 py-3 font-semibold">Plataforma</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score Card</th>
                  <th className="px-4 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {loading && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
                      Carregando plataformas...
                    </td>
                  </tr>
                )}

                {!loading && filteredPlatforms.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
                      Nenhuma plataforma encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredPlatforms.map((platform) => {
                    const scoreCard = getPlatformScoreCard(platform);

                    return (
                      <tr key={platform.id} className="bg-white transition-colors hover:bg-muted/25">
                        <td className="px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                            {platform.client_logo_url && !logoLoadErrorByPlatform[platform.id] ? (
                              <img
                                src={platform.client_logo_url}
                                alt={`Logo de ${platform.name}`}
                                className="h-full w-full object-contain"
                                onError={() => handleLogoLoadError(platform.id)}
                              />
                            ) : (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[320px] truncate text-sm font-semibold text-foreground">
                            {platform.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            {platform.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            {platform.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            <Gauge className="h-3.5 w-3.5" />
                            {scoreCard.overallScore}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-lg border-border/80 bg-white px-3"
                            onClick={() => handleViewDetails(platform)}
                          >
                            Abrir
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlatformPortfolio;
