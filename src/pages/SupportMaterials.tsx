import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LoadingSpinner, EmptyState } from "@/components/LoadingStates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bowtieTravas from "@/assets/bowtie-travas.svg";

type TravaKey =
  | "trava_0"
  | "trava_1"
  | "trava_2"
  | "trava_3"
  | "trava_4"
  | "trava_5"
  | "trava_6"
  | "trava_7";

const travaOrder: TravaKey[] = [
  "trava_0",
  "trava_1",
  "trava_2",
  "trava_3",
  "trava_4",
  "trava_5",
  "trava_6",
  "trava_7",
];

const travaInfo: Record<
  TravaKey,
  {
    label: string;
    title: string;
    description: string;
    output: string;
    badgeClass: string;
  }
> = {
  trava_0: {
    label: "Trava 0",
    title: "Cegueira",
    description: "A empresa não enxerga o problema ou a oportunidade que está diante dela.",
    output: "Diagnóstico de mercado e oportunidades para eliminar pontos cegos estratégicos.",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  trava_1: {
    label: "Trava 1",
    title: "Retenção",
    description: "A venda acontece, mas não se repete.",
    output: "Plano de retenção e expansão para aumentar recorrência, recompra e valor do ciclo de vida.",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  trava_2: {
    label: "Trava 2",
    title: "Decisão",
    description: "O cliente chega até o fim, mas não fecha.",
    output: "Estrutura de fechamento com objeções, critérios de decisão e próximos passos claros.",
    badgeClass: "bg-green-100 text-green-700",
  },
  trava_3: {
    label: "Trava 3",
    title: "Compromisso",
    description: "O cliente serve, mas não aparece.",
    output: "Plano de ativação comercial para elevar presença, frequência de contato e avanço de oportunidades.",
    badgeClass: "bg-lime-100 text-lime-700",
  },
  trava_4: {
    label: "Trava 4",
    title: "Qualificação",
    description: "Aqui ocorre um dos maiores autoenganos do crescimento.",
    output: "Critérios de qualificação e roteiros para separar demanda real de volume sem potencial.",
    badgeClass: "bg-yellow-100 text-yellow-800",
  },
  trava_5: {
    label: "Trava 5",
    title: "Interesse",
    description: "Mesmo com atenção, poucos dão o primeiro passo.",
    output: "Estrutura de conversão inicial com ofertas e jornadas para transformar atenção em interesse real.",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  trava_6: {
    label: "Trava 6",
    title: "Atenção",
    description: "Exposição tornou-se commodity.\nA trava não é aparecer — é ser ignorado.",
    output: "Diretrizes de mensagens e criativos para captar atenção qualificada e reduzir indiferença.",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  trava_7: {
    label: "Trava 7",
    title: "Exposição",
    description: "Assumindo que exista mercado real, o próximo gargalo é simples: ninguém vê a empresa.",
    output: "Plano de visibilidade com canais e ações prioritárias para aumentar a exposição da empresa.",
    badgeClass: "bg-red-100 text-red-700",
  },
};

interface SupportMaterial {
  id: string;
  nome_arquivo: string;
  url_direcionamento: string;
  created_at: string;
  trava?: string | null;
  output_cliente?: string | null;
}

const SupportMaterials = () => {
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [travaFilter, setTravaFilter] = useState<"all" | TravaKey>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('support_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os artefatos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inferTravaFromName = (name: string): TravaKey | null => {
    const normalized = name.toLowerCase();
    if (normalized.includes("planejamento")) return "trava_2";
    if (normalized.includes("kick-off") || normalized.includes("kick off") || normalized.includes("kickoff")) {
      return "trava_3";
    }
    if (normalized.includes("growth")) return "trava_4";
    return null;
  };

  const resolveMaterialTrava = (material: SupportMaterial): TravaKey | null => {
    const rawTrava = (material.trava || "").toLowerCase();
    if (rawTrava === "trava_8") {
      // Compatibilidade com registros antigos (retenção mapeada para trava_1)
      return "trava_1";
    }
    if (travaOrder.includes(rawTrava as TravaKey)) {
      return rawTrava as TravaKey;
    }
    return inferTravaFromName(material.nome_arquivo);
  };

  const resolveMaterialOutput = (material: SupportMaterial, trava: TravaKey | null) => {
    const output = material.output_cliente?.trim();
    if (output) return output;
    if (trava) return travaInfo[trava].output;
    return "Output não configurado para este artefato.";
  };

  const filteredMaterials = materials.filter((material) => {
    if (travaFilter === "all") return true;
    return resolveMaterialTrava(material) === travaFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Artefatos</h1>
            <p className="text-muted-foreground mt-2">
              Recursos padronizados para uso recorrente
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-2">
              <img
                src={bowtieTravas}
                alt="Bowtie de travas comerciais"
                className="h-auto max-h-[260px] w-full object-contain"
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Explicação das Travas</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {travaOrder.map((trava) => (
                  <div key={trava} className="rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
                    <p className="text-xs font-semibold text-foreground">
                      A {travaInfo[trava].label} — {travaInfo[trava].title}
                    </p>
                    {travaInfo[trava].description.split("\n").map((line, index) => (
                      <p key={index} className="text-[11px] leading-4 text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 md:flex-row md:items-start md:justify-between">
          <div className="w-full md:max-w-[280px]">
            <p className="text-sm font-medium mb-2">Filtrar por trava</p>
            <Select value={travaFilter} onValueChange={(value: "all" | TravaKey) => setTravaFilter(value)}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Selecione a trava" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as travas</SelectItem>
                {travaOrder.map((trava) => (
                  <SelectItem key={trava} value={trava}>
                    {travaInfo[trava].label} — {travaInfo[trava].title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 flex-1">
            {travaFilter === "all" ? (
              <p className="text-sm text-muted-foreground">
                Selecione uma trava para ver o contexto e filtre os artefatos relacionados.
              </p>
            ) : (
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {travaInfo[travaFilter].label} — {travaInfo[travaFilter].title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {travaInfo[travaFilter].description.replace(/\n/g, " ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum artefato encontrado"
            description="Ainda não há artefatos disponíveis. Entre em contato com o administrador para mais informações."
          />
        ) : filteredMaterials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum artefato para essa trava"
            description="Altere o filtro de trava para visualizar outros artefatos disponíveis."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const materialTrava = resolveMaterialTrava(material);
              const outputText = resolveMaterialOutput(material, materialTrava);

              return (
                <Card key={material.id} className="card-hover animate-scale-in">
                  <CardHeader className="space-y-3">
                    <CardTitle className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {material.nome_arquivo}
                      </span>
                    </CardTitle>

                    {materialTrava ? (
                      <Badge className={`w-fit ${travaInfo[materialTrava].badgeClass}`}>
                        {travaInfo[materialTrava].label} — {travaInfo[materialTrava].title}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        Sem trava definida
                      </Badge>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Adicionado em {new Date(material.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Output para o cliente
                      </p>
                      <p className="mt-2 text-sm text-foreground">{outputText}</p>
                    </div>

                    <Button
                      className="w-full hover-scale"
                      onClick={() => window.open(material.url_direcionamento, "_blank")}
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Acessar Material
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupportMaterials;
