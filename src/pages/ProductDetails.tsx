import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, User, Clock, CheckCircle, XCircle } from "lucide-react";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { formatCurrency } from "@/lib/formatters";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
}

interface ComoEntregoItem {
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
}

interface Position {
  id: string;
  nome: string;
  investimento_total: number;
  cph: number;
}

interface Product {
  id: string;
  produto: string;
  categoria: "saber" | "ter" | "executar" | "potencializar";
  duracao: string;
  dono: string;
  valor: string;
  pitch: boolean;
  bpmn: boolean;
  playbook: boolean;
  icp: boolean;
  pricing: boolean;
  certificacao: boolean;
  pitchUrl?: string;
  bpmnUrl?: string;
  playbookUrl?: string;
  icpUrl?: string;
  pricingUrl?: string;
  certificacaoUrl?: string;
  status: "Disponível" | "Em produção" | "Em homologação";
  description: string;
  comoVendo: string;
  spicedData: SpicedData;
  comoEntregoDados: ComoEntregoItem[];
  oQueEntrego: string;
  paraQuemServe?: string;
  comoEntregaValor?: string;
  bonusKpi?: string;
  kpiPrincipal?: "CPL" | "CTR" | "CONVERSÃO" | "ENGAJAMENTO" | "TAXA DE ABERTURA";
  tempoMetaKpi?: "3 meses" | "6 meses" | "12 meses";
  garantiaEspecifica?: string;
  stackDigital?: string;
  entregaveisRelacionados?: string;
  case1Name?: string;
  case1UnidadeResponsavel?: string;
  case1ResponsavelProjeto?: string;
  case1DocumentoUrl?: string;
  case2Name?: string;
  case2UnidadeResponsavel?: string;
  case2ResponsavelProjeto?: string;
  case2DocumentoUrl?: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions' as any)
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setPositions((data as unknown as Position[]) || []);
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        if (data) {
          const formattedProduct: Product = {
            id: data.id,
            produto: data.produto,
            categoria: data.categoria,
            duracao: data.duracao,
            dono: data.dono,
            valor: data.valor,
            pitch: data.pitch,
            bpmn: data.bpmn,
            playbook: data.playbook,
            icp: data.icp,
            pricing: data.pricing,
            certificacao: data.certificacao,
            pitchUrl: data.pitch_url,
            bpmnUrl: data.bpmn_url,
            playbookUrl: data.playbook_url,
            icpUrl: data.icp_url,
            pricingUrl: data.pricing_url,
            certificacaoUrl: data.certificacao_url,
            status: data.status,
            description: data.description,
            comoVendo: data.como_vendo,
            spicedData: (data.spiced_data as unknown) as SpicedData,
            comoEntregoDados: (data.como_entrego_dados as unknown as ComoEntregoItem[]) || [],
            oQueEntrego: data.o_que_entrego,
            paraQuemServe: data.para_quem_serve,
            comoEntregaValor: data.como_entrega_valor,
            bonusKpi: data.bonus_kpi,
            kpiPrincipal: data.kpi_principal,
            tempoMetaKpi: data.tempo_meta_kpi,
            garantiaEspecifica: data.garantia_especifica,
            stackDigital: data.stack_digital,
            entregaveisRelacionados: data.entregaveis_relacionados,
            case1Name: data.case_1_name,
            case1UnidadeResponsavel: data.case_1_unidade_responsavel,
            case1ResponsavelProjeto: data.case_1_responsavel_projeto,
            case1DocumentoUrl: data.case_1_documento_url,
            case2Name: data.case_2_name,
            case2UnidadeResponsavel: data.case_2_unidade_responsavel,
            case2ResponsavelProjeto: data.case_2_responsavel_projeto,
            case2DocumentoUrl: data.case_2_documento_url
          };
          setProduct(formattedProduct);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchPositions();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Portfólio
          </Button>
        </div>
      </div>
    );
  }

  // Block access to "Em produção" products
  if (product.status === "Em produção") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto em Produção</h1>
          <p className="text-muted-foreground mb-6">Este produto ainda está em desenvolvimento e não pode ser visualizado.</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Portfólio
          </Button>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    saber: "SABER",
    ter: "TER", 
    executar: "EXECUTAR",
    potencializar: "POTENCIALIZAR"
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { color: "bg-green-100 text-green-800", variant: "default" as const },
      "Em produção": { color: "bg-purple-100 text-purple-800", variant: "secondary" as const },
      "Em homologação": { color: "bg-yellow-100 text-yellow-800", variant: "outline" as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  const checkboxItems = [
    { key: 'pitch', label: 'Pitch', url: product.pitchUrl },
    { key: 'bpmn', label: 'BPMN', url: product.bpmnUrl },
    { key: 'playbook', label: 'Playbook', url: product.playbookUrl },
    { key: 'icp', label: 'ICP', url: product.icpUrl },
    { key: 'pricing', label: 'Pricing', url: product.pricingUrl },
    { key: 'certificacao', label: 'Certificação', url: product.certificacaoUrl },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Portfólio
          </Button>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{backgroundColor: `hsl(var(--${product.categoria}))`}}
                >
                  {categoryLabels[product.categoria]}
                </div>
                <Badge variant={getStatusBadge(product.status).variant}>
                  {product.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.produto}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{product.dono}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{product.duracao} dias</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(product.valor)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Descrição - O que é o Produto? */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Descrição - O que é o Produto?</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">{product.description}</p>
          </Card>

          {/* Pra quem ele serve */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Pra quem ele serve?</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
              {product.paraQuemServe || "Informação a ser definida para este produto."}
            </div>
          </Card>

          {/* Como ele entrega valor */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Como ele entrega valor?</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
              {product.comoEntregaValor || "Informação a ser definida para este produto."}
            </div>
          </Card>

          {/* O que eu entrego */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">O que eu entrego?</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">{product.oQueEntrego}</div>
          </Card>

          {/* Como eu vendo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Como eu vendo?</h2>
            <div className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line text-justify">{product.comoVendo}</div>
            
            {/* Tabela SPICED */}
            <SpicedTable data={product.spicedData} readOnly />
          </Card>

          {/* Como eu entrego */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Como eu entrego?</h2>
            <ComoEntregoTable data={product.comoEntregoDados} readOnly positions={positions} />
          </Card>

          {/* Botão Playbook */}
          <div className="flex justify-center">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              onClick={() => window.open(product.playbookUrl || '#', '_blank')}
              disabled={!product.playbookUrl}
            >
              Utilize o Playbook no eKyte
            </Button>
          </div>

          {/* Recursos disponíveis */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recursos Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkboxItems.map(item => {
                const isAvailable = product[item.key as keyof Product] as boolean;
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {isAvailable ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className={isAvailable ? "text-foreground" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                    </div>
                    {isAvailable && item.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                        className="h-8 px-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Cases */}
          {(product.case1UnidadeResponsavel || product.case2UnidadeResponsavel) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Cases</h2>
              <div className="grid gap-6">
                {product.case1UnidadeResponsavel && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3">{product.case1Name || 'Case 1'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Unidade Responsável</p>
                        <p className="text-foreground">{product.case1UnidadeResponsavel}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Responsável pelo Projeto</p>
                        <p className="text-foreground">{product.case1ResponsavelProjeto}</p>
                      </div>
                      {product.case1DocumentoUrl && (
                        <div className="md:col-span-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(product.case1DocumentoUrl, '_blank')}
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar Documento do {product.case1Name || 'Case 1'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {product.case2UnidadeResponsavel && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3">{product.case2Name || 'Case 2'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Unidade Responsável</p>
                        <p className="text-foreground">{product.case2UnidadeResponsavel}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Responsável pelo Projeto</p>
                        <p className="text-foreground">{product.case2ResponsavelProjeto}</p>
                      </div>
                      {product.case2DocumentoUrl && (
                        <div className="md:col-span-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(product.case2DocumentoUrl, '_blank')}
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar Documento do {product.case2Name || 'Case 2'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* KPIs e Informações Adicionais */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">KPIs e Informações Adicionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.kpiPrincipal && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">KPI Principal</h3>
                  <p className="text-muted-foreground">{product.kpiPrincipal}</p>
                </div>
              )}
              
              {product.tempoMetaKpi && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Tempo Meta KPI</h3>
                  <p className="text-muted-foreground">{product.tempoMetaKpi}</p>
                </div>
              )}
              
              {product.bonusKpi && (
                <div className="md:col-span-2">
                  <h3 className="font-medium text-foreground mb-2">Bonus KPI</h3>
                  <p className="text-muted-foreground leading-relaxed text-justify">{product.bonusKpi}</p>
                </div>
              )}
              
              {product.garantiaEspecifica && (
                <div className="md:col-span-2">
                  <h3 className="font-medium text-foreground mb-2">Garantia Específica</h3>
                  <p className="text-muted-foreground leading-relaxed text-justify">{product.garantiaEspecifica}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;