import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, User, Clock, CheckCircle, XCircle } from "lucide-react";
import SpicedTable from "@/components/SpicedTable";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatters";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
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
  detailedDescription: string;
  objetivos: string;
  spicedData: SpicedData;
  entregas: string;
  prerequisitos: string;
  bonusKpi?: string;
  kpiPrincipal?: "CPL" | "CTR" | "CONVERSÃO" | "ENGAJAMENTO" | "TAXA DE ABERTURA";
  tempoMetaKpi?: "3 meses" | "6 meses" | "12 meses";
  garantiaEspecifica?: string;
  stackDigital?: string;
  entregaveisRelacionados?: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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
            detailedDescription: data.detailed_description,
            objetivos: data.objetivos,
            spicedData: (data.spiced_data as unknown) as SpicedData,
            entregas: data.entregas,
            prerequisitos: data.prerequisitos,
            bonusKpi: data.bonus_kpi,
            kpiPrincipal: data.kpi_principal,
            tempoMetaKpi: data.tempo_meta_kpi,
            garantiaEspecifica: data.garantia_especifica,
            stackDigital: data.stack_digital,
            entregaveisRelacionados: data.entregaveis_relacionados
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
          {/* Descrição principal */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">O que é o produto?</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </Card>

          {/* Público-alvo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Pra quem é o produto?</h2>
            <p className="text-muted-foreground leading-relaxed">{product.detailedDescription}</p>
          </Card>

          {/* Como vender */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Como vender o produto?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.objetivos}</p>
            
            {/* Tabela SPICED */}
            <SpicedTable data={product.spicedData} readOnly />
          </Card>

          {/* Como cobrar */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Como cobrar o produto?</h2>
            <p className="text-muted-foreground leading-relaxed">{product.entregas}</p>
          </Card>

          {/* Pré-requisitos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Pré-requisitos</h2>
            <p className="text-muted-foreground leading-relaxed">{product.prerequisitos}</p>
          </Card>

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
                  <h3 className="font-medium text-foreground mb-2">Bônus KPI</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.bonusKpi}</p>
                </div>
              )}
              
              {product.garantiaEspecifica && (
                <div className="md:col-span-2">
                  <h3 className="font-medium text-foreground mb-2">Garantia Específica do Produto</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.garantiaEspecifica}</p>
                </div>
              )}
              
              {product.stackDigital && (
                <div className="md:col-span-2">
                  <h3 className="font-medium text-foreground mb-2">Stack Digital Acoplada</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.stackDigital}</p>
                </div>
              )}
              
              {product.entregaveisRelacionados && (
                <div className="md:col-span-2">
                  <h3 className="font-medium text-foreground mb-2">Entregáveis Relacionados</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.entregaveisRelacionados}</p>
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