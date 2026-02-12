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
      const shouldShow = scrollTop > 0; // Aparece ao iniciar a rolagem
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

  // Sidebar Summary (always visible in sidebar)
  const SidebarSummary = () => (
    <div className="p-4 bg-muted/50 rounded-lg">
      <h2 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
        📋 Sumário da Página
      </h2>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="w-full text-left text-sm text-foreground hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline block py-1"
          >
            {index + 1}. {section.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Sticky Summary (appears when scrolling)
  const StickySummary = () => (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 bg-background border-b shadow-md transition-all duration-500 ease-out",
        isSticky ? "top-0 translate-y-0 opacity-100" : "top-0 -translate-y-full opacity-0"
      )}
      style={{ margin: 0, padding: 0 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            📋 {productName} - Navegação
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
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
      <SidebarSummary />
      <StickySummary />
    </>
  );
};

export default ProductSummary;
