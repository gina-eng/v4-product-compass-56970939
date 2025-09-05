import { Layout } from "@/components/Layout";
import StepIntroduction from "@/components/StepIntroduction"; 
import ProductPortfolio from "@/components/ProductPortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout showHeader={true}>
      <div className="space-y-8 animate-fade-in">
        <StepIntroduction />
        
        <Card>
          <CardHeader>
            <CardTitle>Páginas de Teste e Validação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/nova-estrutura")}
              className="w-full justify-start"
              variant="outline"
            >
              🧪 Testar Estrutura de Produto
            </Button>
            <Button 
              onClick={() => navigate("/teste-posicoes")}
              className="w-full justify-start"
              variant="outline"
            >
              📊 Testar Nova Estrutura de Posições e DRE
            </Button>
          </CardContent>
        </Card>
        
        <ProductPortfolio />
      </div>
    </Layout>
  );
};

export default Index;
