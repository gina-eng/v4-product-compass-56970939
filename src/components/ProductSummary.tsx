import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSummaryProps {
  productName: string;
}

const ProductSummary = ({ productName }: ProductSummaryProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsExpanded(false);
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
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 text-foreground">Sumário da Página</h2>
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-3">
              <span className="text-muted-foreground font-mono text-sm min-w-[2rem]">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <button
                onClick={() => scrollToSection(section.id)}
                className="text-left hover:text-primary transition-colors duration-200 text-base font-medium cursor-pointer"
              >
                {section.label}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Sticky Summary (appears when scrolling)
  const StickySummary = () => (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-transform duration-300",
        isSticky ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-sm truncate">{productName}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              <Menu className="h-4 w-4 mr-1" />
              Sumário
              <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-2 pb-2 border-t pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(section.id)}
                  className="justify-start text-xs h-7"
                >
                  {section.label}
                </Button>
              ))}
            </div>
          </div>
        )}
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