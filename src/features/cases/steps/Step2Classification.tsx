import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isCampaignOpen, listCampaigns } from "@/features/campaigns/storage";
import type { CaseCampaign } from "@/features/campaigns/storage";
import { FieldShell } from "../components/FieldShell";
import { RESULT_TYPE_OPTIONS, SALES_MODELS, SEGMENTS_MOCK, V4_PRODUCTS } from "../options";
import type { SalesModel, V4Product } from "../options";
import type { CaseRecord } from "../types";

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

export const Step2Classification = ({ record, errors, update }: StepProps) => {
  const toggleProduct = (product: V4Product) => {
    const next = record.products.includes(product)
      ? record.products.filter((p) => p !== product)
      : [...record.products, product];
    update({ products: next, primaryDriver: "" });
  };

  const [campaigns, setCampaigns] = useState<CaseCampaign[]>([]);
  useEffect(() => {
    void listCampaigns().then(setCampaigns);
  }, []);

  // Campanhas já vinculadas em algum momento desta edição continuam visíveis
  // mesmo encerradas — assim dá para desfazer uma remoção acidental.
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  useEffect(() => {
    setLinkedIds((prev) => {
      const missing = record.campaignIds.filter((cid) => !prev.includes(cid));
      return missing.length > 0 ? [...prev, ...missing] : prev;
    });
  }, [record.campaignIds]);

  const visibleCampaigns = useMemo(
    () => campaigns.filter((c) => isCampaignOpen(c) || linkedIds.includes(c.id)),
    [campaigns, linkedIds],
  );

  const toggleCampaign = (campaign: CaseCampaign) => {
    const selected = record.campaignIds.includes(campaign.id);
    if (selected) {
      update({ campaignIds: record.campaignIds.filter((cid) => cid !== campaign.id) });
      return;
    }
    // Campanha encerrada não pode ser vinculada pela primeira vez.
    if (!isCampaignOpen(campaign) && !linkedIds.includes(campaign.id)) return;
    update({ campaignIds: [...record.campaignIds, campaign.id] });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <FieldShell
          label="Modelo de venda"
          required
          error={errors.salesModel}
          hint="Define canais, criativos e métricas das próximas etapas."
        >
          <Select
            value={record.salesModel}
            onValueChange={(v) => update({ salesModel: v as SalesModel })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SALES_MODELS.map((model) => (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  title={model.description}
                >
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell
          label="Segmento do cliente"
          required
          error={errors.segment}
          hint="Categoria macro de atuação — ex.: Saúde, E-commerce, SaaS."
        >
          <Select value={record.segment} onValueChange={(v) => update({ segment: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {SEGMENTS_MOCK.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell
          label="Nicho do cliente"
          error={errors.nicho}
          hint="Mais específico que o segmento — ex.: 'Clínicas odontológicas'."
        >
          <Input
            value={record.nicho}
            onChange={(e) => update({ nicho: e.target.value })}
            placeholder="Ex.: Clínicas de medicina integrativa"
          />
        </FieldShell>
      </div>

      <FieldShell
        label="Produtos V4 contratados que contribuíram para o case"
        required
        error={errors.products}
        hint="Marque um ou mais. Cada produto ativa um bloco específico na Etapa 3."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {V4_PRODUCTS.map((product) => {
            const selected = record.products.includes(product.value);
            return (
              <button
                type="button"
                key={product.value}
                onClick={() => toggleProduct(product.value)}
                title={product.tagline}
                className={[
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-all",
                  selected
                    ? `${product.toneClass} shadow-sm`
                    : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                ].join(" ")}
              >
                <span className="text-sm font-semibold">{product.label}</span>
                <span
                  className={[
                    "h-4 w-4 shrink-0 rounded border transition-colors",
                    selected ? "border-current bg-current" : "border-border bg-background",
                  ].join(" ")}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </FieldShell>

      <FieldShell
        label="Tipo de resultado do case"
        required
        error={errors.resultType}
        hint="Define o que será pedido na etapa de resultado. Cases de entrega não precisam de números de vendas."
      >
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tipo de resultado do case">
          {RESULT_TYPE_OPTIONS.map((opt) => {
            const selected = record.resultType === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                role="radio"
                aria-checked={selected}
                onClick={() => update({ resultType: opt.value })}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-all",
                  selected
                    ? "border-primary/60 bg-primary/5 shadow-sm"
                    : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={cn("text-sm", selected ? "font-semibold" : "font-medium")}>
                    {opt.label}
                  </span>
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border transition-colors",
                      selected ? "border-primary bg-primary" : "border-border bg-background",
                    )}
                    aria-hidden
                  />
                </span>
                <span className="text-xs leading-snug text-muted-foreground">{opt.description}</span>
              </button>
            );
          })}
        </div>
      </FieldShell>

      {visibleCampaigns.length > 0 && (
        <FieldShell
          label="Este case faz parte de alguma campanha especial?"
          error={errors.campaignIds}
          hint="Opcional. Marque as campanhas em que este case se encaixa."
        >
          <div className="flex flex-wrap gap-2">
            {visibleCampaigns.map((campaign) => {
              const selected = record.campaignIds.includes(campaign.id);
              const open = isCampaignOpen(campaign);
              return (
                <button
                  type="button"
                  key={campaign.id}
                  aria-pressed={selected}
                  onClick={() => toggleCampaign(campaign)}
                  title={campaign.description || undefined}
                  // Cor da campanha é dado dinâmico do admin — não dá para expressar via classe Tailwind.
                  style={selected && campaign.color ? { borderColor: campaign.color } : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    selected
                      ? "border-primary/60 bg-primary/5 text-foreground shadow-sm"
                      : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {selected ? (
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} aria-hidden />
                  ) : (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
                      style={campaign.color ? { backgroundColor: campaign.color } : undefined}
                      aria-hidden
                    />
                  )}
                  {campaign.name}
                  {!open && (
                    <span className="text-[10px] font-normal text-muted-foreground">(encerrada)</span>
                  )}
                </button>
              );
            })}
          </div>
        </FieldShell>
      )}
    </div>
  );
};
