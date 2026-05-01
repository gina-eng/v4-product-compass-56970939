import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "../components/FieldShell";
import { SearchableSelect } from "../components/SearchableSelect";
import {
  BRAZIL_STATES,
  OPERATION_REACH_OPTIONS,
} from "../options";
import type { ClientStatus, OperationReach } from "../options";
import type { CaseRecord } from "../types";
import { formatCnpj } from "../format";
import { listUnits } from "@/features/units/storage";

const STATE_OPTIONS = BRAZIL_STATES.map((s) => s.label);
const STATE_LABEL_TO_VALUE = Object.fromEntries(BRAZIL_STATES.map((s) => [s.label, s.value]));
const STATE_VALUE_TO_LABEL = Object.fromEntries(BRAZIL_STATES.map((s) => [s.value, s.label]));

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

export const Step1Identification = ({ record, errors, update }: StepProps) => {
  const [unitOptions, setUnitOptions] = useState<string[]>([]);

  useEffect(() => {
    void listUnits().then((rows) => setUnitOptions(rows.map((r) => r.name)));
  }, []);

  const updateCollaborator = (index: number, value: string) => {
    const next = [...record.collaborators];
    next[index] = value;
    update({ collaborators: next });
  };

  const addCollaborator = () => {
    if (record.collaborators.length >= 3) return;
    update({ collaborators: [...record.collaborators, ""] });
  };

  const removeCollaborator = (index: number) => {
    update({ collaborators: record.collaborators.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FieldShell label="Email do investidor" required error={errors.ownerEmail}>
          <Input
            type="email"
            value={record.ownerEmail}
            onChange={(e) => update({ ownerEmail: e.target.value })}
            placeholder="seu.email@v4company.com"
            disabled
          />
        </FieldShell>

        <FieldShell label="Unidade V4" required error={errors.v4Unit}>
          <SearchableSelect
            value={record.v4Unit}
            options={unitOptions}
            onChange={(v) => update({ v4Unit: v })}
            placeholder={unitOptions.length ? "Selecione a unidade" : "Nenhuma unidade cadastrada"}
            searchPlaceholder="Buscar unidade..."
            emptyText="Nenhuma unidade encontrada."
          />
        </FieldShell>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FieldShell label="Nome do cliente" required error={errors.clientName}>
          <Input
            value={record.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
            placeholder="Razão social ou nome fantasia"
          />
        </FieldShell>

        <FieldShell label="CNPJ do cliente" required error={errors.clientCnpj}>
          <Input
            value={record.clientCnpj}
            onChange={(e) => update({ clientCnpj: formatCnpj(e.target.value) })}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
          />
        </FieldShell>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <FieldShell label="Cidade da Empresa" error={errors.clientCity} className="md:col-span-2">
          <Input
            value={record.clientCity}
            onChange={(e) => update({ clientCity: e.target.value })}
            placeholder="Ex.: Curitiba"
          />
        </FieldShell>

        <FieldShell label="Estado" required error={errors.clientState}>
          <SearchableSelect
            value={record.clientState ? STATE_VALUE_TO_LABEL[record.clientState] ?? "" : ""}
            options={STATE_OPTIONS}
            onChange={(label) => update({ clientState: label ? STATE_LABEL_TO_VALUE[label] ?? "" : "" })}
            placeholder="UF"
            searchPlaceholder="Buscar estado..."
            emptyText="Estado não encontrado."
          />
        </FieldShell>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FieldShell
          label="Abrangência da operação"
          required
          error={errors.operationReach}
        >
          <Select
            value={record.operationReach}
            onValueChange={(v) => update({ operationReach: v as OperationReach })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a abrangência" />
            </SelectTrigger>
            <SelectContent>
              {OPERATION_REACH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell label="Status atual do cliente" required error={errors.clientStatus}>
          <Select
            value={record.clientStatus}
            onValueChange={(v) => update({ clientStatus: v as ClientStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </FieldShell>
      </div>

      <FieldShell
        label="Pessoas envolvidas no projeto"
        hint="Até 3 emails. Para reconhecimento interno e referência futura — quem outro investidor pode procurar para entender mais sobre esse case."
      >
        <div className="space-y-2">
          {record.collaborators.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => updateCollaborator(index, e.target.value)}
                placeholder="email@v4company.com"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCollaborator(index)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {errors[`collaborators.${index}`] && (
                <span className="text-xs text-destructive">{errors[`collaborators.${index}`]}</span>
              )}
            </div>
          ))}
          {record.collaborators.length < 3 && (
            <Button type="button" variant="outline" size="sm" onClick={addCollaborator}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar pessoa
            </Button>
          )}
        </div>
      </FieldShell>
    </div>
  );
};
