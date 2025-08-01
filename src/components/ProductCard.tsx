import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  category: "saber" | "ter" | "executar" | "potencializar";
  valorBase: string;
  onViewDetails: (id: string) => void;
}

const ProductCard = ({ id, name, description, category, valorBase, onViewDetails }: ProductCardProps) => {
  const categoryLabels = {
    saber: "SABER",
    ter: "TER", 
    executar: "EXECUTAR",
    potencializar: "POTENCIALIZAR"
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="mb-4">
        <div 
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4`}
          style={{backgroundColor: `hsl(var(--${category}))`}}
        >
          {categoryLabels[category]}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
        {name}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
        {description}
      </p>
      
      <div className="mb-6">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Valor Base</span>
        <p className="text-lg font-semibold text-gray-900">{valorBase}</p>
      </div>
      
      <Button 
        variant="details" 
        className="w-full justify-between group-hover:border-gray-300 transition-colors"
        onClick={() => onViewDetails(id)}
      >
        Ver detalhes
        <ChevronDown className="h-4 w-4" />
      </Button>
    </Card>
  );
};

export default ProductCard;