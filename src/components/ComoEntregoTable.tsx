import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ComoEntregoItem {
  etapa: string;
  tarefa: string;
  dri: string;
  estimativaHoras: string;
  comoExecutar: string;
}

interface ComoEntregoTableProps {
  data: ComoEntregoItem[];
  onChange?: (data: ComoEntregoItem[]) => void;
  readOnly?: boolean;
}

const driOptions = [
  "Gestor de Projetos",
  "Designer",
  "Desenvolvedor Frontend",
  "Desenvolvedor Backend",
  "Analista de Marketing", 
  "Copywriter",
  "Social Media",
  "Especialista em SEO",
  "Consultor de Negócios",
  "Analista de Dados"
];

const ComoEntregoTable: React.FC<ComoEntregoTableProps> = ({ 
  data = [], 
  onChange, 
  readOnly = false 
}) => {
  const handleAddRow = () => {
    if (!onChange) return;
    
    const newRow: ComoEntregoItem = {
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

  if (readOnly) {
    return (
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma etapa de entrega foi definida ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold">ETAPA</th>
                  <th className="border border-border p-3 text-left font-semibold">TAREFA</th>
                  <th className="border border-border p-3 text-left font-semibold">DRI</th>
                  <th className="border border-border p-3 text-left font-semibold">ESTIMATIVA DE HORAS</th>
                  <th className="border border-border p-3 text-left font-semibold">COMO EXECUTAR (POP)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="border border-border p-3">
                      <div className="font-medium">{row.etapa}</div>
                    </td>
                    <td className="border border-border p-3">
                      <div>{row.tarefa}</div>
                    </td>
                    <td className="border border-border p-3">
                      <div className="text-sm">{row.dri}</div>
                    </td>
                    <td className="border border-border p-3 text-center">
                      <div className="font-mono">{row.estimativaHoras}h</div>
                    </td>
                    <td className="border border-border p-3">
                      <div className="whitespace-pre-line text-sm">{row.comoExecutar}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="space-y-4">
            {data.map((row, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-medium">Etapa {index + 1}</h5>
                  <Button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Etapa</label>
                    <Input
                      value={row.etapa}
                      onChange={(e) => handleUpdateRow(index, 'etapa', e.target.value)}
                      placeholder="Nome da etapa"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tarefa</label>
                    <Input
                      value={row.tarefa}
                      onChange={(e) => handleUpdateRow(index, 'tarefa', e.target.value)}
                      placeholder="Descrição da tarefa"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">DRI (Responsável)</label>
                    <Select 
                      value={row.dri} 
                      onValueChange={(value) => handleUpdateRow(index, 'dri', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {driOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimativa de Horas</label>
                    <Input
                      type="number"
                      value={row.estimativaHoras}
                      onChange={(e) => handleUpdateRow(index, 'estimativaHoras', e.target.value)}
                      placeholder="Ex: 8"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Como Executar (POP)</label>
                  <Textarea
                    value={row.comoExecutar}
                    onChange={(e) => handleUpdateRow(index, 'comoExecutar', e.target.value)}
                    placeholder="Descreva o procedimento operacional padrão para executar esta tarefa..."
                    rows={4}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComoEntregoTable;