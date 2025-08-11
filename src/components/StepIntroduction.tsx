import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Package, Wrench, Rocket, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useNavigate } from "react-router-dom";

const StepIntroduction = () => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const stepItems = [
    {
      icon: Brain,
      letter: "S",
      title: "SABER",
      subtitle: settings.saber_subtitle,
      description: settings.saber_description,
      color: "saber"
    },
    {
      icon: Package,
      letter: "T", 
      title: "TER",
      subtitle: settings.ter_subtitle,
      description: settings.ter_description,
      color: "ter"
    },
    {
      icon: Wrench,
      letter: "E",
      title: "EXECUTAR", 
      subtitle: settings.executar_subtitle,
      description: settings.executar_description,
      color: "executar"
    },
    {
      icon: Rocket,
      letter: "P",
      title: "POTENCIALIZAR",
      subtitle: settings.potencializar_subtitle,
      description: settings.potencializar_description,
      color: "potencializar"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6 text-foreground">{settings.step_title}</h2>
          <div className="max-w-4xl mx-auto text-content leading-relaxed space-y-4 text-justify">
            {settings.step_description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
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
                    <p className="text-sm font-bold text-foreground">
                      "{item.subtitle}"
                    </p>
                    <div className="text-sm text-content leading-relaxed text-justify space-y-2">
                      {item.description.split('→').map((part, index) => {
                        const trimmedPart = part.trim();
                        if (!trimmedPart) return null;
                        return (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-xs mt-1">→</span>
                            <span className="flex-1">{trimmedPart}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Botão de teste - remover após aprovação */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/teste-como-entrego')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Teste: Nova Visualização "Como Entrego"
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StepIntroduction;