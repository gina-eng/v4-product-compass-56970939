import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, User, Clock, CheckCircle, XCircle } from "lucide-react";

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
  entregas: string;
  prerequisitos: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  // Dados mockados (em uma aplicação real, isso viria do Supabase)
  const mockProducts: Product[] = [
    {
      id: "1",
      produto: "Diagnóstico de Mídia Paga (Meta e Google Ads)",
      categoria: "saber",
      duracao: "15-30",
      dono: "Paulo Barros",
      valor: "R$ 2.500,00",
      pitch: true,
      bpmn: true,
      playbook: false,
      icp: true,
      pricing: false,
      certificacao: false,
      pitchUrl: "https://exemplo.com/pitch-diagnostico",
      bpmnUrl: "https://exemplo.com/bpmn-diagnostico",
      icpUrl: "https://exemplo.com/icp-diagnostico",
      status: "Em produção",
      description: "Diagnóstico estratégico de performance em mídia paga para negócios que investem de forma consistente e desejam maximizar resultados.",
      detailedDescription: "Análise completa das campanhas de mídia paga nas principais plataformas digitais, incluindo Meta Ads e Google Ads. O diagnóstico identifica oportunidades de otimização, gaps estratégicos e recomendações específicas para maximizar o ROI dos investimentos em publicidade digital.",
      objetivos: "Identificar oportunidades de melhoria; Otimizar performance das campanhas; Aumentar ROI dos investimentos; Definir estratégias de crescimento",
      entregas: "Relatório executivo com diagnóstico completo; Planilha com análise detalhada das campanhas; Apresentação com recomendações estratégicas; Plano de ação para otimização",
      prerequisitos: "Acesso às contas de anúncios; Histórico de pelo menos 3 meses de campanhas; Dados de conversão configurados"
    },
    {
      id: "2", 
      produto: "E-commerce",
      categoria: "ter",
      duracao: "45-60",
      dono: "Oriana Finta",
      valor: "R$ 15.000,00",
      pitch: false,
      bpmn: false,
      playbook: true,
      icp: false,
      certificacao: true,
      pricing: true,
      playbookUrl: "https://exemplo.com/playbook-ecommerce",
      pricingUrl: "https://exemplo.com/pricing-ecommerce",
      certificacaoUrl: "https://exemplo.com/cert-ecommerce",
      status: "Disponível",
      description: "Implementação completa de plataforma de e-commerce com foco em conversão e experiência do usuário.",
      detailedDescription: "Desenvolvimento e implementação de loja virtual completa, incluindo design responsivo, integração com gateways de pagamento, sistema de gestão de produtos, relatórios analíticos e otimização para conversão.",
      objetivos: "Criar presença digital forte; Aumentar vendas online; Melhorar experiência do cliente; Automatizar processos de venda",
      entregas: "Plataforma e-commerce completa; Design responsivo e otimizado; Integração com pagamentos; Sistema de gestão de produtos; Relatórios e analytics",
      prerequisitos: "Catálogo de produtos definido; Identidade visual da marca; Conta nos gateways de pagamento"
    },
    {
      id: "3",
      produto: "Profissional de Google Ads",
      categoria: "executar",
      duracao: "30-45",
      dono: "Maria Silva",
      valor: "R$ 8.000,00",
      pitch: true,
      bpmn: true,
      playbook: true,
      icp: true,
      pricing: false,
      certificacao: false,
      pitchUrl: "https://exemplo.com/pitch-googleads",
      bpmnUrl: "https://exemplo.com/bpmn-googleads",
      playbookUrl: "https://exemplo.com/playbook-googleads",
      icpUrl: "https://exemplo.com/icp-googleads",
      status: "Em homologação",
      description: "Serviço especializado de gestão e otimização de campanhas Google Ads para maximizar resultados.",
      detailedDescription: "Gestão completa de campanhas Google Ads por profissional certificado, incluindo criação de campanhas, otimização contínua, relatórios detalhados e estratégias avançadas de bidding e segmentação.",
      objetivos: "Maximizar performance das campanhas; Reduzir custo por aquisição; Aumentar volume de conversões; Melhorar qualidade do tráfego",
      entregas: "Gestão completa das campanhas; Relatórios semanais de performance; Otimizações contínuas; Consultoria estratégica mensal",
      prerequisitos: "Conta Google Ads ativa; Budget mínimo definido; Pixel de conversão instalado"
    }
  ];

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.id === id);
    setProduct(foundProduct || null);
  }, [id]);

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

  const categoryLabels = {
    saber: "SABER",
    ter: "TER", 
    executar: "EXECUTAR",
    potencializar: "POTENCIALIZAR"
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { color: "bg-green-100 text-green-800", variant: "default" as const },
      "Em produção": { color: "bg-blue-100 text-blue-800", variant: "secondary" as const },
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
                  {product.valor}
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
            <p className="text-muted-foreground leading-relaxed">{product.objetivos}</p>
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;