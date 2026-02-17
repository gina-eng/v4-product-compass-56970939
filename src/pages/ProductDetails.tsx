import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingStates";
import SpicedTable from "@/components/SpicedTable";
import ComoEntregoTable from "@/components/ComoEntregoTable";
import ProductPositions from "@/components/ProductPositions";
import TrainingMaterials from "@/components/TrainingMaterials";
import SalesMaterials from "@/components/SalesMaterials";
import OperationalMaterials from "@/components/OperationalMaterials";
import TrainingMaterialsOnly from "@/components/TrainingMaterialsOnly";
import UseCaseMap from "@/components/UseCaseMap";
import ProductSummary from "@/components/ProductSummary";
import { formatCurrency } from "@/lib/formatters";
import { calculateFaturamentoAncoragem } from "@/lib/productCalculations";

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
  o_que_entrego?: string;
  pitch?: boolean;
  bpmn?: boolean;
  playbook?: boolean;
  icp?: boolean;
  pricing?: boolean;
  certificacao?: boolean;
  como_vendo: string;
  spiced_data: any;
  spiced_data_2: any;
  como_entrego_dados: any[];
  markup?: number;
  use_case_map_1_name?: string;
  use_case_map_1_data?: any;
  use_case_map_2_name?: string;
  use_case_map_2_data?: any;
}

interface Position {
  id: string;
  nome: string;
  cph: number;
  investimento_total: number;
}

const ProductDetails = () => {
  console.log('>>> ProductDetails START <<<');
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('>>> ProductDetails - slug:', slug, 'location:', location);
  console.log('>>> ProductDetails - location.state:', location.state);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [valorCalculado, setValorCalculado] = useState<string>("A definir");
  
  console.log('>>> ProductDetails - useState initialized. Loading:', loading);

  useEffect(() => {
    fetchProduct();
    fetchPositions();
  }, [slug, location.state]);

  const fetchProduct = async () => {
    console.log('fetchProduct called with slug:', slug, 'location.state:', location.state);
    
    // Primeiro tenta pegar o ID do state (quando vem da navegação)
    const productId = location.state?.productId;
    
    if (productId) {
      console.log('Using productId from state:', productId);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No product found with ID:', productId);
          setLoading(false);
          return;
        }
        console.log('Product found by ID:', data);
        console.log('Mapped product:', data);
        
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
          o_que_entrego: data.o_que_entrego,
          pitch: data.pitch,
          bpmn: data.bpmn,
          playbook: data.playbook,
          icp: data.icp,
          pricing: data.pricing,
          certificacao: data.certificacao,
          como_vendo: data.como_vendo,
          spiced_data: data.spiced_data,
          spiced_data_2: data.spiced_data_2,
          como_entrego_dados: Array.isArray(data.como_entrego_dados) ? data.como_entrego_dados : [],
          markup: data.markup,
          use_case_map_1_name: data.use_case_map_1_name,
          use_case_map_1_data: data.use_case_map_1_data,
          use_case_map_2_name: data.use_case_map_2_name,
          use_case_map_2_data: data.use_case_map_2_data
        };
        
        // Atualizar o valor do produto no banco se necessário
        const valorCalculado = await calculateFaturamentoAncoragem(data.id);
        if (valorCalculado > 0 && data.valor !== valorCalculado.toFixed(2)) {
          await supabase
            .from('products')
            .update({ valor: valorCalculado.toFixed(2) })
            .eq('id', data.id);
            
          // Atualizar o produto mapeado com o novo valor
          mappedProduct.valor = valorCalculado.toFixed(2);
        }
        
        setProduct(mappedProduct);
        setValorCalculado(valorCalculado > 0 ? valorCalculado.toString() : "A definir");
        setLoading(false); // CRÍTICO: definir loading como false após sucesso
        return;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      setLoading(false);
    }
    }
    
    // Se não tem ID no state, tenta buscar pelo slug
    if (!slug) {
      console.log('No slug provided');
      setLoading(false);
      return;
    }
    
    console.log('Searching by slug:', slug);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      console.log('All products fetched for slug search:', data.length);
      
      // Buscar produto que corresponde ao slug
      const foundProduct = data.find(p => {
        const productSlug = p.produto
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        console.log('Comparing slug:', productSlug, 'with:', slug, 'for product:', p.produto);
        return productSlug === slug;
      });
      
      console.log('Found product:', foundProduct);
      if (foundProduct) {
        // Mapear os dados para a nova interface
        const mappedProduct: Product = {
          id: foundProduct.id,
          produto: foundProduct.produto,
          categoria: foundProduct.categoria,
          status: foundProduct.status,
          valor: foundProduct.valor,
          duracao: foundProduct.duracao,
          dono: foundProduct.dono,
          description: foundProduct.description,
          descricao_card: foundProduct.descricao_card,
          escopo: foundProduct.escopo,
          duracao_media: foundProduct.duracao_media,
          time_envolvido: foundProduct.time_envolvido,
          formato_entrega: foundProduct.formato_entrega,
          descricao_completa: foundProduct.descricao_completa,
          para_quem_serve: foundProduct.para_quem_serve,
          como_entrega_valor: foundProduct.como_entrega_valor,
          entregaveis_relacionados: foundProduct.entregaveis_relacionados,
          o_que_entrego: foundProduct.o_que_entrego,
          pitch: foundProduct.pitch,
          bpmn: foundProduct.bpmn,
          playbook: foundProduct.playbook,
          icp: foundProduct.icp,
          pricing: foundProduct.pricing,
          certificacao: foundProduct.certificacao,
          como_vendo: foundProduct.como_vendo,
          spiced_data: foundProduct.spiced_data,
          spiced_data_2: foundProduct.spiced_data_2,
          como_entrego_dados: Array.isArray(foundProduct.como_entrego_dados) ? foundProduct.como_entrego_dados : [],
          markup: foundProduct.markup,
          use_case_map_1_name: foundProduct.use_case_map_1_name,
          use_case_map_1_data: foundProduct.use_case_map_1_data,
          use_case_map_2_name: foundProduct.use_case_map_2_name,
          use_case_map_2_data: foundProduct.use_case_map_2_data
        };
        
        // Atualizar o valor do produto no banco se necessário
        const valorCalculado = await calculateFaturamentoAncoragem(foundProduct.id);
        if (valorCalculado > 0 && foundProduct.valor !== valorCalculado.toFixed(2)) {
          await supabase
            .from('products')
            .update({ valor: valorCalculado.toFixed(2) })
            .eq('id', foundProduct.id);
            
          // Atualizar o produto mapeado com o novo valor
          mappedProduct.valor = valorCalculado.toFixed(2);
        }
        
        setProduct(mappedProduct);
        console.log('Product state set:', mappedProduct);
        setValorCalculado(valorCalculado > 0 ? valorCalculado.toString() : "A definir");
        setLoading(false); // Importante: sempre definir loading como false aqui
        return; // Importante: sair da função após sucesso
      } else {
        throw new Error('Produto não encontrado');
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error);
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
      destrava_receita: "hsl(var(--primary))",
      saber: "hsl(var(--saber))",
      ter: "hsl(var(--ter))", 
      executar: "hsl(var(--executar))",
      potencializar: "hsl(var(--potencializar))"
    };
    return colors[category as keyof typeof colors] || "hsl(var(--primary))";
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      destrava_receita: "DESTRAVA RECEITA",
      saber: "SABER",
      ter: "TER",
      executar: "EXECUTAR",
      potencializar: "POTENCIALIZAR",
    };

    return labels[category as keyof typeof labels] || category.replace(/_/g, " ").toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Em produção": { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      "Em homologação": { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  console.log('Render - loading:', loading, 'product:', product);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    console.log('Rendering product not found state');
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
      <div className="spacing-section animate-fade-in">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-title-main">{product.produto}</h1>
        </div>

        {/* Layout com Sumário ao lado da primeira seção */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Coluna da esquerda - Sumário */}
          <div className="lg:col-span-1">
            <ProductSummary productName={product.produto} />
          </div>

          {/* Coluna da direita - Estrutura do Produto */}
          <div className="lg:col-span-3">
            <section id="estrutura-produto">
              <Card>
                <CardContent className="p-6 pt-8">
                  <div className="spacing-card">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-label">Título:</span>
                        <p className="text-body">{product.produto}</p>
                      </div>
                      <div>
                        <span className="text-label">Categoria:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className="text-body-small font-medium px-3 py-1"
                            style={{backgroundColor: getCategoryColor(product.categoria), color: 'white'}}
                          >
                            {getCategoryLabel(product.categoria)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-label">Status:</span>
                        <Badge 
                          variant={getStatusBadge(product.status).variant}
                          className={`ml-2 ${getStatusBadge(product.status).className}`}
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-label">Valor Base:</span>
                        <p className="text-body">
                          {valorCalculado === "A definir" ? valorCalculado : formatCurrency(valorCalculado)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-label">Duração:</span>
                        <p className="text-body">{product.duracao}</p>
                      </div>
                      <div>
                        <span className="text-label">PMM Responsável:</span>
                        <p className="text-body">{product.dono}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* Restante do conteúdo em largura total */}
        <div className="spacing-section">
        {/* Visão Geral do Produto */}
        <section id="visao-geral">
        <Card>
          <CardHeader>
            <CardTitle className="text-title-section">Visão Geral do Produto</CardTitle>
          </CardHeader>
          <CardContent className="spacing-card">
            {/* Descrição Completa */}
            {product.descricao_completa && (
              <div className="spacing-card">
                <h3 className="text-title-card border-b pb-2">📝 Descrição Completa</h3>
                <div className="container-section">
                  <div className="text-body leading-relaxed text-justify">
                    {product.descricao_completa}
                  </div>
                </div>
              </div>
            )}

            {/* ICP - Destaque especial */}
            {product.description && (
              <Card className="container-highlight">
                <CardHeader className="pb-3">
                  <CardTitle className="text-title-sub flex items-center gap-2">
                    🎯 ICP (Ideal Customer Profile)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-body leading-relaxed">
                    {product.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campos estratégicos da visão geral */}
            {(product.para_quem_serve || product.como_entrega_valor) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.para_quem_serve && (
                  <div className="container-section">
                    <h4 className="text-title-sub mb-3">Para quem serve</h4>
                    <div className="text-body spacing-tight text-justify">
                      {product.para_quem_serve
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((line, index) => (
                          <p key={index} className="mb-0">
                            {line.trim()}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                {product.como_entrega_valor && (
                  <div className="container-section">
                    <h4 className="text-title-sub mb-3">Como entregar valor</h4>
                    <div className="text-body spacing-tight text-justify">
                      {product.como_entrega_valor
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((line, index) => (
                          <p key={index} className="mb-0">
                            {line.trim()}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </section>

        {/* Aspectos Técnicos */}
        <section id="aspectos-tecnicos">
        <Card>
          <CardHeader>
            <CardTitle className="text-title-section">⚙️ Aspectos Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="spacing-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.escopo && (
                <div className="container-section">
                  <span className="text-label block mb-2">Escopo:</span>
                  <div className="text-body leading-relaxed">
                    {product.escopo}
                  </div>
                </div>
              )}
              {product.formato_entrega && (
                <div className="container-section">
                  <span className="text-label block mb-2">Formato de entrega:</span>
                  <div className="text-body leading-relaxed">
                    {product.formato_entrega}
                  </div>
                </div>
              )}
              {product.duracao_media && (
                <div className="container-section border border-slate-200 dark:border-slate-800">
                  <span className="text-label block mb-2">⏳ Duração média:</span>
                  <div className="text-body">
                    {product.duracao_media}
                  </div>
                </div>
              )}
              {product.time_envolvido && (
                <div className="container-section border border-green-200 dark:border-green-800">
                  <span className="text-label block mb-2">👥 Time envolvido:</span>
                  <div className="text-body">
                    {product.time_envolvido}
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
            <CardTitle className="text-title-section">Informações para vender</CardTitle>
          </CardHeader>
          <CardContent className="spacing-card">
            <div>
              <h4 className="text-title-sub mb-3">"Como eu vendo?"</h4>
              <div className="container-section">
                <div className="text-body spacing-tight text-justify">
                  {product.como_vendo.split('\n').filter(line => line.trim()).map((line, index) => (
                    <p key={index} className="mb-0">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Use Case Map 1 com SPICED 1 - Colapsível */}
            {product.use_case_map_1_data && (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                    <span className="text-title-card">{product.use_case_map_1_name || "Use Case Map 1"} e SPICED</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6">
                  <div className="container-section">
                    <UseCaseMap 
                      title={product.use_case_map_1_name || "Use Case Map 1"}
                      data={product.use_case_map_1_data || {
                        problema: '',
                        persona: '',
                        alternativa: '',
                        why: '',
                        frequencia: ''
                      }}
                      readOnly={true}
                    />
                    <div className="mt-6">
                      <h4 className="text-title-card mb-4">SPICED para {product.use_case_map_1_name || "Use Case Map 1"}</h4>
                      <SpicedTable data={product.spiced_data} readOnly />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Use Case Map 2 com SPICED 2 - Colapsível */}
            {product.use_case_map_2_data && (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                    <span className="text-title-card">{product.use_case_map_2_name || "Use Case Map 2"} e SPICED</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6">
                  <div className="container-section">
                    <UseCaseMap 
                      title={product.use_case_map_2_name || "Use Case Map 2"}
                      data={product.use_case_map_2_data || {
                        problema: '',
                        persona: '',
                        alternativa: '',
                        why: '',
                        frequencia: ''
                      }}
                      readOnly={true}
                    />
                    <div className="mt-6">
                      <h4 className="text-title-card mb-4">SPICED para {product.use_case_map_2_name || "Use Case Map 2"}</h4>
                      <SpicedTable data={product.spiced_data_2 || {}} readOnly />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Materiais de Vendas integrados */}
            <div className="mt-6">
              <h4 className="text-title-card mb-4">Materiais de Vendas</h4>
              <SalesMaterials productId={product.id} readOnly={true} />
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
        <OperationalMaterials 
          productId={product.id} 
          readOnly={true}
          productData={{
            o_que_entrego: product.o_que_entrego,
            como_entrego_dados: product.como_entrego_dados
          }}
          positions={positions}
        />
        </section>

        {/* Materiais de Treinamento */}
        <section id="materiais-treinamentos">
        <TrainingMaterialsOnly productId={product.id} readOnly={true} />
        </section>

        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
