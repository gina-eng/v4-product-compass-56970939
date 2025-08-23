import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, Clock, Calculator } from "lucide-react";
import { Layout } from "@/components/Layout";
import { formatCurrency } from "@/lib/formatters";

// Mock data para demonstração da nova estrutura
const mockProductWithNewPricing = {
  id: "1",
  titulo: "Diagnóstico e Planejamento de Marketing e Vendas no digital",
  categoria: "SABER",
  status: "Disponível",
  duracaoMedia: "45 a 60 dias",
  dono: "João Silva",
  
  // ICP e descrição
  icp: "Empresas sem Estrutura digital Madura ou com baixa confiança no marketing",
  descricaoCompleta: "Descrição completa do produto - Pensado para empresas que ainda não possuem uma estratégia digital estruturada ou têm dúvidas sobre a real efetividade do marketing digital no seu negócio.",
  
  // Nova estrutura de precificação
  precificacao: {
    principal: {
      tipoCobranca: "recorrente", // "one-time" ou "recorrente"
      valorOneTime: "24519.54",
      valorRecorrente: "4086.59", // Valor mensal
      mesesRecorrencia: 6,
      afetaDRE: true
    },
    ilustrativa: {
      tipoCobranca: "one-time",
      valorOneTime: "19615.63", // 20% de desconto para pagamento à vista
      valorRecorrente: "4086.59",
      mesesRecorrencia: 6,
      afetaDRE: false,
      descricao: "Preço promocional para pagamento à vista (20% desconto)"
    }
  },

  // Posições Alocadas (mantendo estrutura atual)
  posicoesAlocadas: [
    { posicao: "Gerente de PE&G", horasAlocadas: 2.1, csp: 250.01 },
    { posicao: "Coordenador de PE&G", horasAlocadas: 5, csp: 297.60 },
    { posicao: "Gestor de Tráfego", horasAlocadas: 15, csp: 625.05 },
    { posicao: "Sales Enablement", horasAlocadas: 20, csp: 654.80 },
    { posicao: "Account Manager", horasAlocadas: 30, csp: 892.80 },
    { posicao: "Copywriter", horasAlocadas: 10, csp: 238.10 },
    { posicao: "Designer Gráfico", horasAlocadas: 10, csp: 267.90 }
  ],

  // SPICED e Como Vendo
  comoVendo: `Este produto é ideal para empresas que ainda não possuem uma estratégia digital estruturada ou têm dúvidas sobre a real efetividade do marketing digital no seu negócio. 

Oferecemos uma solução rápida e segura para validar o método V4 na prática, com confiança e sem compromissos de longo prazo.

O diagnóstico é dividido em 4 semanas com entregas parciais, garantindo transparência e valor a cada etapa.`
};

const ProductDetailsNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product] = useState(mockProductWithNewPricing);
  const [pricingData, setPricingData] = useState(product.precificacao.principal);
  const [illustrativePricing, setIllustrativePricing] = useState(product.precificacao.ilustrativa);

  const totalHoras = product.posicoesAlocadas.reduce((acc, pos) => acc + pos.horasAlocadas, 0);
  const totalCSP = product.posicoesAlocadas.reduce((acc, pos) => acc + pos.csp, 0);

  const getCategoryColor = (category: string) => {
    const colors = {
      saber: "hsl(var(--saber))",
      ter: "hsl(var(--ter))", 
      executar: "hsl(var(--executar))",
      potencializar: "hsl(var(--potencializar))"
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "hsl(var(--primary))";
  };

  const renderPricingCard = (data: any, title: string, isIllustrative = false, isEditable = true) => (
    <Card className={`${isIllustrative ? 'border-blue-200 bg-blue-50/50' : 'border-green-200 bg-green-50/50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {title}
          </span>
          {isIllustrative && (
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Não afeta DRE
            </Badge>
          )}
          {!isIllustrative && (
            <Badge variant="default" className="bg-green-600">
              Afeta DRE
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
            disabled={!isEditable}
          />
          <Label className="text-sm font-medium">
            {data.tipoCobranca === "recorrente" ? "Pagamento Recorrente" : "Pagamento Único"}
          </Label>
        </div>

        {data.tipoCobranca === "one-time" ? (
          <div>
            <Label className="text-sm font-medium">Valor One-Time</Label>
            <div className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(data.valorOneTime)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Valor Mensal</Label>
              <div className="text-xl font-bold text-primary mt-1">
                {formatCurrency(data.valorRecorrente)}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Duração do Contrato</Label>
              <div className="text-lg font-medium mt-1">
                {data.mesesRecorrencia} meses
              </div>
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
            <div className="text-sm font-medium text-blue-800">💡 Observação:</div>
            <div className="text-sm text-blue-700">{data.descricao}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const calculateDREForPricing = (pricing: any) => {
    const baseValue = pricing.tipoCobranca === "one-time" 
      ? parseFloat(pricing.valorOneTime)
      : parseFloat(pricing.valorRecorrente) * pricing.mesesRecorrencia;
    
    const descontosPagamento = baseValue * 0.17;
    const descontosCupom = baseValue * 0.20;
    const faturamentoComDesconto = baseValue - descontosPagamento - descontosCupom;
    
    const royalties = faturamentoComDesconto * 0.17;
    const taxaTransacao = faturamentoComDesconto * 0.03;
    const taxaAntecipacao = faturamentoComDesconto * 0.10;
    
    const receitaBruta = faturamentoComDesconto - royalties - taxaTransacao - taxaAntecipacao;
    
    return {
      faturamentoSemDesconto: baseValue,
      descontosPagamento,
      descontosCupom,
      faturamentoComDesconto,
      royalties,
      taxaTransacao,
      taxaAntecipacao,
      receitaBruta
    };
  };

  const dreCalculation = calculateDREForPricing(pricingData);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.titulo}</h1>
            <p className="text-muted-foreground">Nova estrutura com precificação flexível</p>
          </div>
        </div>

        {/* Estrutura Básica do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className="text-body-small font-medium px-3 py-1"
                    style={{backgroundColor: getCategoryColor(product.categoria), color: 'white'}}
                  >
                    {product.categoria}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                  {product.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Duração Média:</span>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {product.duracaoMedia}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">PMM Responsável:</span>
                <p className="font-medium">{product.dono}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ICP e Descrição */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🎯 ICP (Ideal Customer Profile)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{product.icp}</p>
              </CardContent>
            </Card>
            
            <div>
              <h4 className="font-medium mb-2">Descrição Completa:</h4>
              <p className="text-justify leading-relaxed text-muted-foreground">
                {product.descricaoCompleta}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nova Seção de Precificação Flexível */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              💰 Estrutura de Precificação Flexível
              <Badge variant="secondary">NOVA VERSÃO</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure valores one-time e recorrentes de forma independente
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderPricingCard(pricingData, "Precificação Principal", false, false)}
              {renderPricingCard(illustrativePricing, "Precificação Ilustrativa", true, false)}
            </div>

            <Separator className="my-6" />

            {/* Comparação Rápida */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Comparação dos Modelos de Cobrança
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="font-medium text-green-700">💚 Precificação Principal (DRE):</div>
                  <div className="space-y-1 text-sm">
                    <div>Tipo: <span className="font-medium capitalize">{pricingData.tipoCobranca}</span></div>
                    <div>
                      Valor: <span className="font-medium">
                        {pricingData.tipoCobranca === "one-time" 
                          ? formatCurrency(pricingData.valorOneTime)
                          : `${formatCurrency(pricingData.valorRecorrente)}/mês × ${pricingData.mesesRecorrencia} = ${formatCurrency((parseFloat(pricingData.valorRecorrente) * pricingData.mesesRecorrencia).toString())}`
                        }
                      </span>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-green-700 text-xs">
                      Esta precificação afeta todos os cálculos de DRE e relatórios financeiros
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="font-medium text-blue-700">💙 Precificação Ilustrativa:</div>
                  <div className="space-y-1 text-sm">
                    <div>Tipo: <span className="font-medium capitalize">{illustrativePricing.tipoCobranca}</span></div>
                    <div>
                      Valor: <span className="font-medium">
                        {illustrativePricing.tipoCobranca === "one-time" 
                          ? formatCurrency(illustrativePricing.valorOneTime)
                          : `${formatCurrency(illustrativePricing.valorRecorrente)}/mês × ${illustrativePricing.mesesRecorrencia} = ${formatCurrency((parseFloat(illustrativePricing.valorRecorrente) * illustrativePricing.mesesRecorrencia).toString())}`
                        }
                      </span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-blue-700 text-xs">
                      Apenas para apresentação comercial - não impacta relatórios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações para Vender */}
        <Card>
          <CardHeader>
            <CardTitle>Como eu vendo? (SPICED)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-justify leading-relaxed">
                {product.comoVendo}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posições Alocadas (mantendo estrutura atual baseada em horas) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Posições Alocadas (Cálculo por Horas)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Esta estrutura permanece baseada em horas e CSP, mas agora se adapta ao tipo de cobrança escolhido
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-muted/30">POSIÇÃO</th>
                    <th className="text-left p-3 bg-muted/30">HORAS ALOCADAS</th>
                    <th className="text-left p-3 bg-muted/30">CSP (Custo por Hora)</th>
                    <th className="text-left p-3 bg-muted/30">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {product.posicoesAlocadas.map((pos, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{pos.posicao}</td>
                      <td className="p-3">{pos.horasAlocadas}h</td>
                      <td className="p-3">{formatCurrency(pos.csp / pos.horasAlocadas)}</td>
                      <td className="p-3 font-medium">{formatCurrency(pos.csp)}</td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-black font-bold bg-muted/50">
                    <td className="p-3">TOTAL</td>
                    <td className="p-3">{totalHoras}h</td>
                    <td className="p-3">-</td>
                    <td className="p-3">{formatCurrency(totalCSP)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DRE Baseada na Precificação Principal */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h4 className="font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
                <Calculator className="h-5 w-5" />
                DRE Final (Baseada na Precificação Principal)
              </h4>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Calculada com base no modelo: <span className="font-medium capitalize">{pricingData.tipoCobranca}</span>
                {pricingData.tipoCobranca === "recorrente" && ` (${pricingData.mesesRecorrencia} meses)`}
              </p>
              
              <div className="space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between py-1">
                  <span>(=) Faturamento - Sem Desconto</span>
                  <span className="font-medium">{formatCurrency(dreCalculation.faturamentoSemDesconto)}</span>
                </div>
                <div className="flex justify-between text-red-600 py-1">
                  <span>(-) Desconto de Pagamento (-17%)</span>
                  <span>-{formatCurrency(dreCalculation.descontosPagamento)}</span>
                </div>
                <div className="flex justify-between text-red-600 py-1">
                  <span>(-) Desconto de Cupom (-20%)</span>
                  <span>-{formatCurrency(dreCalculation.descontosCupom)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium py-1 bg-blue-50 px-2 rounded">
                  <span>(=) Faturamento - Com Desconto</span>
                  <span>{formatCurrency(dreCalculation.faturamentoComDesconto)}</span>
                </div>
                <div className="flex justify-between text-red-600 py-1">
                  <span>(-) Royalties (-17%)</span>
                  <span>-{formatCurrency(dreCalculation.royalties)}</span>
                </div>
                <div className="flex justify-between text-red-600 py-1">
                  <span>(-) Taxa de Transação (-3%)</span>
                  <span>-{formatCurrency(dreCalculation.taxaTransacao)}</span>
                </div>
                <div className="flex justify-between text-red-600 py-1">
                  <span>(-) Taxa de Antecipação (-10%)</span>
                  <span>-{formatCurrency(dreCalculation.taxaAntecipacao)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg border-t pt-2 bg-green-50 px-2 rounded">
                  <span>(=) Receita Bruta Final</span>
                  <span className="text-green-700">{formatCurrency(dreCalculation.receitaBruta)}</span>
                </div>
                
                {/* Informação adicional para recorrente */}
                {pricingData.tipoCobranca === "recorrente" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm text-blue-800 font-medium">💡 Receita Mensal Recorrente:</div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatCurrency(dreCalculation.receitaBruta / pricingData.mesesRecorrencia)}/mês
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas sobre Compatibilidade */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">✨ Benefícios da Nova Estrutura</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li>• <strong>Flexibilidade total:</strong> One-time ou recorrente por produto</li>
                <li>• <strong>DRE inteligente:</strong> Cálculos automáticos baseados no tipo escolhido</li>
                <li>• <strong>Compatibilidade:</strong> Mantém toda estrutura atual de horas/CSP</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Precificação ilustrativa:</strong> Para propostas comerciais flexíveis</li>
                <li>• <strong>Relatórios precisos:</strong> Apenas precificação principal afeta DRE</li>
                <li>• <strong>Casos múltiplos:</strong> Mesmo produto, modalidades diferentes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductDetailsNew;