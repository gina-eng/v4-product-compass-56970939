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
          <h2 className="text-3xl font-bold mb-6 text-foreground">Introdução ao modelo - STEP</h2>
          <div className="max-w-4xl mx-auto text-foreground/70 leading-relaxed space-y-4">
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
              <div 
                key={index} 
                className="bg-card border-2 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-105" 
                style={{borderColor: `hsl(var(--${item.color}))`}}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center" 
                    style={{backgroundColor: `hsl(var(--${item.color}))`}}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 
                      className="text-xl font-bold"
                      style={{color: `hsl(var(--${item.color}))`}}
                    >
                      {item.letter} - {item.title}
                    </h3>
                    <p className="text-sm font-medium text-foreground">
                      "{item.subtitle}"
                    </p>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StepIntroduction;