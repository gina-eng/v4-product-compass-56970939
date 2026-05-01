import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FieldShell } from "../components/FieldShell";
import { SALES_MODELS, SEGMENTS_MOCK, V4_PRODUCTS } from "../options";
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

    </div>
  );
};
