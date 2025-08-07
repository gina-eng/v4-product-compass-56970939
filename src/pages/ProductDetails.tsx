import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import ProductPositions from "@/components/ProductPositions";
import { formatCurrency } from "@/lib/formatters";

interface Product {
  id: string;
  produto: string;
  categoria: string;
  status: string;
  valor: string;
  duracao: string;
  description: string;
  descricao_card?: string;
  icp?: string;
  escopo?: string;
  duracao_media?: string;
  time_envolvido?: string;
  formato_entrega?: string;
  descricao_completa?: string;
  para_quem_serve?: string;
  como_entrega_valor?: string;
  entregaveis_relacionados?: string;
  icp_url?: string;
  o_que_entrego?: string;
  pitch_url?: string;
  bpmn_url?: string;
  playbook_url?: string;
  pricing_url?: string;
  certificacao_url?: string;
  case_1_name?: string;
  case_1_unidade_responsavel?: string;
  case_1_responsavel_projeto?: string;
  case_1_documento_url?: string;
  case_2_name?: string;
  case_2_unidade_responsavel?: string;
  case_2_responsavel_projeto?: string;
  case_2_documento_url?: string;
  como_vendo: string;
  spiced_data: any;
  como_entrego_dados: any[];
  markup?: number;
}

interface Position {
  id: string;
  nome: string;
  cph: number;
  investimento_total: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchPositions();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Mapear os dados para a nova interface
      const mappedProduct: Product = {
        id: data.id,
        produto: data.produto,
        categoria: data.categoria,
        status: data.status,
        valor: data.valor,
        duracao: data.duracao,
        description: data.description,
        descricao_card: data.descricao_card,
        icp: typeof data.icp === 'string' ? data.icp : undefined,
        escopo: data.escopo,
        duracao_media: data.duracao_media,
        time_envolvido: data.time_envolvido,
        formato_entrega: data.formato_entrega,
        descricao_completa: data.descricao_completa,
        para_quem_serve: data.para_quem_serve,
        como_entrega_valor: data.como_entrega_valor,
        entregaveis_relacionados: data.entregaveis_relacionados,
        icp_url: data.icp_url,
        o_que_entrego: data.o_que_entrego,
        pitch_url: data.pitch_url,
        bpmn_url: data.bpmn_url,
        playbook_url: data.playbook_url,
        pricing_url: data.pricing_url,
        certificacao_url: data.certificacao_url,
        case_1_name: data.case_1_name,
        case_1_unidade_responsavel: data.case_1_unidade_responsavel,
        case_1_responsavel_projeto: data.case_1_responsavel_projeto,
        case_1_documento_url: data.case_1_documento_url,
        case_2_name: data.case_2_name,
        case_2_unidade_responsavel: data.case_2_unidade_responsavel,
        case_2_responsavel_projeto: data.case_2_responsavel_projeto,
        case_2_documento_url: data.case_2_documento_url,
        como_vendo: data.como_vendo,
        spiced_data: data.spiced_data,
        como_entrego_dados: Array.isArray(data.como_entrego_dados) ? data.como_entrego_dados : [],
        markup: data.markup
      };
      
      setProduct(mappedProduct);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      saber: "hsl(var(--saber))",
      ter: "hsl(var(--ter))", 
      executar: "hsl(var(--executar))",
      potencializar: "hsl(var(--potencializar))"
    };
    return colors[category as keyof typeof colors] || "hsl(var(--primary))";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Em produção": { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      "Em homologação": { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Produto não encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{product.produto}</h1>
        </div>

        {/* Estrutura do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-bold text-foreground">Título:</span>
                <p className="font-normal text-content">{product.produto}</p>
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Categoria:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{backgroundColor: getCategoryColor(product.categoria)}}
                  >
                    {product.categoria.toUpperCase()}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Status:</span>
                <Badge 
                  variant={getStatusBadge(product.status).variant}
                  className={`ml-2 ${getStatusBadge(product.status).className}`}
                >
                  {product.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Valor Base:</span>
                <p className="font-normal text-content">
                  {product.valor === "A definir" ? product.valor : formatCurrency(product.valor)}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Duração:</span>
              <p className="text-sm text-content">{product.duracao}</p>
            </div>
          </CardContent>
        </Card>

        {/* Visão Geral do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.para_quem_serve && (
                <div>
                  <span className="text-sm font-bold text-foreground">Para quem serve:</span>
                  <p className="text-sm text-content">{product.para_quem_serve}</p>
                </div>
              )}
              {product.como_entrega_valor && (
                <div>
                  <span className="text-sm font-bold text-foreground">Como entregar valor:</span>
                  <p className="text-sm text-content">{product.como_entrega_valor}</p>
                </div>
              )}
              {product.entregaveis_relacionados && (
                <div>
                  <span className="text-sm font-bold text-foreground">Entregáveis relacionados:</span>
                  <p className="text-sm text-content">{product.entregaveis_relacionados}</p>
                </div>
              )}
              {product.icp_url && (
                <div>
                  <span className="text-sm font-bold text-foreground">ICP:</span>
                  <a 
                    href={product.icp_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Documento ICP
                  </a>
                </div>
              )}
              {product.escopo && (
                <div>
                  <span className="text-sm font-bold text-foreground">Escopo:</span>
                  <p className="text-sm text-content">{product.escopo}</p>
                </div>
              )}
              {product.duracao_media && (
                <div>
                  <span className="text-sm font-bold text-foreground">Duração média:</span>
                  <p className="text-sm text-content">{product.duracao_media}</p>
                </div>
              )}
              {product.time_envolvido && (
                <div>
                  <span className="text-sm font-bold text-foreground">Time envolvido:</span>
                  <p className="text-sm text-content">{product.time_envolvido}</p>
                </div>
              )}
            </div>
            {product.formato_entrega && (
              <div>
                <span className="text-sm font-bold text-foreground">Formato de entrega:</span>
                <p className="text-sm text-content">{product.formato_entrega}</p>
              </div>
            )}
            {product.descricao_completa && (
              <div>
                <span className="text-sm font-bold text-foreground">Descrição completa do produto:</span>
                <p className="text-sm text-justify leading-relaxed text-content">{product.descricao_completa}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações para vender */}
        <Card>
          <CardHeader>
            <CardTitle>Informações para vender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-2">"Como eu vendo?"</h4>
              <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg prose prose-sm max-w-none">
                <div className="text-content whitespace-pre-wrap">
                  {product.como_vendo}
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-bold text-foreground mb-4">Metodologia SPICED</h4>
              <SpicedTable data={product.spiced_data} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Posições Alocadas */}
        <ProductPositions 
          productId={product.id} 
          readOnly={true}
          initialMarkup={product.markup}
        />

        {/* Informações para Operar */}
        <Card>
          <CardHeader>
            <CardTitle>Informações para Operar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-bold text-foreground">"Como eu entrego?"</span>
                <p className="text-sm mt-2 text-content">{product.description}</p>
              </div>
              
              {product.o_que_entrego && (
                <div>
                  <span className="text-sm font-bold text-foreground">"O que entrego"</span>
                  <p className="text-sm mt-2 text-content">{product.o_que_entrego}</p>
                </div>
              )}
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-bold text-foreground mb-4">Etapas de Entrega</h4>
                <ComoEntregoTable 
                  data={product.como_entrego_dados || []} 
                  readOnly={true}
                  positions={positions}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materiais e Documentos */}
        {(product.pitch_url || product.bpmn_url || product.playbook_url || product.pricing_url || product.certificacao_url || 
          product.case_1_name || product.case_2_name) && (
          <Card>
            <CardHeader>
              <CardTitle>Materiais e Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URLs de Documentos */}
              {(product.pitch_url || product.bpmn_url || product.playbook_url || product.pricing_url || product.certificacao_url) && (
                <div>
                  <h4 className="font-bold text-foreground mb-4">URLs de Documentos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.pitch_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Pitch URL:</span>
                        <a 
                          href={product.pitch_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.pitch_url || "Link teste"}
                        </a>
                      </div>
                    )}
                    {product.bpmn_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">BPMN URL:</span>
                        <a 
                          href={product.bpmn_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.bpmn_url || "Link teste"}
                        </a>
                      </div>
                    )}
                    {product.playbook_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Playbook URL:</span>
                        <a 
                          href={product.playbook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.playbook_url || "Link teste"}
                        </a>
                      </div>
                    )}
                    {product.pricing_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Pricing URL:</span>
                        <a 
                          href={product.pricing_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.pricing_url || "Link teste"}
                        </a>
                      </div>
                    )}
                    {product.certificacao_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Certificação URL:</span>
                        <a 
                          href={product.certificacao_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.certificacao_url || "Link teste"}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case 1 */}
              {product.case_1_name && (
                <div>
                  <h4 className="font-bold text-foreground mb-4">Case 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-bold text-foreground">Nome do Case 1:</span>
                      <p className="text-sm text-content">{product.case_1_name}</p>
                    </div>
                    {product.case_1_unidade_responsavel && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Unidade Responsável:</span>
                        <p className="text-sm text-content">{product.case_1_unidade_responsavel}</p>
                      </div>
                    )}
                    {product.case_1_responsavel_projeto && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Responsável Projeto:</span>
                        <p className="text-sm text-content">{product.case_1_responsavel_projeto}</p>
                      </div>
                    )}
                    {product.case_1_documento_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">URL do Documento:</span>
                        <a 
                          href={product.case_1_documento_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.case_1_documento_url || "Link teste"}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case 2 */}
              {product.case_2_name && (
                <div>
                  <h4 className="font-bold text-foreground mb-4">Case 2</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-bold text-foreground">Nome do Case 2:</span>
                      <p className="text-sm text-content">{product.case_2_name}</p>
                    </div>
                    {product.case_2_unidade_responsavel && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Unidade Responsável:</span>
                        <p className="text-sm text-content">{product.case_2_unidade_responsavel}</p>
                      </div>
                    )}
                    {product.case_2_responsavel_projeto && (
                      <div>
                        <span className="text-sm font-bold text-foreground">Responsável Projeto:</span>
                        <p className="text-sm text-content">{product.case_2_responsavel_projeto}</p>
                      </div>
                    )}
                    {product.case_2_documento_url && (
                      <div>
                        <span className="text-sm font-bold text-foreground">URL do Documento:</span>
                        <a 
                          href={product.case_2_documento_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block"
                        >
                          {product.case_2_documento_url || "Link teste"}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;