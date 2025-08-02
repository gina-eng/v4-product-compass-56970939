import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";

const ProductPortfolio = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");
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

        const formattedProducts = data?.map(product => ({
          id: product.id,
          name: product.produto,
          description: product.description,
          category: product.categoria,
          status: product.status,
          valorBase: product.valor
        })) || [];
        
        setProducts(formattedProducts);
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

  const filteredProducts = products
    .filter(product => product.status === "Disponível")
    .filter(product => activeFilter === "all" || product.category === activeFilter);

  const handleViewDetails = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Portfólio de Produtos</h2>
          
          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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

        {/* Grid de Produtos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                category={product.category}
                valorBase={product.valorBase}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductPortfolio;