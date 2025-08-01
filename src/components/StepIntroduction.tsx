import { Card } from "@/components/ui/card";
import { Brain, Package, Wrench, Rocket } from "lucide-react";

const StepIntroduction = () => {
  const stepItems = [
    {
      icon: Brain,
      letter: "S",
      title: "SABER",
      subtitle: "Não sei o que não sei",
      description: "Identificar necessidades e oportunidades ainda desconhecidas",
      color: "saber"
    },
    {
      icon: Package,
      letter: "T", 
      title: "TER",
      subtitle: "Sei o que preciso, mas não tenho",
      description: "Adquirir recursos e ferramentas necessárias",
      color: "ter"
    },
    {
      icon: Wrench,
      letter: "E",
      title: "EXECUTAR", 
      subtitle: "Tenho tudo, mas preciso fazer funcionar",
      description: "Implementar e operacionalizar soluções",
      color: "executar"
    },
    {
      icon: Rocket,
      letter: "P",
      title: "POTENCIALIZAR",
      subtitle: "Domino tudo, quero resultados extraordinários",
      description: "Otimizar e escalar para máxima performance",
      color: "potencializar"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">Introdução ao modelo - STEP</h2>
          <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed space-y-4">
            <p>
              Toda empresa, independente do tamanho, passa por quatro momentos distintos em sua jornada de crescimento. 
              Cada momento exige uma abordagem específica e uma solução certa. O objetivo é vender e servir o cliente certo, 
              no momento certo, com a solução certa.
            </p>
            <p>
              O framework STEP identifica onde o cliente está e qual solução ele realmente precisa, categorizando nossos 
              produtos em quatro etapas fundamentais para o sucesso empresarial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stepItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-opacity-50" 
                    style={{borderColor: `hsl(var(--${item.color}))`}}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4`} 
                     style={{backgroundColor: `hsl(var(--${item.color}))`}}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <div className={`text-xl font-bold mb-2`} style={{color: `hsl(var(--${item.color}))`}}>
                  {item.letter} - {item.title}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  "{item.subtitle}"
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StepIntroduction;