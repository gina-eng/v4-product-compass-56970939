import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";

// Mock data baseado na estrutura atual
const mockProductData = {
  titulo: "Diagnóstico e Planejamento de Marketing e Vendas no digital",
  categoria: "SABER",
  status: "Disponível",
  valorAtual: "24.519,54", // Valor atual do sistema
  
  // Nova estrutura de precificação
  precificacao: {
    tipoCobranca: "recorrente", // "one-time" ou "recorrente"
    valorOneTime: "24519.54",
    valorRecorrente: "4086.59", // Valor mensal
    mesesRecorrencia: 6,
    valorIlustrativo: {
      tipoCobranca: "one-time",
      valorOneTime: "19615.63", // 20% de desconto para pagamento à vista
      valorRecorrente: "4086.59",
      mesesRecorrencia: 6,
      descricao: "Preço promocional para pagamento à vista"
    }
  },

  // Posições Alocadas (mock)
  posicoesAlocadas: [
    { posicao: "Gerente de PE&G", horasAlocadas: 2.1, csp: 250.01 },
    { posicao: "Coordenador de PE&G", horasAlocadas: 5, csp: 297.60 },
    { posicao: "Gestor de Tráfego", horasAlocadas: 15, csp: 625.05 },
    { posicao: "Sales Enablement", horasAlocadas: 20, csp: 654.80 },
    { posicao: "Account Manager", horasAlocadas: 30, csp: 892.80 },
    { posicao: "Copywriter", horasAlocadas: 10, csp: 238.10 },
    { posicao: "Designer Gráfico", horasAlocadas: 10, csp: 267.90 }
  ]
};

const NewPricingStructurePreview = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pricingData, setPricingData] = useState(mockProductData.precificacao);
  const [illustrativePricing, setIllustrativePricing] = useState(mockProductData.precificacao.valorIlustrativo);

  const totalHoras = mockProductData.posicoesAlocadas.reduce((acc, pos) => acc + pos.horasAlocadas, 0);
  const totalCSP = mockProductData.posicoesAlocadas.reduce((acc, pos) => acc + pos.csp, 0);

  const renderPricingCard = (data: any, title: string, isIllustrative = false) => (
    <Card className={`${isIllustrative ? 'border-blue-200 bg-blue-50/50' : 'border-green-200 bg-green-50/50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isIllustrative && (
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Ilustrativo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={data.tipoCobranca === "recorrente"}
            onCheckedChange={(checked) => {
              const newType = checked ? "recorrente" : "one-time";
              if (isIllustrative) {
                setIllustrativePricing({ ...data, tipoCobranca: newType });
              } else {
                setPricingData({ ...data, tipoCobranca: newType });
              }
            }}
          />
          <Label className="text-sm font-medium">
            {data.tipoCobranca === "recorrente" ? "Pagamento Recorrente" : "Pagamento Único"}
          </Label>
        </div>

        {data.tipoCobranca === "one-time" ? (
          <div>
            <Label htmlFor={`oneTime${isIllustrative ? 'Ill' : ''}`} className="text-sm">
              Valor One-Time
            </Label>
            <Input
              id={`oneTime${isIllustrative ? 'Ill' : ''}`}
              type="text"
              value={formatCurrency(data.valorOneTime)}
              disabled={!isEditMode}
              className="mt-1 font-medium text-lg"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`mensal${isIllustrative ? 'Ill' : ''}`} className="text-sm">
                Valor Mensal
              </Label>
              <Input
                id={`mensal${isIllustrative ? 'Ill' : ''}`}
                type="text"
                value={formatCurrency(data.valorRecorrente)}
                disabled={!isEditMode}
                className="mt-1 font-medium"
              />
            </div>
            <div>
              <Label htmlFor={`meses${isIllustrative ? 'Ill' : ''}`} className="text-sm">
                Quantidade de Meses
              </Label>
              <Input
                id={`meses${isIllustrative ? 'Ill' : ''}`}
                type="number"
                value={data.mesesRecorrencia}
                disabled={!isEditMode}
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="text-sm text-muted-foreground">Total do Contrato:</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency((parseFloat(data.valorRecorrente) * data.mesesRecorrencia).toString())}
              </div>
            </div>
          </div>
        )}

        {isIllustrative && data.descricao && (
          <div className="p-3 bg-blue-100 rounded border border-blue-200">
            <div className="text-sm font-medium text-blue-800">Observação:</div>
            <div className="text-sm text-blue-700">{data.descricao}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Nova Estrutura de Precificação</h1>
        <p className="text-muted-foreground">
          Visualização da estrutura com suporte a valores one-time e recorrentes
        </p>
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
            <Label>Modo Edição</Label>
          </div>
        </div>
      </div>

      {/* Estrutura do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Título:</span>
              <p className="font-medium">{mockProductData.titulo}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
              <Badge variant="outline" className="ml-2">{mockProductData.categoria}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Badge variant="default" className="ml-2">{mockProductData.status}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Valor Atual (Sistema):</span>
              <p className="text-sm font-medium">{formatCurrency(mockProductData.valorAtual)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nova Seção de Precificação */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            💰 Nova Estrutura de Precificação
            <Badge variant="secondary">NOVO</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configuração flexível para valores one-time e recorrentes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Precificação Principal */}
            {renderPricingCard(pricingData, "Precificação Principal (Afeta DRE)")}
            
            {/* Precificação Ilustrativa */}
            {renderPricingCard(illustrativePricing, "Precificação Ilustrativa (Não afeta DRE)", true)}
          </div>

          <Separator className="my-6" />

          {/* Resumo Comparativo */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-bold mb-4">📊 Resumo Comparativo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-green-700">Precificação Principal:</div>
                <div className="text-sm">
                  Tipo: <span className="font-medium capitalize">{pricingData.tipoCobranca}</span>
                </div>
                <div className="text-sm">
                  Valor: <span className="font-medium">
                    {pricingData.tipoCobranca === "one-time" 
                      ? formatCurrency(pricingData.valorOneTime)
                      : `${formatCurrency(pricingData.valorRecorrente)}/mês × ${pricingData.mesesRecorrencia} = ${formatCurrency((parseFloat(pricingData.valorRecorrente) * pricingData.mesesRecorrencia).toString())}`
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-blue-700">Precificação Ilustrativa:</div>
                <div className="text-sm">
                  Tipo: <span className="font-medium capitalize">{illustrativePricing.tipoCobranca}</span>
                </div>
                <div className="text-sm">
                  Valor: <span className="font-medium">
                    {illustrativePricing.tipoCobranca === "one-time" 
                      ? formatCurrency(illustrativePricing.valorOneTime)
                      : `${formatCurrency(illustrativePricing.valorRecorrente)}/mês × ${illustrativePricing.mesesRecorrencia} = ${formatCurrency((parseFloat(illustrativePricing.valorRecorrente) * illustrativePricing.mesesRecorrencia).toString())}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posições Alocadas (mantendo estrutura atual) */}
      <Card>
        <CardHeader>
          <CardTitle>Posições Alocadas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta seção permanece inalterada, afetando apenas a DRE principal
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted/30">POSIÇÃO</th>
                  <th className="text-left p-3 bg-muted/30">HORAS ALOCADAS</th>
                  <th className="text-left p-3 bg-muted/30">CSP</th>
                </tr>
              </thead>
              <tbody>
                {mockProductData.posicoesAlocadas.map((pos, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{pos.posicao}</td>
                    <td className="p-3">{pos.horasAlocadas}</td>
                    <td className="p-3">{formatCurrency(pos.csp)}</td>
                  </tr>
                ))}
                <tr className="border-b-2 border-black font-bold">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3">{totalHoras}</td>
                  <td className="p-3">{formatCurrency(totalCSP)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-bold text-lg mb-4 text-center">DRE FINAL</h4>
            <p className="text-sm text-center text-muted-foreground mb-4">
              (Baseado apenas na precificação principal - {pricingData.tipoCobranca})
            </p>
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span>(=) Faturamento - Sem Desconto</span>
                <span>
                  {pricingData.tipoCobranca === "one-time" 
                    ? formatCurrency(pricingData.valorOneTime)
                    : formatCurrency(pricingData.valorRecorrente) + "/mês"
                  }
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Desconto de Pagamento (-17%)</span>
                <span>R$ 4.168,32</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Desconto de Cupom (-20%)</span>
                <span>R$ 4.903,91</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>(=) Faturamento - Com Desconto</span>
                <span>R$ 15.447,31</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Royalties (-17%)</span>
                <span>R$ 2.626,04</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Taxa de Transação (-3%)</span>
                <span>R$ 463,42</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>(-) Taxa de Antecipação (-10%)</span>
                <span>R$ 1.544,73</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>(=) Receita Bruta</span>
                <span>R$ 10.813,12</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas sobre a Implementação */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">📝 Notas da Implementação</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="space-y-2 text-sm">
            <li>• <strong>Precificação Principal:</strong> Esta é a que afeta a DRE e os cálculos financeiros</li>
            <li>• <strong>Precificação Ilustrativa:</strong> Apenas para apresentação comercial, não impacta relatórios</li>
            <li>• <strong>Flexibilidade:</strong> Cada produto pode ter configurações independentes de one-time vs recorrente</li>
            <li>• <strong>Compatibilidade:</strong> A estrutura atual de posições e DRE permanece inalterada</li>
            <li>• <strong>Casos de Uso:</strong> Ideal para produtos que podem ser vendidos de múltiplas formas</li>
          </ul>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar para a Estrutura Atual
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          Aprovar Nova Estrutura
        </Button>
      </div>
    </div>
  );
};

export default NewPricingStructurePreview;