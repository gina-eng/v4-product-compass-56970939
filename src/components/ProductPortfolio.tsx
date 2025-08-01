import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

const ProductPortfolio = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const products = [
    {
      id: "1",
      name: "Diagnóstico de Mídia Paga (Meta e Google Ads)",
      description: "Diagnóstico estratégico de performance em mídia paga para negócios que investem de forma consistente e desejam maximizar resultados.",
      category: "saber" as const
    },
    {
      id: "2", 
      name: "Implementação de E-commerce",
      description: "Diagnóstico estratégico de performance em mídia paga para negócios que investem de forma consistente e desejam maximizar resultados.",
      category: "ter" as const
    },
    {
      id: "3",
      name: "Profissional de Google Ads",
      description: "Diagnóstico estratégico de performance em mídia paga para negócios que investem de forma consistente e desejam maximizar resultados.",
      category: "executar" as const
    },
    {
      id: "4",
      name: "Consultoria Estratégica Avançada",
      description: "Análise profunda e estratégias personalizadas para empresas que buscam crescimento exponencial e resultados extraordinários.",
      category: "potencializar" as const
    },
    {
      id: "5",
      name: "Auditoria de Marketing Digital",
      description: "Avaliação completa da presença digital da empresa, identificando oportunidades de melhoria e gaps estratégicos.",
      category: "saber" as const
    },
    {
      id: "6",
      name: "Plataforma de Automação de Vendas", 
      description: "Sistema completo de CRM e automação para estruturar e otimizar o processo comercial da empresa.",
      category: "ter" as const
    }
  ];

  const filters = [
    { key: "all", label: "Todos", color: "default" },
    { key: "saber", label: "SABER", color: "saber" },
    { key: "ter", label: "TER", color: "ter" },
    { key: "executar", label: "EXECUTAR", color: "executar" },
    { key: "potencializar", label: "POTENCIALIZAR", color: "potencializar" }
  ];

  const filteredProducts = activeFilter === "all" 
    ? products 
    : products.filter(product => product.category === activeFilter);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              category={product.category}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductPortfolio;