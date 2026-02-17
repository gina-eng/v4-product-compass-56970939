import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SpicedData {
  situation: { objetivo: string; perguntas: string; observar: string };
  pain: { objetivo: string; perguntas: string; observar: string };
  impact: { objetivo: string; perguntas: string; observar: string };
  criticalEvent: { objetivo: string; perguntas: string; observar: string };
  decision: { objetivo: string; perguntas: string; observar: string };
}

interface SpicedTableProps {
  data?: SpicedData;
  onChange?: (data: SpicedData) => void;
  readOnly?: boolean;
}

const SpicedTable = ({ data, onChange, readOnly = false }: SpicedTableProps) => {
  // Ensure data is properly initialized with default values if undefined or incomplete
  const safeData: SpicedData = {
    situation: data?.situation || { objetivo: "", perguntas: "", observar: "" },
    pain: data?.pain || { objetivo: "", perguntas: "", observar: "" },
    impact: data?.impact || { objetivo: "", perguntas: "", observar: "" },
    criticalEvent: data?.criticalEvent || { objetivo: "", perguntas: "", observar: "" },
    decision: data?.decision || { objetivo: "", perguntas: "", observar: "" }
  };

  const handleChange = (section: keyof SpicedData, field: string, value: string) => {
    if (onChange) {
      onChange({
        ...safeData,
        [section]: {
          ...safeData[section],
          [field]: value
        }
      });
    }
  };

  const rows = [
    { key: 'situation' as const, label: 'S – Situation' },
    { key: 'pain' as const, label: 'P – Pain' },
    { key: 'impact' as const, label: 'I – Impact' },
    { key: 'criticalEvent' as const, label: 'CE – Critical Event' },
    { key: 'decision' as const, label: 'D – Decision' }
  ];

  if (readOnly) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted">
              <th className="p-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Etapa (SPICED)</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Objetivo da etapa</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Perguntas chaves</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">O que observar no lead</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key} className={index % 2 === 1 ? "border-t bg-muted/30" : "border-t"}>
                <td className="p-4 font-medium text-foreground">{row.label}</td>
                <td className="p-4 text-muted-foreground">{safeData[row.key].objetivo}</td>
                <td className="p-4 text-muted-foreground">{safeData[row.key].perguntas}</td>
                <td className="p-4 text-muted-foreground">{safeData[row.key].observar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Tabela SPICED</Label>
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Etapa (SPICED)</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Objetivo da etapa</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Perguntas chaves</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">O que observar no lead</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t">
                <td className="p-3 font-medium">{row.label}</td>
                <td className="p-3">
                  <Input
                    value={safeData[row.key].objetivo}
                    onChange={(e) => handleChange(row.key, 'objetivo', e.target.value)}
                    placeholder={`Objetivo da ${row.label.split(' – ')[1].toLowerCase()}`}
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={safeData[row.key].perguntas}
                    onChange={(e) => handleChange(row.key, 'perguntas', e.target.value)}
                    placeholder="Perguntas-chave"
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={safeData[row.key].observar}
                    onChange={(e) => handleChange(row.key, 'observar', e.target.value)}
                    placeholder="O que observar"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpicedTable;
