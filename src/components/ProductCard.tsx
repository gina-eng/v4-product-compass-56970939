import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  category: "saber" | "ter" | "executar" | "potencializar";
  valorBase: string;
  status: "Disponível" | "Em produção" | "Em homologação";
  margemOperacional?: number;
  onViewDetails: (id: string) => void;
}

const ProductCard = ({ id, name, description, category, valorBase, status, margemOperacional, onViewDetails }: ProductCardProps) => {
  const categoryLabels = {
    saber: "SABER",
    ter: "TER", 
    executar: "EXECUTAR",
    potencializar: "POTENCIALIZAR"
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Disponível": { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Em produção": { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      "Em homologação": { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="mb-4 flex items-center justify-between">
        <div 
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white`}
          style={{backgroundColor: `hsl(var(--${category}))`}}
        >
          {categoryLabels[category]}
        </div>
        <Badge 
          variant={getStatusBadge(status).variant}
          className={getStatusBadge(status).className}
        >
          {status}
        </Badge>
      </div>
      
      <h3 className="text-lg font-semibold mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
        {name}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 text-justify">
        {description}
      </p>
      
      <div className="mb-6 space-y-2">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Valor Base</span>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(valorBase)}</p>
        </div>
        {margemOperacional !== undefined && margemOperacional > 0 && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Margem Operacional</span>
            <p className="text-sm font-medium text-green-700">{margemOperacional.toFixed(2)}%</p>
          </div>
        )}
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