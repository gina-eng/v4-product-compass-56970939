import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { mockPlatforms } from "@/lib/platformMockData";
import {
  buildPlatformScoreCard,
  calculateAverageScore,
  normalizeScoreMap,
  resolvePlatformQuadrant,
  type PlatformQuadrant,
  operationalCapacityCriteria,
  strategicPotentialCriteria,
} from "@/lib/platforms";

type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];

interface PlatformQuadrantItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  operational_capacity_scores: unknown;
  strategic_potential_scores: unknown;
}

interface PlatformQuadrantPoint extends PlatformQuadrantItem {
  operationalAverage: number;
  strategicAverage: number;
  overallScore: number;
  quadrant: PlatformQuadrant;
}

const quadrantColorMap: Record<PlatformQuadrant, string> = {
  "Líder": "#16a34a",
  "Visionária": "#2563eb",
  "Operacional": "#0ea5e9",
  "Emergente": "#f59e0b",
};

const quadrantOrder: PlatformQuadrant[] = ["Líder", "Visionária", "Operacional", "Emergente"];

const PlatformGartnerQuadrantPage = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<PlatformQuadrantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const mapRowsToItems = (rows: PlatformRow[] | typeof mockPlatforms): PlatformQuadrantItem[] => {
    return rows.map((platform) => ({
      id: String(platform.id),
      name: String(platform.name || "Plataforma sem nome"),
      slug: String(platform.slug || ""),
      category: String(platform.category || "Geral"),
      status: String(platform.status || "Ativa"),
      operational_capacity_scores: platform.operational_capacity_scores,
      strategic_potential_scores: platform.strategic_potential_scores,
    }));
  };

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const { data, error } = await supabase
          .from("platforms")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar plataformas para o quadrante:", error);
          setPlatforms([]);
          return;
        }

        const rows = (data || []) as PlatformRow[];
        setPlatforms(mapRowsToItems(rows));
      } catch (error) {
        console.error("Erro inesperado ao buscar plataformas para o quadrante:", error);
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  const points = useMemo<PlatformQuadrantPoint[]>(() => {
    return platforms.map((platform) => {
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
      const scoreCard = buildPlatformScoreCard(operationalAverage, strategicAverage);

      return {
        ...platform,
        operationalAverage,
        strategicAverage,
        overallScore: scoreCard.overallScore,
        quadrant: resolvePlatformQuadrant(operationalAverage, strategicAverage),
      };
    });
  }, [platforms]);

  const groupedByQuadrant = useMemo(() => {
    return quadrantOrder.reduce<Record<PlatformQuadrant, PlatformQuadrantPoint[]>>(
      (accumulator, quadrant) => {
        accumulator[quadrant] = points.filter((point) => point.quadrant === quadrant);
        return accumulator;
      },
      {
        "Líder": [],
        "Visionária": [],
        "Operacional": [],
        "Emergente": [],
      }
    );
  }, [points]);

  const sortedPoints = useMemo(() => {
    return [...points].sort((first, second) => second.overallScore - first.overallScore);
  }, [points]);

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quadrante Gartner da Stack Digital</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visão consolidada de todas as plataformas com posicionamento por notas operacionais, estratégicas e score card.
            </p>
            {isPreviewMode && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                Modo visual: exibindo dados de exemplo locais (sem dependência do Supabase).
              </p>
            )}
          </div>

          <Button variant="outline" className="bg-white" onClick={() => navigate("/stack-digital")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Stack Digital
          </Button>
        </header>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>Posicionamento Unificado das Plataformas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Eixo X: Potencial Estratégico | Eixo Y: Capacidade Operacional. O tamanho da bolha representa o score card da plataforma.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading && (
              <div className="rounded-xl border border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Carregando quadrante...
              </div>
            )}

            {!loading && points.length === 0 && (
              <div className="rounded-xl border border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Nenhuma plataforma disponível para montar o quadrante.
              </div>
            )}

            {!loading && points.length > 0 && (
              <>
                <div className="h-[520px] w-full rounded-xl border border-border/70 bg-white p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 12, right: 24, bottom: 20, left: 8 }}>
                      <CartesianGrid strokeDasharray="4 4" />

                      <ReferenceArea x1={0} x2={3} y1={0} y2={3} fill="#fef3c7" fillOpacity={0.22} />
                      <ReferenceArea x1={3} x2={5} y1={0} y2={3} fill="#dbeafe" fillOpacity={0.22} />
                      <ReferenceArea x1={0} x2={3} y1={3} y2={5} fill="#e0f2fe" fillOpacity={0.22} />
                      <ReferenceArea x1={3} x2={5} y1={3} y2={5} fill="#dcfce7" fillOpacity={0.22} />

                      <ReferenceLine x={3} stroke="#64748b" strokeDasharray="6 6" />
                      <ReferenceLine y={3} stroke="#64748b" strokeDasharray="6 6" />

                      <XAxis
                        type="number"
                        dataKey="strategicAverage"
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        name="Potencial Estratégico"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="number"
                        dataKey="operationalAverage"
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        name="Capacidade Operacional"
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <ZAxis type="number" dataKey="overallScore" range={[120, 620]} name="Score Card" />
                      <Tooltip cursor={{ strokeDasharray: "4 4" }} />

                      {quadrantOrder.map((quadrant) => (
                        <Scatter
                          key={quadrant}
                          name={quadrant}
                          data={groupedByQuadrant[quadrant]}
                          fill={quadrantColorMap[quadrant]}
                        >
                          <LabelList dataKey="name" position="top" fontSize={11} />
                        </Scatter>
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {quadrantOrder.map((quadrant) => (
                    <div key={quadrant} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">{quadrant}</span>
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: quadrantColorMap[quadrant] }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {groupedByQuadrant[quadrant].length} plataforma(s)
                      </p>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-border/80">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[940px]">
                      <thead className="bg-muted/40">
                        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3 font-semibold">Plataforma</th>
                          <th className="px-4 py-3 font-semibold">Capacidade Operacional</th>
                          <th className="px-4 py-3 font-semibold">Potencial Estratégico</th>
                          <th className="px-4 py-3 font-semibold">Score Card</th>
                          <th className="px-4 py-3 font-semibold">Quadrante</th>
                          <th className="px-4 py-3 font-semibold">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/80 bg-white">
                        {sortedPoints.map((point) => (
                          <tr key={point.id}>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{point.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {point.category} • {point.status}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {point.operationalAverage.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {point.strategicAverage.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{point.overallScore}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-muted text-foreground">{point.quadrant}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg bg-white"
                                disabled={!point.slug}
                                onClick={() =>
                                  navigate(`/stack-digital/plataforma/${point.slug}`, { state: { platformId: point.id } })
                                }
                              >
                                Abrir
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default PlatformGartnerQuadrantPage;
