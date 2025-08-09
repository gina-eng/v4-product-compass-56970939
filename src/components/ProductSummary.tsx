import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductSummaryProps {
  productName: string;
}

const ProductSummary = ({ productName }: ProductSummaryProps) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldShow = scrollTop > 500; // Aparece após 500px
      setIsSticky(shouldShow);
    };

    // Verificar posição inicial
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'estrutura-produto', label: 'Estrutura do Produto' },
    { id: 'visao-geral', label: 'Visão Geral' },
    { id: 'aspectos-tecnicos', label: 'Aspectos Técnicos' },
    { id: 'informacoes-vender', label: 'Informações para Vender' },
    { id: 'informacoes-operar', label: 'Informações para Operar' },
    { id: 'posicoes-alocadas', label: 'Posições Alocadas' },
    { id: 'materiais-treinamentos', label: 'Materiais de Treinamentos' },
  ];

  // Top Summary (always visible)
  const TopSummary = () => (
    <Card className="mb-8 bg-gradient-to-r from-background to-muted/30">
      <CardContent className="pt-6 pb-6">
        <h2 className="text-xl font-bold mb-5 text-foreground flex items-center gap-2">
          📋 Sumário da Página
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer group text-left"
            >
              <span className="font-mono text-primary bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {section.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Sticky Summary (appears when scrolling)
  const StickySummary = () => (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-b shadow-md transition-transform duration-300 m-0 p-0",
        isSticky ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            📋 {productName} - Navegação
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sections.map((section, index) => (
            <Button
              key={section.id}
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(section.id)}
              className="justify-start text-sm h-10 hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <span className="font-mono mr-2 text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {index + 1}
              </span>
              <span className="truncate">{section.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TopSummary />
      <StickySummary />
    </>
  );
};

export default ProductSummary;