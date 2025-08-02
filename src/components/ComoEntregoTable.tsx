import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface ComoEntregoItem {
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
                        <span className="text-muted-foreground text-sm">Não definido</span>
                      )}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
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