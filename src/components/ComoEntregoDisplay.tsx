import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComoEntregoItem {
  fase?: string;
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
}

interface ComoEntregoDisplayProps {
  description: string;
  deliverySteps: ComoEntregoItem[];
  title?: string;
}

const ComoEntregoDisplay: React.FC<ComoEntregoDisplayProps> = ({ 
  description, 
  deliverySteps = [],
  title = "Como eu entrego?"
}) => {
  // Agrupar dados por fase
  const groupedData = React.useMemo(() => {
    const groups: { [key: string]: ComoEntregoItem[] } = {};
    const ungrouped: ComoEntregoItem[] = [];
    
    deliverySteps.forEach(item => {
      if (item.fase && item.fase.trim()) {
        if (!groups[item.fase]) {
          groups[item.fase] = [];
        }
        groups[item.fase].push(item);
      } else {
        ungrouped.push(item);
      }
    });
    
    return { ...groups, ...(ungrouped.length > 0 ? { 'Outras Etapas': ungrouped } : {}) };
  }, [deliverySteps]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        {description && (
          <div className="text-sm text-content leading-relaxed">
            {description}
          </div>
        )}

        {/* Delivery Steps */}
        {deliverySteps.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Etapas de Entrega</h4>
            
            <Accordion type="multiple" className="w-full space-y-2">
              {Object.entries(groupedData).map(([fase, items]) => (
                <AccordionItem key={fase} value={fase} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-title-sub font-medium">
                        {fase}
                      </span>
                      <div className="text-body-small text-muted-foreground">
                        ({items.length} etapa{items.length !== 1 ? 's' : ''})
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border rounded-md">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-3 text-left font-medium text-sm">Etapa</th>
                            <th className="border border-border p-3 text-left font-medium text-sm">Tarefa</th>
                            <th className="border border-border p-3 text-left font-medium text-sm">DRI</th>
                            <th className="border border-border p-3 text-center font-medium text-sm">Estimativa</th>
                            <th className="border border-border p-3 text-center font-medium text-sm">Como Executar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((row, index) => (
                            <tr key={`${fase}-${index}`} className="hover:bg-muted/30">
                              <td className="border border-border p-3">
                                <div className="font-medium text-sm">{row.etapa}</div>
                              </td>
                              <td className="border border-border p-3">
                                <div className="text-sm text-content">{row.tarefa}</div>
                              </td>
                              <td className="border border-border p-3">
                                <div className="text-sm text-content">{row.dri}</div>
                              </td>
                              <td className="border border-border p-3 text-center">
                                <div className="text-sm font-medium">{row.estimativaHoras}h</div>
                              </td>
                              <td className="border border-border p-3 text-center">
                                {row.comoExecutar ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(row.comoExecutar, '_blank')}
                                    className="h-8 px-3 text-primary hover:text-primary-foreground"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Ver POP
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComoEntregoDisplay;