import { Layout } from "@/components/Layout";
import StepIntroduction from "@/components/StepIntroduction"; 
import ProductPortfolio from "@/components/ProductPortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout showHeader={true}>
      <div className="space-y-8 animate-fade-in">
        <StepIntroduction />
        
        {/* Card para Nova Precificação */}
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Nova Estrutura de Precificação</CardTitle>
                    <p className="text-muted-foreground">
                      Visualize a nova estrutura com suporte a valores one-time e recorrentes
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  NOVO
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Configuração flexível para pagamentos únicos e recorrentes</li>
                    <li>• Campo ilustrativo que não afeta a DRE</li>
                    <li>• Comparação visual entre diferentes modalidades</li>
                    <li>• Compatível com a estrutura atual de produtos</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => navigate('/nova-precificacao')}
                    className="flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    Estrutura de Preços
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/produto-novo/1')}
                    variant="outline"
                    className="flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    Página de Produto
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ProductPortfolio />
      </div>
    </Layout>
  );
};

export default Index;
