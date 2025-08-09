import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComoEntregoItem {
  fase?: string;
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string; // URL do POP
}

interface Position {
  id: string;
  nome: string;
  investimento_total: number;
  cph: number;
}

interface ComoEntregoTableProps {
  data: ComoEntregoItem[];
  onChange?: (data: ComoEntregoItem[]) => void;
  readOnly?: boolean;
  positions?: Position[];
}


const ComoEntregoTable: React.FC<ComoEntregoTableProps> = ({ 
  data = [], 
  onChange, 
  readOnly = false,
  positions = []
}) => {
  const handleAddRow = () => {
    if (!onChange) return;
    
    const newRow: ComoEntregoItem = {
      fase: "",
      etapa: "",
      tarefa: "",
      dri: "",
      estimativaHoras: "",
      comoExecutar: ""
    };
    
    onChange([...data, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    if (!onChange) return;
    
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleUpdateRow = (index: number, field: keyof ComoEntregoItem, value: string) => {
    if (!onChange) return;
    
    const newData = data.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    onChange(newData);
  };

  // Agrupar dados por fase para visualização
  const groupedData = React.useMemo(() => {
    if (!readOnly) return { ungrouped: data };
    
    const groups: { [key: string]: ComoEntregoItem[] } = {};
    const ungrouped: ComoEntregoItem[] = [];
    
    data.forEach(item => {
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
  }, [data, readOnly]);

  if (readOnly) {
    return (
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma etapa de entrega foi definida ainda.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {Object.entries(groupedData).map(([fase, items]) => (
              <AccordionItem key={fase} value={fase} className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-title-sub">
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
                          <th className="border border-border padding-section text-left table-header">Etapa</th>
                          <th className="border border-border padding-section text-left table-header">Tarefa</th>
                          <th className="border border-border padding-section text-left table-header">DRI</th>
                          <th className="border border-border padding-section text-left table-header">Estimativa de Horas</th>
                          <th className="border border-border padding-section text-left table-header">Como Executar (POP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((row, index) => (
                          <tr key={`${fase}-${index}`} className="hover:bg-muted/50">
                            <td className="border border-border padding-section">
                              <div className="text-title-sub">{row.etapa}</div>
                            </td>
                            <td className="border border-border padding-section">
                              <div className="text-body">{row.tarefa}</div>
                            </td>
                            <td className="border border-border padding-section">
                              <div className="text-body-small">{row.dri}</div>
                            </td>
                            <td className="border border-border padding-section text-center">
                              <div className="table-cell-number">{row.estimativaHoras}h</div>
                            </td>
                            <td className="border border-border padding-section">
                              {row.comoExecutar ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(row.comoExecutar, '_blank')}
                                  className="h-8 px-2 text-primary hover:text-primary-foreground"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ver POP
                                </Button>
                              ) : (
                                <span className="text-body-small text-muted-foreground">Não definido</span>
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
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Como eu entrego? - Etapas de Entrega</h4>
          <Button 
            type="button"
            onClick={handleAddRow}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa
          </Button>
        </div>

        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Clique em "Adicionar Etapa" para começar a definir as etapas de entrega.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold">FASE</th>
                  <th className="border border-border p-3 text-left font-semibold">ETAPA</th>
                  <th className="border border-border p-3 text-left font-semibold">TAREFA</th>
                  <th className="border border-border p-3 text-left font-semibold">DRI</th>
                  <th className="border border-border p-3 text-left font-semibold">HORAS</th>
                  <th className="border border-border p-3 text-left font-semibold">POP</th>
                  <th className="border border-border p-3 text-center font-semibold">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="border border-border p-2">
                      <Input
                        value={row.fase || ''}
                        onChange={(e) => handleUpdateRow(index, 'fase', e.target.value)}
                        placeholder="Ex: Preparação"
                        className="border-0 p-1 h-8 text-sm"
                      />
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        value={row.etapa}
                        onChange={(e) => handleUpdateRow(index, 'etapa', e.target.value)}
                        placeholder="Nome da etapa"
                        className="border-0 p-1 h-8 text-sm"
                      />
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        value={row.tarefa}
                        onChange={(e) => handleUpdateRow(index, 'tarefa', e.target.value)}
                        placeholder="Descrição da tarefa"
                        className="border-0 p-1 h-8 text-sm"
                      />
                    </td>
                    <td className="border border-border p-2">
                      <Select 
                        value={row.dri} 
                        onValueChange={(value) => handleUpdateRow(index, 'dri', value)}
                      >
                        <SelectTrigger className="border-0 h-8 text-sm">
                          <SelectValue placeholder="Responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.nome}>
                              {position.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        type="number"
                        value={row.estimativaHoras}
                        onChange={(e) => handleUpdateRow(index, 'estimativaHoras', e.target.value)}
                        placeholder="8"
                        min="0"
                        step="0.5"
                        className="border-0 p-1 h-8 text-sm text-center"
                      />
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        type="url"
                        value={row.comoExecutar}
                        onChange={(e) => handleUpdateRow(index, 'comoExecutar', e.target.value)}
                        placeholder="URL do POP"
                        className="border-0 p-1 h-8 text-sm"
                      />
                    </td>
                    <td className="border border-border p-2 text-center">
                      <Button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComoEntregoTable;