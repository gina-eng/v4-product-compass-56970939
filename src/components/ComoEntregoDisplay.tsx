import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Edit, Trash2, Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComoEntregoItem {
  fase?: string;
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
}

interface Material {
  id: string;
  name: string;
  type: 'operacional';
  url: string;
  description?: string;
  formato?: 'gravado' | 'material';
}

interface ComoEntregoDisplayProps {
  description: string;
  deliverySteps: ComoEntregoItem[];
  materials?: Material[];
  title?: string;
  readOnly?: boolean;
  onAddMaterial?: () => void;
  onEditMaterial?: (material: Material) => void;
  onDeleteMaterial?: (id: string) => void;
}

const ComoEntregoDisplay: React.FC<ComoEntregoDisplayProps> = ({ 
  description, 
  deliverySteps = [],
  materials = [],
  title = "Como eu entrego?",
  readOnly = true,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial
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

        {/* Materiais Operacionais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Materiais Operacionais</h4>
            {!readOnly && onAddMaterial && (
              <Button size="sm" onClick={onAddMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            )}
          </div>
          
          {materials.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Nenhum material operacional cadastrado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {materials.map((material) => (
                <div key={material.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          Operacional
                        </Badge>
                        {material.formato && (
                          <Badge variant="outline" className="text-xs">
                            {material.formato === 'gravado' ? '🎥 Gravado' : '📄 Material'}
                          </Badge>
                        )}
                      </div>
                      <h5 className="font-medium text-sm leading-tight mb-2 pr-2">{material.name}</h5>
                      {material.description && (
                        <p className="text-xs text-content mb-2 leading-relaxed">{material.description}</p>
                      )}
                      <a 
                        href={material.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all"
                      >
                        {material.url}
                      </a>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(material.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      {!readOnly && onEditMaterial && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditMaterial(material)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {!readOnly && onDeleteMaterial && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteMaterial(material.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComoEntregoDisplay;