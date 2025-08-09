import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingStates";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import ProductPositions from "@/components/ProductPositions";
import TrainingMaterials from "@/components/TrainingMaterials";
import UseCaseMap from "@/components/UseCaseMap";
import ProductSummary from "@/components/ProductSummary";
import { formatCurrency } from "@/lib/formatters";

interface Product {
  id: string;
  produto: string;
  categoria: string;
  status: string;
  valor: string;
  duracao: string;
  dono: string;
  description: string;
  descricao_card?: string;
  escopo?: string;
  duracao_media?: string;
  time_envolvido?: string;
  formato_entrega?: string;
  descricao_completa?: string;
  para_quem_serve?: string;
  como_entrega_valor?: string;
  entregaveis_relacionados?: string;
  stack_digital?: string;
  bonus_kpi?: string;
  garantia_especifica?: string;
  kpi_principal?: string;
  tempo_meta_kpi?: string;
  o_que_entrego?: string;
  pitch?: boolean;
  bpmn?: boolean;
  playbook?: boolean;
  icp?: boolean;
  pricing?: boolean;
  certificacao?: boolean;
  pitch_url?: string;
  bpmn_url?: string;
  playbook_url?: string;
  icp_url?: string;
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
        dono: data.dono,
        description: data.description,
        descricao_card: data.descricao_card,
        escopo: data.escopo,
        duracao_media: data.duracao_media,
        time_envolvido: data.time_envolvido,
        formato_entrega: data.formato_entrega,
        descricao_completa: data.descricao_completa,
        para_quem_serve: data.para_quem_serve,
        como_entrega_valor: data.como_entrega_valor,
        entregaveis_relacionados: data.entregaveis_relacionados,
        stack_digital: data.stack_digital,
        bonus_kpi: data.bonus_kpi,
        garantia_especifica: data.garantia_especifica,
        kpi_principal: data.kpi_principal,
        tempo_meta_kpi: data.tempo_meta_kpi,
        o_que_entrego: data.o_que_entrego,
        pitch: data.pitch,
        bpmn: data.bpmn,
        playbook: data.playbook,
        icp: data.icp,
        pricing: data.pricing,
        certificacao: data.certificacao,
        pitch_url: data.pitch_url,
        bpmn_url: data.bpmn_url,
        playbook_url: data.playbook_url,
        icp_url: data.icp_url,
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
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">{/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{product.produto}</h1>
        </div>

        {/* Sumário da Página */}
        <ProductSummary productName={product.produto} />

        {/* Estrutura do Produto */}
        <section id="estrutura-produto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-bold text-foreground">Duração:</span>
                <p className="text-sm text-content">{product.duracao}</p>
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Dono:</span>
                <p className="text-sm text-content">{product.dono}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </section>

        {/* Visão Geral do Produto */}
        <section id="visao-geral">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Visão Geral do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descrição Completa */}
            {product.descricao_completa && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">📝 Descrição Completa</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {product.descricao_completa}
                  </div>
                </div>
              </div>
            )}

            {/* ICP - Destaque especial */}
            {product.description && (
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🎯 ICP (Ideal Customer Profile)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        </section>

        {/* Aspectos Técnicos */}
        <section id="aspectos-tecnicos">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">⚙️ Aspectos Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.escopo && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <span className="text-sm font-bold text-foreground block mb-2">Escopo:</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.escopo}
                  </div>
                </div>
              )}
              {product.formato_entrega && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <span className="text-sm font-bold text-foreground block mb-2">Formato de entrega:</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.formato_entrega}
                  </div>
                </div>
              )}
              {product.duracao_media && (
                <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-bold text-foreground block mb-2">⏳ Duração média:</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {product.duracao_media}
                  </div>
                </div>
              )}
              {product.time_envolvido && (
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-sm font-bold text-foreground block mb-2">👥 Time envolvido:</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {product.time_envolvido}
                  </div>
                </div>
              )}
              {product.stack_digital && (
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <span className="text-sm font-bold text-foreground block mb-2">💻 Stack digital:</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {product.stack_digital}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </section>

        {/* Informações para vender */}
        <section id="informacoes-vender">
        <Card>
          <CardHeader>
            <CardTitle>Informações para vender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-2">"Como eu vendo?"</h4>
              <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                <div className="text-content space-y-3 text-justify">
                  {product.como_vendo.split('\n').filter(line => line.trim()).map((line, index) => (
                    <p key={index} className="mb-0">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Use Case Map 1 */}
            <UseCaseMap 
              title="Use Case Map 1"
              data={{
                problema: '',
                persona: '',
                alternativa: '',
                why: '',
                frequencia: ''
              }}
              readOnly={true}
            />

            {/* Use Case Map 2 */}
            <UseCaseMap 
              title="Use Case Map 2"
              data={{
                problema: '',
                persona: '',
                alternativa: '',
                why: '',
                frequencia: ''
              }}
              readOnly={true}
            />
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-bold text-foreground mb-4">Metodologia SPICED</h4>
              <SpicedTable data={product.spiced_data} readOnly />
            </div>
          </CardContent>
        </Card>
        </section>

        {/* Posições Alocadas */}
        <section id="posicoes-alocadas">
        <ProductPositions 
          productId={product.id} 
          readOnly={true}
          initialMarkup={product.markup}
        />
        </section>

        {/* Informações para Operar */}
        <section id="informacoes-operar">
        <Card>
          <CardHeader>
            <CardTitle>Informações para Operar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.o_que_entrego && (
                <div>
                  <span className="text-sm font-bold text-foreground">"O que entrego"</span>
                  <div className="text-sm mt-2 text-content whitespace-pre-line leading-relaxed">{product.o_que_entrego}</div>
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
        </section>

        {/* Materiais de Treinamento e Documentos */}
        <section id="materiais-treinamentos">
        <TrainingMaterials productId={product.id} readOnly={true} />
        </section>

        {/* Materiais Antigos e Documentos (manter para compatibilidade) */}
        {(product.pitch_url || product.bpmn_url || product.playbook_url || product.pricing_url || product.certificacao_url || 
          product.case_1_name || product.case_2_name) && (
          <Card>
            <CardHeader>
              <CardTitle>Materiais complementares</CardTitle>
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
    </Layout>
  );
};

export default ProductDetails;