import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";

interface ProductCardProps {
  id: string;
  produto: string;
  categoria: "saber" | "ter" | "executar" | "potencializar";
  valor: string;
  status: "Disponível" | "Em produção" | "Em homologação";
  description?: string;
  descricao_card?: string;
  margemOperacional?: number | string;
}

const ProductCard = ({ 
  id, 
  produto, 
  categoria, 
  valor, 
  status, 
  description, 
  descricao_card,
  margemOperacional 
}: ProductCardProps) => {
  const navigate = useNavigate();

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
      "Disponível": { variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      "Em produção": { variant: "secondary" as const, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      "Em homologação": { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig["Disponível"];
  };

  const handleViewDetails = () => {
    navigate(`/produto/${id}`);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden card-hover animate-scale-in group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {produto}
          </CardTitle>
          <Badge 
            variant={getStatusBadge(status).variant}
            className={getStatusBadge(status).className}
          >
            {status}
          </Badge>
        </div>
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white w-fit shadow-sm"
          style={{backgroundColor: getCategoryColor(categoria)}}
        >
          {categoria.toUpperCase()}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {(descricao_card || description) && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {descricao_card || description}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Valor:</span>
            <span className="font-bold text-primary">
              {valor === "A definir" ? valor : formatCurrency(valor)}
            </span>
          </div>
          
          {margemOperacional !== undefined && margemOperacional !== "A definir" && (
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">Margem:</span>
              <span className="font-bold text-green-600">
                {typeof margemOperacional === 'number' 
                  ? `${margemOperacional.toFixed(1)}%`
                  : margemOperacional
                }
              </span>
            </div>
          )}
          
          <Button 
            className="w-full mt-4 hover-scale group-hover:shadow-md transition-all duration-200" 
            onClick={handleViewDetails}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;