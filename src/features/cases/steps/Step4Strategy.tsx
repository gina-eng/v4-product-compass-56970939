import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FieldShell } from "../components/FieldShell";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { ChannelInvestmentList } from "../components/ChannelInvestmentList";
import {
  CHANNELS_BY_MODEL,
  CREATIVES_BY_MODEL,
  EXECUTAR_PROFESSIONALS,
  SABER_EXECUTION_OPTIONS,
  V4_PRODUCTS,
} from "../options";
import type { SalesModel } from "../options";
import type { CaseRecord, ExecutarStrategy, SaberDirection } from "../types";

const emptyDirection: SaberDirection = { direction: "", rationale: "", impact: "" };
const emptyStrategy: ExecutarStrategy = { strategy: "", appliedAt: "" };

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const ProductBlock = ({
  product,
  children,
}: {
  product: "saber" | "ter" | "executar" | "potencializar";
  children: React.ReactNode;
}) => {
  const meta = V4_PRODUCTS.find((p) => p.value === product)!;
  return (
    <section className={`rounded-2xl border ${meta.toneClass} p-5`}>
      <header className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          {meta.label}
        </div>
        <span className="text-xs text-muted-foreground">{meta.tagline}</span>
      </header>
      <div className="space-y-5 text-foreground">{children}</div>
    </section>
  );
};

export const Step4Strategy = ({ record, errors, update }: StepProps) => {
  const salesModel = (record.salesModel || "hibrido") as SalesModel;
  const channels = CHANNELS_BY_MODEL[salesModel];
  const creatives = CREATIVES_BY_MODEL[salesModel];

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const patch: Partial<CaseRecord> = {};
    if (
      record.products.includes("saber") &&
      record.saberDirections.length === 0
    ) {
      patch.saberDirections = [{ ...emptyDirection }];
    }
    if (
      record.products.includes("executar") &&
      record.executarStrategies.length === 0
    ) {
      patch.executarStrategies = [{ ...emptyStrategy }];
    }
    if (Object.keys(patch).length > 0) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const direction = record.saberDirections[0] ?? emptyDirection;
  const strategy = record.executarStrategies[0] ?? emptyStrategy;

  const updateDirection = (patch: Partial<SaberDirection>) => {
    const current = record.saberDirections[0] ?? emptyDirection;
    const rest = record.saberDirections.slice(1);
    update({ saberDirections: [{ ...current, ...patch }, ...rest] });
  };
  const updateStrategy = (patch: Partial<ExecutarStrategy>) => {
    const current = record.executarStrategies[0] ?? emptyStrategy;
    const rest = record.executarStrategies.slice(1);
    update({ executarStrategies: [{ ...current, ...patch }, ...rest] });
  };

  if (record.products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-10 text-center">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Selecione os produtos V4 na Etapa 2</p>
        <p className="max-w-md text-xs text-muted-foreground">
          As perguntas desta etapa ramificam conforme os produtos contratados que contribuíram para
          o case.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {record.products.includes("saber") && (
        <ProductBlock product="saber">
          <FieldShell
            label="Direcionamento estratégico e racional"
            required
            error={errors.saberDirections}
            hint="Descreva o direcionamento que destravou o case e o racional por trás. Foque no que de fato moveu o ponteiro — não em recomendações genéricas."
          >
            <Textarea
              rows={4}
              value={direction.direction}
              onChange={(e) => updateDirection({ direction: e.target.value, rationale: "" })}
              placeholder="Ex.: Reposicionar oferta para B2B mid-market — pesquisa mostrou que esse público tinha ticket 3x maior e menos resistência a preço."
            />
          </FieldShell>

          <FieldShell
            label="Resultado / impacto observado"
            hint="Opcional — efeito prático percebido depois que o direcionamento foi aplicado."
          >
            <Textarea
              rows={3}
              value={direction.impact}
              onChange={(e) => updateDirection({ impact: e.target.value })}
              placeholder="Ex.: Time comercial passou a recusar deals fora do ICP — produtividade dobrou."
            />
          </FieldShell>

          <FieldShell
            label="O cliente executou as recomendações?"
            required
            error={errors.saberExecution}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {SABER_EXECUTION_OPTIONS.map((opt) => {
                const selected = record.saberExecution === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => update({ saberExecution: opt.value })}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm transition-all",
                      selected
                        ? "border-primary/60 bg-primary/5 font-semibold shadow-sm"
                        : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </FieldShell>
        </ProductBlock>
      )}

      {record.products.includes("ter") && (
        <ProductBlock product="ter">
          <FieldShell
            label="Percepção de valor gerada pela implementação"
            required
            error={errors.terValuePerception}
            hint="O valor de TER está na ferramenta no ar e em uso. Descreva a mudança que o cliente passou a perceber depois que a implementação entrou em operação."
          >
            <Textarea
              rows={4}
              value={record.terValuePerception}
              onChange={(e) => update({ terValuePerception: e.target.value })}
              placeholder="Ex.: cliente passou a operar com tracking confiável, decisões de mídia deixaram de depender de planilha manual e o time comercial passou a priorizar leads via CRM com SLA claro."
            />
          </FieldShell>
        </ProductBlock>
      )}

      {record.products.includes("executar") && (
        <ProductBlock product="executar">
          <FieldShell
            label="Profissionais V4 alocados no case"
            required
            error={errors.executarProfessionals}
            hint="Selecione todos os profissionais que efetivamente trabalharam neste case. Em EXECUTAR, o que foi vendido é alocação — esse campo é a base para cruzar investimento × resultado."
          >
            <CheckboxGroup
              options={EXECUTAR_PROFESSIONALS}
              value={record.executarProfessionals}
              onChange={(executarProfessionals) => update({ executarProfessionals })}
              columns={2}
            />
          </FieldShell>

          <FieldShell
            label="Canais de mídia operados"
            required
            error={errors.executarChannels}
            hint={`Ative cada canal e informe investimento e receita gerada para validar o ROAS direto. Opções ajustadas para o modelo ${
              salesModel === "hibrido" ? "Híbrido" : salesModel.replace("_", " ")
            }.`}
          >
            <ChannelInvestmentList
              options={channels}
              value={record.executarChannels}
              errors={errors}
              onChange={(executarChannels) => update({ executarChannels })}
            />
          </FieldShell>

          <FieldShell
            label="Tipos de criativo principais utilizados"
            required
            error={errors.executarCreatives}
          >
            <CheckboxGroup
              options={creatives}
              value={record.executarCreatives}
              onChange={(executarCreatives) => update({ executarCreatives })}
              columns={2}
            />
          </FieldShell>

          <FieldShell
            label="Como foi a comunicação dos criativos"
            required
            error={errors.executarCreativesCommunication}
            hint="Tom de voz, mensagem central e gancho usados nas peças. Texto curto."
          >
            <Textarea
              rows={3}
              value={record.executarCreativesCommunication}
              onChange={(e) =>
                update({ executarCreativesCommunication: e.target.value })
              }
              placeholder='Ex.: tom direto e provocativo, mensagem central "menos esforço pra fechar mês", gancho com prova social de empresas pares.'
            />
          </FieldShell>

          <FieldShell
            label="Estratégia aplicada e onde foi aplicada"
            required
            error={errors.executarStrategies}
            hint="A jogada que efetivamente moveu o ponteiro. Foque no que foi diferente do que o cliente fazia antes."
          >
            <Textarea
              rows={4}
              value={strategy.strategy}
              onChange={(e) => updateStrategy({ strategy: e.target.value, appliedAt: "" })}
              placeholder="Ex.: Funil de retargeting com público de carrinho abandonado — Meta Ads, base de últimos 30 dias com criativos de prova social."
            />
          </FieldShell>
        </ProductBlock>
      )}

      {record.products.includes("potencializar") && (
        <ProductBlock product="potencializar">
          <FieldShell
            label="Modelo de valor percebido aplicado"
            required
            error={errors.potencializarValueModel}
            hint="Como foi estruturado o sucesso direcionado e a métrica de valor para o cliente?"
          >
            <Textarea
              rows={4}
              value={record.potencializarValueModel}
              onChange={(e) => update({ potencializarValueModel: e.target.value })}
            />
          </FieldShell>

          <FieldShell
            label="Indicador de valor percebido acordado com o cliente"
            required
            error={errors.potencializarIndicator}
          >
            <Input
              value={record.potencializarIndicator}
              onChange={(e) => update({ potencializarIndicator: e.target.value })}
              placeholder="Ex.: NPS, payback, % de meta atingida"
            />
          </FieldShell>
        </ProductBlock>
      )}
    </div>
  );
};
