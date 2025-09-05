import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductPositions from "@/components/ProductPositions";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestPositions = () => {
  const navigate = useNavigate();

  // ID de um produto existente para teste (usando um UUID fictício)
  const testProductId = "550e8400-e29b-41d4-a716-446655440000";

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Teste - Nova Estrutura de Posições</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">
            Visualização das Mudanças na Estrutura DRE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Principais Alterações:</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Markup Direto:</strong> Aplica-se a todas as posições exceto "Gerente de PE&G" e "Coordenador de PE&G"</li>
              <li><strong>Markup Overhead:</strong> Novo campo que aplica-se apenas ao "Gerente de PE&G" e "Coordenador de PE&G"</li>
              <li><strong>Campo "(-) Outros":</strong> Substitui "(-) Auxílio" e é editável no banco de dados</li>
              <li><strong>Nova estrutura DRE:</strong></li>
              <ul className="list-disc pl-6 space-y-1">
                <li>Faturamento Ancoragem (CSP direto + CSP Overhead × markup)</li>
                <li>Desconto de pagamento alterado para -11%</li>
                <li>Faturamento Médio (Ancoragem - desconto de pagamento)</li>
                <li>Novo: Desconto de Comprometimento (-6%)</li>
                <li>Faturamento mínimo</li>
                <li>CSP separado em Direto e Overhead nos custos</li>
              </ul>
            </ul>
          </div>
        </CardContent>
      </Card>

      <ProductPositions 
        productId={testProductId}
        readOnly={false}
        initialMarkup={1.5}
        initialMarkupOverhead={1.2}
        initialOutros={100}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Próximos Passos</h3>
              <p className="text-muted-foreground">
                Após validar a estrutura, as mudanças serão aplicadas ao sistema completo.
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Cancelar
              </Button>
              <Button>
                Aprovar Mudanças
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPositions;