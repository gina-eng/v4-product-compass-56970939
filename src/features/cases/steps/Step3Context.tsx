import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FieldShell } from "../components/FieldShell";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { INITIAL_CHALLENGES, RESTRICTIONS } from "../options";
import type { CaseRecord } from "../types";

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const MAX_LEN = 500;

export const Step3Context = ({ record, errors, update }: StepProps) => {
  return (
    <div className="space-y-6">
      <FieldShell
        label="Desafios iniciais que o cliente trouxe"
        required
        error={errors.initialChallenges}
        hint="Marque os principais. Estes tags ajudam a Zyman AI a clusterizar cases com situações parecidas. Use o campo livre para complementar."
      >
        <div className="space-y-3">
          <CheckboxGroup
            options={INITIAL_CHALLENGES}
            value={record.initialChallenges}
            onChange={(initialChallenges) => update({ initialChallenges })}
          />
          <Input
            value={record.initialChallengesOther}
            onChange={(e) => update({ initialChallengesOther: e.target.value })}
            placeholder="Outro desafio (opcional)"
          />
        </div>
      </FieldShell>

      <FieldShell
        label="Contexto do desafio"
        required
        error={errors.problem}
        hint="Descreva o que o cliente trazia como dor e qual foi a causa raiz identificada pela V4 — muitas vezes o que o cliente pede é diferente do que ele precisa."
        counter={`${record.problem.length}/${MAX_LEN}`}
      >
        <Textarea
          value={record.problem}
          maxLength={MAX_LEN}
          onChange={(e) => update({ problem: e.target.value, rootCause: "" })}
          rows={6}
          placeholder="Ex.: a operação queria escalar mídia mas o ROAS não fechava o LTV. No diagnóstico, a V4 identificou que o problema real era oferta sem diferenciação e tracking subnotificando conversões assistidas."
        />
      </FieldShell>

      <FieldShell
        label="Quais eram as restrições do cliente?"
        required
        error={errors.restrictions}
        hint="Selecione todas que se aplicam. O campo abaixo permite descrever uma restrição específica."
      >
        <div className="space-y-3">
          <CheckboxGroup
            options={RESTRICTIONS}
            value={record.restrictions}
            onChange={(restrictions) => update({ restrictions })}
          />
          <Input
            value={record.restrictionsOther}
            onChange={(e) => update({ restrictionsOther: e.target.value })}
            placeholder="Outras restrições (opcional)"
          />
        </div>
      </FieldShell>

    </div>
  );
};
