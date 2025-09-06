import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProductPortfolio = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("Disponível");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Nível de dedicação por produto (objeto com productId como chave)
  const [niveisDedicacao, setNiveisDedicacao] = useState<{[key: string]: number}>({});

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

        // Inicializar níveis de dedicação apenas se estiver vazio
        setNiveisDedicacao(prev => {
          const newDedicacao = { ...prev };
          data.forEach(product => {
            if (product.usa_dedicacao && !newDedicacao[product.id]) {
              newDedicacao[product.id] = 1; // 100% por padrão
            }
          });
          return newDedicacao;
        });

        // Calcular produtos com margem
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
              const nivelDedicacao = niveisDedicacao[product.id] || 1;

              // Classificação de overhead por categoria
              const overheadPositions = categoria === 'executar'
                ? ['Gerente de PE&G', 'Coordenador de PE&G', 'Account Manager']
                : ['Gerente de PE&G', 'Coordenador de PE&G'];

              // Função para calcular CSP com dedicação
              const calculateCSP = (cph: number, horasAlocadas: number) => {
                const horasEfetivas = (categoria === 'executar' && product.usa_dedicacao) 
                  ? horasAlocadas * nivelDedicacao 
                  : horasAlocadas;
                return horasEfetivas * cph;
              };

              // Totais CSP
              let totalCSPDireto = 0;
              let totalCSPOverhead = 0;

              positions.forEach((pp: any) => {
                const horas = Number(pp.horas_alocadas) || 0;
                const cph = Number(pp.positions?.cph) || 0;
                const nome = pp.positions?.nome || '';
                const csp = calculateCSP(cph, horas);
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
                
                // Cálculo DRE correto - TODOS os descontos sobre Faturamento Ancoragem
                // Aplicar apenas os descontos principais que normalmente estão ativos
                const descontoPagamento = faturamentoSemDesconto * 0.11;  // 11% sempre aplicado
                const descontoCupom = faturamentoSemDesconto * 0.20;       // 20% sempre aplicado
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
              margemOperacional: margemOperacional,
              usaDedicacao: product.usa_dedicacao || false
            };
            
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

  // UseEffect separado para recalcular quando a dedicação muda
  useEffect(() => {
    if (products.length > 0) {
      const recalculateProducts = async () => {
        const updatedProducts = await Promise.all(
          products.map(async (product) => {
            if (!product.usaDedicacao || product.category !== 'executar') {
              return product; // Não recalcula se não usa dedicação ou não é EXECUTAR
            }

            const { data: positions } = await supabase
              .from('product_positions')
              .select(`
                *,
                positions (*)
              `)
              .eq('product_id', product.id);

            if (!positions || positions.length === 0) {
              return product;
            }

            const { data: productData } = await supabase
              .from('products')
              .select('markup, markup_overhead')
              .eq('id', product.id)
              .single();

            const markup = Number(productData?.markup) || 1;
            const markupOverhead = Number(productData?.markup_overhead) || 1;
            const nivelDedicacao = niveisDedicacao[product.id] || 1;

            // Recalcular apenas o valor base com a nova dedicação
            const overheadPositions = ['Gerente de PE&G', 'Coordenador de PE&G', 'Account Manager'];
            
            let totalCSPDireto = 0;
            let totalCSPOverhead = 0;

            positions.forEach((pp: any) => {
              const horas = Number(pp.horas_alocadas) || 0;
              const cph = Number(pp.positions?.cph) || 0;
              const nome = pp.positions?.nome || '';
              const horasEfetivas = horas * nivelDedicacao;
              const csp = horasEfetivas * cph;
              
              if (overheadPositions.includes(nome)) {
                totalCSPOverhead += csp;
              } else {
                totalCSPDireto += csp;
              }
            });

            const faturamentoSemDesconto = (totalCSPDireto * markup) + (totalCSPOverhead * markupOverhead);

            return {
              ...product,
              valorBase: faturamentoSemDesconto > 0 ? faturamentoSemDesconto.toString() : "A definir"
            };
          })
        );
        
        setProducts(updatedProducts);
      };

      recalculateProducts();
    }
  }, [niveisDedicacao]);

  const handleDedicacaoChange = (productId: string, nivel: number) => {
    setNiveisDedicacao(prev => ({
      ...prev,
      [productId]: nivel
    }));
  };

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
                usaDedicacao={product.usaDedicacao}
                nivelDedicacao={niveisDedicacao[product.id] || 1}
                onDedicacaoChange={handleDedicacaoChange}
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