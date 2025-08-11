import { Header } from "@/components/Header";
import ComoEntregoDisplay from "@/components/ComoEntregoDisplay";

const ComoEntregoTestPage = () => {
  // Mock data para teste
  const mockDescription = `Ao final do projeto, o cliente recebe um conjunto completo de materiais e planos que unem diagnóstico e estratégia, prontos para aplicação imediata. Os entregáveis incluem:
• Peças criativas: 3 anúncios otimizados para alta performance e uma landing page desenvolvida com foco em conversão.
• Materiais de comunicação: manual visual articulado para manter consistência em todas as campanhas e canais.
• Planejamento estratégico: matriz de priorização de canais e modelo de Go To Market, alinhando aquisição, engajamento, monetização e retenção.
• Proposta de operacionalização e pitch: roteiro claro para execução da estratégia comercial e de marketing.
• Forecast de mídia: projeção de investimentos e resultados esperados para os próximos 3 meses.

Essas entregas garantem que o cliente saia não apenas com um diagnóstico preciso, mas com um plano claro, criativos prontos e previsões realistas para colocar a estratégia em prática imediatamente.`;

  const mockDeliverySteps = [
    {
      fase: "Semana 1",
      etapa: "Diagnóstico Inicial",
      tarefa: "Análise da situação atual do cliente",
      dri: "Consultor Sênior",
      estimativaHoras: "8",
      comoExecutar: "https://example.com/pop1"
    },
    {
      fase: "Semana 1",
      etapa: "Levantamento de Dados",
      tarefa: "Coleta de informações e métricas",
      dri: "Analista de Dados",
      estimativaHoras: "6",
      comoExecutar: "https://example.com/pop2"
    },
    {
      fase: "Semana 2",
      etapa: "Criação de Estratégia",
      tarefa: "Desenvolvimento do plano estratégico",
      dri: "Estrategista",
      estimativaHoras: "12",
      comoExecutar: "https://example.com/pop3"
    },
    {
      fase: "Semana 2",
      etapa: "Design de Materiais",
      tarefa: "Criação das peças criativas",
      dri: "Designer",
      estimativaHoras: "10",
      comoExecutar: "https://example.com/pop4"
    },
    {
      fase: "Semana 3",
      etapa: "Desenvolvimento",
      tarefa: "Criação da landing page",
      dri: "Desenvolvedor Front-end",
      estimativaHoras: "16",
      comoExecutar: "https://example.com/pop5"
    },
    {
      fase: "Semana 3",
      etapa: "Revisão e Testes",
      tarefa: "Validação dos materiais criados",
      dri: "Quality Assurance",
      estimativaHoras: "4",
      comoExecutar: "https://example.com/pop6"
    },
    {
      fase: "Semana 4",
      etapa: "Planejamento de Mídia",
      tarefa: "Desenvolvimento do forecast de mídia",
      dri: "Media Planner",
      estimativaHoras: "8",
      comoExecutar: "https://example.com/pop7"
    },
    {
      fase: "Semana 4",
      etapa: "Entrega Final",
      tarefa: "Apresentação dos resultados ao cliente",
      dri: "Consultor Sênior",
      estimativaHoras: "4",
      comoExecutar: "https://example.com/pop8"
    },
    {
      fase: "Semana 5",
      etapa: "Acompanhamento",
      tarefa: "Suporte pós-entrega e dúvidas",
      dri: "Consultor Sênior",
      estimativaHoras: "6",
      comoExecutar: "https://example.com/pop9"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Teste: Como eu entrego - Nova Visualização
            </h1>
            <p className="text-muted-foreground">
              Esta é uma página de teste para visualizar o novo formato de "Como eu entrego" 
              similar ao formato de "Informações para vender".
            </p>
          </div>

          <ComoEntregoDisplay 
            description={mockDescription}
            deliverySteps={mockDeliverySteps}
            title="Como eu entrego?"
          />
        </div>
      </main>
    </div>
  );
};

export default ComoEntregoTestPage;