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
        icp: typeof data.icp === 'string' ? data.icp : undefined, // Nova coluna text
        escopo: data.escopo, // Nova coluna text
        duracao_media: data.duracao_media, // Nova coluna text
        time_envolvido: data.time_envolvido, // Nova coluna text
        formato_entrega: data.formato_entrega, // Nova coluna text
        descricao_completa: data.descricao_completa, // Nova coluna text
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
                <span className="text-sm font-medium text-muted-foreground">Título:</span>
                <p className="font-medium">{product.produto}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
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
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <Badge 
                  variant={getStatusBadge(product.status).variant}
                  className={`ml-2 ${getStatusBadge(product.status).className}`}
                >
                  {product.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Valor Base:</span>
                <p className="font-medium">
                  {product.valor === "A definir" ? product.valor : formatCurrency(product.valor)}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Duração:</span>
              <p className="text-sm">{product.duracao}</p>
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
              {product.icp && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">ICP:</span>
                  <p className="text-sm">{product.icp}</p>
                </div>
              )}
              {product.escopo && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">ESCOPO:</span>
                  <p className="text-sm">{product.escopo}</p>
                </div>
              )}
              {product.duracao_media && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">DURAÇÃO MÉDIA:</span>
                  <p className="text-sm">{product.duracao_media}</p>
                </div>
              )}
              {product.time_envolvido && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">TIME ENVOLVIDO:</span>
                  <p className="text-sm">{product.time_envolvido}</p>
                </div>
              )}
            </div>
            {product.formato_entrega && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">FORMATO DE ENTREGA:</span>
                <p className="text-sm">{product.formato_entrega}</p>
              </div>
            )}
            {product.descricao_completa && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Descrição completa do produto:</span>
                <p className="text-sm text-justify leading-relaxed">{product.descricao_completa}</p>
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
              <h4 className="text-sm font-medium text-muted-foreground mb-2">"Como eu vendo?"</h4>
              <div className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                {product.como_vendo.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0 text-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-4">Metodologia SPICED</h4>
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
                <span className="text-sm font-medium text-muted-foreground">"Como eu entrego?"</span>
                <p className="text-sm mt-2">{product.description}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-4">Etapas de Entrega</h4>
                <ComoEntregoTable 
                  data={product.como_entrego_dados || []} 
                  readOnly={true}
                  positions={positions}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;