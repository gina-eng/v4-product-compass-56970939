import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";

const ProductPortfolio = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("Disponível");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        if (!data) {
          setProducts([]);
          return;
        }

        // Buscar posições para cada produto
        const productsWithMargin = await Promise.all(
          data.map(async (product) => {
            const { data: positions, error: positionsError } = await supabase
              .from('product_positions')
              .select(`
                *,
                positions (*)
              `)
              .eq('product_id', product.id);

            if (positionsError) {
              console.error('Error fetching positions:', positionsError);
            }

            // Calcular valores DRE
            let margemOperacional: number | string = "A definir";
            let faturamentoSemDesconto = 0;
            
            if (positions && positions.length > 0) {
              const markup = Number(product.markup) || 1;
              const markupOverhead = Number(product.markup_overhead) || 1;
              const categoria = product.categoria;

              // Classificação de overhead por categoria
              const overheadPositions = categoria === 'executar'
                ? ['Gerente de PE&G', 'Coordenador de PE&G', 'Account Manager']
                : ['Gerente de PE&G', 'Coordenador de PE&G'];

              // Totais CSP
              let totalCSPDireto = 0;
              let totalCSPOverhead = 0;

              positions.forEach((pp: any) => {
                const horas = Number(pp.horas_alocadas) || 0;
                const cph = Number(pp.positions?.cph) || 0;
                const nome = pp.positions?.nome || '';
                const csp = horas * cph;
                if (overheadPositions.includes(nome)) {
                  totalCSPOverhead += csp;
                } else {
                  totalCSPDireto += csp;
                }
              });

              const totalCSP = totalCSPDireto + totalCSPOverhead;

              if (totalCSP > 0) {
                // Faturamento Ancoragem (Mesma regra da tela de posições)
                faturamentoSemDesconto = categoria === 'executar'
                  ? (totalCSPDireto * markup) + (totalCSPOverhead * markupOverhead)
                  : (totalCSPDireto + totalCSPOverhead) * markup;
                
                // Cálculo simplificado de margem (mantido como antes)
                const descontoPagamento = faturamentoSemDesconto * 0.17;
                const descontoCupom = faturamentoSemDesconto * 0.20;
                const faturamentoComDesconto = faturamentoSemDesconto - descontoPagamento - descontoCupom;
                const royalties = faturamentoComDesconto * 0.17;
                const taxaTransicao = faturamentoComDesconto * 0.03;
                const taxaAntecipacao = faturamentoComDesconto * 0.10;
                const receitaBruta = faturamentoComDesconto - royalties - taxaTransicao - taxaAntecipacao;
                const impostosReceita = receitaBruta * 0.074;
                const receitaLiquida = receitaBruta - impostosReceita;
                const custosDiretos = totalCSPDireto + totalCSPOverhead;
                const margemOperacionalValor = receitaLiquida - custosDiretos;
                
                margemOperacional = receitaLiquida > 0 ? (margemOperacionalValor / receitaLiquida) * 100 : 0;
              }
            }

            const productData = {
              id: product.id,
              name: product.produto,
              description: product.descricao_card && product.descricao_card.trim() ? product.descricao_card.trim() : "",
              category: product.categoria,
              status: product.status,
              valorBase: faturamentoSemDesconto > 0 ? faturamentoSemDesconto.toString() : "A definir",
              margemOperacional: margemOperacional
            };
            
            console.log('Produto processado:', {
              id: product.id,
              nome: product.produto,
              descricao_card_original: product.descricao_card,
              descricao_final: productData.description,
              tem_descricao: !!productData.description
            });

            return productData;
          })
        );
        
        setProducts(productsWithMargin);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filters = [
    { key: "all", label: "Todos", color: "default" },
    { key: "saber", label: "SABER", color: "saber" },
    { key: "ter", label: "TER", color: "ter" },
    { key: "executar", label: "EXECUTAR", color: "executar" },
    { key: "potencializar", label: "POTENCIALIZAR", color: "potencializar" }
  ];

  const statusFilters = [
    { key: "all", label: "Todos os Status", color: "default" },
    { key: "Disponível", label: "Disponível", color: "default" },
    { key: "Em produção", label: "Em Produção", color: "secondary" }
  ];

  const filteredProducts = products
    .filter(product => statusFilter === "all" || product.status === statusFilter)
    .filter(product => activeFilter === "all" || product.category === activeFilter);

  const handleViewDetails = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Portfólio de Produtos e Serviços V4</h2>
          
          {/* Filtros lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Filtros por Categoria */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Filtrar por Categoria</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {filters.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={activeFilter === filter.key ? filter.color as any : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.key)}
                    className="transition-all duration-200"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros por Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Filtrar por Status</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={statusFilter === filter.key ? filter.color as any : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter.key)}
                    className="transition-all duration-200"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground">Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                produto={product.name}
                description={product.description}
                categoria={product.category}
                status={product.status}
                valor={product.valorBase}
                margemOperacional={product.margemOperacional}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground">Nenhum produto encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductPortfolio;