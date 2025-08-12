import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";

// Mock data para demonstração
const mockProductData = {
  // Estrutura básica
  titulo: "Diagnóstico e Planejamento de Marketing e Vendas no digital",
  categoria: "SABER",
  status: "Disponível",
  valorProduto: "Continuar usando o campo Faturamento (Sem desconto)",
  margemOperacional: "Manter a informação de % atual",
  
  // Visão Geral
  visaoGeral: {
    icp: "Empresas sem Estrutura digital Madura ou com baixa confiança no marketing",
    escopo: "Auditorias + Plano Tático/Estratégico + Apresentação final",
    duracaoMedia: "45 a 60 dias",
    timeEnvolvido: "Trazer as posições que foram adicionadas na alocação das horas",
    formatoEntrega: "Diagnóstico dividido em 4 semanas com entregas parciais",
    descricaoCompleta: "Descrição completo do produto - Pensado para empresas que ainda não possuem uma estratégia digital estruturada ou têm dúvidas sobre a real efetividade do marketing digital no seu negócio, este produto oferece uma solução rápida e segura para validar o método V4 na prática, com confiança e sem compromissos de longo prazo."
  },

  // SPICED (Como eu vendo?)
  spiced: {
    situation: {
      objetivo: "Entender onde a empresa está hoje — estrutura, maturidade e dores principais.",
      perguntasChave: "• Como está estruturado o time de marketing/comercial? • Vocês já investem em mídia paga? Quais canais? • Já criaram algum plano de crescimento nos últimos 12 meses? • Como vocês medem hoje o sucesso das ações de marketing?",
      observar: "• Se há time interno ou dependência externa. • Se já houve frustração anterior. • Se há verba aplicada, mas sem retorno claro. • Sinais de falta de processo e previsibilidade."
    },
    pain: {
      objetivo: "Aprofundar na dor latente que trava o avanço.",
      perguntasChave: "• Qual maior dificuldade de crescimento hoje? • Já tentaram resolver isso? O que não funcionou? • Qual o maior gargalo em marketing ou vendas? • Quais problemas vocês sentem que se repetem?",
      observar: "• Desorganização estratégica. • Falta de direcionamento tático. • Medo de investir novamente. • Marketing sem impacto no comercial."
    },
    impact: {
      objetivo: "Evidenciar os riscos da inércia e o custo de oportunidade.",
      perguntasChave: "• Isso tem afetado as vendas? Como? • Como o time sente essa falta de estrutura? • Está impactando metas do ano? • Existe algum custo invisível nesse cenário atual?",
      observar: "• Estagnação do faturamento. • Pressão por resultado. • Sinais de retrabalho ou desalinhamento interno. • Ansiedade com o futuro da empresa."
    },
    criticalEvent: {
      objetivo: "Identificar urgência e janela de oportunidade.",
      perguntasChave: "• Existe algum prazo importante? • Têm pressão por resultado este ano? • Há dependência de crescimento para algo específico?",
      observar: "• Metas anuais em risco. • Pressão de investidores. • Dependência de crescimento para expansão."
    },
    decision: {
      objetivo: "Mapear processo decisório e criar senso de urgência.",
      perguntasChave: "• Quem mais estaria envolvido nessa decisão? • Como costumam tomar decisões de investimento? • Existe um processo específico?",
      observar: "• Stakeholders envolvidos. • Tempo de decisão. • Histórico de investimentos."
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
  ],

  // Como eu entrego?
  informacoesOperar: {
    oQueEntrego: `Semana 1 — Alinhamento e imersão no negócio
• Briefing estratégico da operação e dos objetivos;
• Reuniões de alinhamento para entendimento do contexto e definição de metas;
• Acesso a dashboards e dados operacionais (quando disponíveis).

Semana 2 — Diagnóstico de marketing digital
• Auditoria de Mídia Paga: análise completa de ROI, performance, erros e desperdícios nas campanhas ativas.
• Auditoria de Criativos: avaliação técnica de peças visuais, copy, perfil no Instagram e boas práticas de UX.
• Diagnóstico de Páginas (CRO): análise de usabilidade, taxa de conversão e copy das principais páginas do funil.

Semana 3 — Diagnóstico Comercial e Análise Competitiva
• Auditoria do time Comercial: análise de maturidade técnica, jornada de atendimento e estratégia de inside sales.
• Análise Competitiva: diagnóstico SWOT, presença digital, 4Ps do marketing e mapa estratégico da concorrência.

Semana 4 — Planejamento Estratégico
• Mapa de Marketing e Vendas: definição de oferta, estratégias de aquisição, engajamento, monetização, retenção e conteúdo.
• Reunião final de apresentação com plano de ação estruturado, adaptado à realidade da empresa.`,
    etapas: [
      {
        fase: "Semana 1",
        etapa: "Preparação",
        tarefa: "Diagnóstico automático",
        dri: "Account Manager",
        horas: 0.5,
        pop: "URL do POP"
      },
      {
        fase: "Semana 1", 
        etapa: "Diagnóstico e Planejamento",
        tarefa: "Raio-x completo atual",
        dri: "Account Manager",
        horas: 0.5,
        pop: "URL do POP"
      },
      {
        fase: "Semana 1",
        etapa: "Diagnóstico e Planejamento", 
        tarefa: "Plano estruturado",
        dri: "Account Manager",
        horas: 1,
        pop: "URL do POP"
      }
    ]
  }
};

const ProductStructurePreview = () => {
  const totalHoras = mockProductData.posicoesAlocadas.reduce((acc, pos) => acc + pos.horasAlocadas, 0);
  const totalCSP = mockProductData.posicoesAlocadas.reduce((acc, pos) => acc + pos.csp, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Nova Estrutura de Produto</h1>
        <p className="text-muted-foreground">Protótipo baseado nas imagens de referência</p>
      </div>

      {/* Estrutura do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura do Produto (Com informações para facilitar na mudança)</CardTitle>
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
              <span className="text-sm font-medium text-muted-foreground">Valor do Produto:</span>
              <p className="text-sm">{mockProductData.valorProduto}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Margem Operacional:</span>
            <p className="text-sm">{mockProductData.margemOperacional}</p>
          </div>
        </CardContent>
      </Card>

      {/* Visão Geral do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">ICP:</span>
              <p className="text-sm">{mockProductData.visaoGeral.icp}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">ESCOPO:</span>
              <p className="text-sm">{mockProductData.visaoGeral.escopo}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">DURAÇÃO MÉDIA:</span>
              <p className="text-sm">{mockProductData.visaoGeral.duracaoMedia}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">TIME ENVOLVIDO:</span>
              <p className="text-sm">{mockProductData.visaoGeral.timeEnvolvido}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">FORMATO DE ENTREGA:</span>
            <p className="text-sm">{mockProductData.visaoGeral.formatoEntrega}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Descrição completa do produto:</span>
            <p className="text-sm text-justify leading-relaxed">{mockProductData.visaoGeral.descricaoCompleta}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações para vender */}
      <Card>
        <CardHeader>
          <CardTitle>Informações para vender</CardTitle>
          <p className="text-sm text-muted-foreground">"Como eu vendo?" - Campo de texto igual atual (Campo de texto acima da tabela da metodologia SPICED)</p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-4">Metodologia SPICED</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-muted/30">ETAPA (SPICED)</th>
                    <th className="text-left p-3 bg-muted/30">OBJETIVO DA ETAPA</th>
                    <th className="text-left p-3 bg-muted/30">PERGUNTAS CHAVES</th>
                    <th className="text-left p-3 bg-muted/30">O QUE OBSERVAR NO LEAD</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(mockProductData.spiced).map(([key, data]) => (
                    <tr key={key} className="border-b">
                      <td className="p-3 font-medium">{key.charAt(0).toUpperCase()} - {key === 'situation' ? 'Situation' : key === 'pain' ? 'Pain' : key === 'impact' ? 'Impact' : key === 'criticalEvent' ? 'Critical Event' : 'Decision'}</td>
                      <td className="p-3 text-sm">{data.objetivo}</td>
                      <td className="p-3 text-sm">{data.perguntasChave}</td>
                      <td className="p-3 text-sm">{data.observar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posições Alocadas */}
      <Card>
        <CardHeader>
          <CardTitle>Posições Alocadas</CardTitle>
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
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span>(=) Faturamento (MRR) - Sem Desconto</span>
                <span>R$ 24.519,54</span>
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
                <span>(=) Faturamento (MRR) - Com Desconto</span>
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
                <span>(=) Receita Bruta (MRR)</span>
                <span>R$ 10.813,12</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações para Operar */}
      <Card>
        <CardHeader>
          <CardTitle>Informações para Operar</CardTitle>
          <p className="text-sm text-muted-foreground">"Como eu entrego?" - Campo de texto igual atual (Campo de texto acima da tabela de etapas)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campo de texto "O que entrego" */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">"O que entrego"</h4>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {mockProductData.informacoesOperar.oQueEntrego}
            </div>
          </div>
          
          {/* Tabela de Etapas */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Como eu entrego? - Etapas de Entrega</h4>
              <Button variant="outline" size="sm">Adicionar Etapa</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-muted/30">FASE</th>
                    <th className="text-left p-3 bg-muted/30">ETAPA</th>
                    <th className="text-left p-3 bg-muted/30">TAREFA</th>
                    <th className="text-left p-3 bg-muted/30">DRI</th>
                    <th className="text-left p-3 bg-muted/30">HORAS</th>
                    <th className="text-left p-3 bg-muted/30">POP</th>
                    <th className="text-left p-3 bg-muted/30">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProductData.informacoesOperar.etapas.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.fase}</td>
                      <td className="p-3">{item.etapa}</td>
                      <td className="p-3">{item.tarefa}</td>
                      <td className="p-3">{item.dri}</td>
                      <td className="p-3">{item.horas}</td>
                      <td className="p-3">{item.pop}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">🗑️</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline">Voltar para a Estrutura Atual</Button>
        <Button>Aprovar esta Estrutura</Button>
      </div>
    </div>
  );
};

export default ProductStructurePreview;