# Zyman AI (Cases) — Implementation Guide

Documento de especificação e implementação completa da feature **Zyman AI (Cases)** para replicar em outro repositório.

A feature é um sistema de captura, organização e exploração de cases de clientes V4 — pensado para servir três audiências: vendedores buscando munição comercial, operação buscando referência de estratégia, e ingestão estruturada para uma camada de IA. Captura segue um wizard de 6 etapas com lógica condicional por produto V4 e modelo de venda.

---

## 1. Pré-requisitos do projeto destino

Esta feature pressupõe um projeto **Vite + React 18 + TypeScript + TailwindCSS + shadcn/ui + react-router-dom**. Todas as dependências usadas já vêm com a instalação padrão do shadcn:

- `react-router-dom` para roteamento
- `lucide-react` para ícones
- `@radix-ui/*` (via shadcn) para Dialog, Popover, Select, AlertDialog, Tabs
- `cmdk` (via shadcn Command) para a busca dentro do combobox
- `tailwindcss-animate` para `animate-fade-in`

**Componentes shadcn que precisam estar gerados:**
`button`, `input`, `textarea`, `card`, `select`, `tabs`, `dialog`, `alert-dialog`, `command`, `popover`, `toast` + hook `use-toast`, `toaster`.

**Tema:** o projeto usa cores customizadas dos produtos V4 no `index.css` via tokens CSS:

```css
--saber: 348 83% 47%;
--saber-foreground: 0 0% 100%;
--ter: 142 71% 45%;
--ter-foreground: 0 0% 100%;
--executar: 25 95% 53%;
--executar-foreground: 0 0% 100%;
--potencializar: 262 52% 47%;
--potencializar-foreground: 0 0% 100%;
```

E o `tailwind.config.ts` precisa expor essas como `colors.saber`, `colors.ter`, `colors.executar`, `colors.potencializar` com `DEFAULT` e `foreground`.

**Auth:** o código importa de `@/integrations/supabase/client` e `@/lib/auth` (com `LOCAL_PREVIEW_EMAIL` e `isLocalPreviewAuthEnabled`). Se o projeto destino não tiver Supabase, basta substituir por uma função que retorna o email do usuário atual.

---

## 2. Decisões de arquitetura

- **Fonte de verdade no front:** localStorage com chave `v4-cases-v1`. Migração automática nos campos que mudaram durante o desenvolvimento.
- **Validação:** flag `BYPASS_VALIDATION = true` em `validation.ts` deixa o wizard livre. Trocar para `false` antes de publicar.
- **Estado do wizard:** `react-hook-form` não é usado — controlado por `useState` único de `CaseRecord` no `CaseForm`. Auto-save com debounce de 600ms.
- **Catálogo de métricas:** `METRICS_BY_MODEL` em `options.ts` é o catálogo. Cada métrica tem `unit` (currency/percent/number/days) + `direction` (higher_is_better/lower_is_better) — direção determina cor da variação.
- **Busca tolerante:** Levenshtein adaptativo + normalização NFD em `search.ts`.
- **Read-only vs editor:** `/cases/:id` mostra detalhe; `/cases/:id/editar` abre o wizard. Rascunhos sempre redirecionam para o editor.

---

## 3. Estrutura de arquivos a criar

```
src/
├── features/
│   └── cases/
│       ├── components/
│       │   ├── ChannelInvestmentList.tsx
│       │   ├── CheckboxGroup.tsx
│       │   ├── FieldShell.tsx
│       │   ├── SearchableSelect.tsx
│       │   └── StepIndicator.tsx
│       ├── steps/
│       │   ├── Step1Identification.tsx
│       │   ├── Step2Classification.tsx
│       │   ├── Step3Context.tsx
│       │   ├── Step4Strategy.tsx
│       │   ├── Step5Results.tsx
│       │   └── Step6Evidence.tsx
│       ├── format.ts
│       ├── options.ts
│       ├── search.ts
│       ├── seed.ts
│       ├── storage.ts
│       ├── types.ts
│       └── validation.ts
└── pages/
    ├── CaseDetail.tsx
    ├── CaseForm.tsx
    └── Cases.tsx
```

E modificações em `src/App.tsx` (rotas) e `src/components/Layout.tsx` ou equivalente (item de menu).

---

## 4. Modificações em arquivos existentes

### 4.1 `src/App.tsx` — adicionar rotas

```tsx
// imports
import Cases from "./pages/Cases";
import CaseForm from "./pages/CaseForm";
import CaseDetail from "./pages/CaseDetail";

// dentro de <Routes> protegidas:
<Route path="/cases" element={<Cases />} />
<Route path="/cases/novo" element={<CaseForm />} />
<Route path="/cases/:id" element={<CaseDetail />} />
<Route path="/cases/:id/editar" element={<CaseForm />} />
```

### 4.2 `src/components/Layout.tsx` (ou seu menu lateral) — adicionar item

```tsx
import { Sparkles } from "lucide-react";

// no array de itens de navegação:
{ title: "Zyman AI (Cases)", url: "/cases", icon: Sparkles }
```

---

## 5. Conteúdo dos arquivos

### 5.1 Catálogo de opções (options.ts)

`src/features/cases/options.ts`

```ts
export type SalesModel = "inside_sales" | "ecommerce" | "pdv" | "hibrido";
export type V4Product = "saber" | "ter" | "executar" | "potencializar";
export type ClientStatus = "ativo" | "inativo";
export type PreviousAttempt =
  | "agencia"
  | "interna"
  | "freelancer"
  | "nao";
export type CaseStatus = "rascunho" | "completo" | "sem_evidencia";

export const SALES_MODELS: { value: SalesModel; label: string; description: string }[] = [
  {
    value: "inside_sales",
    label: "Inside Sales",
    description: "Vendas consultivas com SDR/closer e ciclo de venda mais longo.",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    description: "Conversão direta no checkout, foco em ROAS e ticket médio.",
  },
  {
    value: "pdv",
    label: "PDV",
    description: "Operação física com fluxo de loja e venda presencial.",
  },
  {
    value: "hibrido",
    label: "Híbrido",
    description: "Combina dois ou mais modelos de venda no mesmo cliente.",
  },
];

export const V4_PRODUCTS: {
  value: V4Product;
  label: string;
  tagline: string;
  toneClass: string;
}[] = [
  {
    value: "saber",
    label: "SABER",
    tagline: "Consultoria e diagnóstico estratégico",
    toneClass: "border-saber/40 bg-saber/5 text-saber",
  },
  {
    value: "ter",
    label: "TER",
    tagline: "Implementação e tecnologia",
    toneClass: "border-ter/40 bg-ter/5 text-ter",
  },
  {
    value: "executar",
    label: "EXECUTAR",
    tagline: "Operação de mídia e performance",
    toneClass: "border-executar/40 bg-executar/5 text-executar",
  },
  {
    value: "potencializar",
    label: "POTENCIALIZAR",
    tagline: "Sucesso direcionado e valor percebido",
    toneClass: "border-potencializar/40 bg-potencializar/5 text-potencializar",
  },
];

export type OperationReach =
  | "local"
  | "regional"
  | "estadual"
  | "nacional"
  | "internacional";

export const OPERATION_REACH_OPTIONS: { value: OperationReach; label: string; description: string }[] = [
  { value: "local", label: "Local", description: "Atende uma cidade ou bairro." },
  { value: "regional", label: "Regional", description: "Atende várias cidades da mesma região." },
  { value: "estadual", label: "Estadual", description: "Atende um estado inteiro." },
  { value: "nacional", label: "Nacional", description: "Opera em todo o Brasil." },
  { value: "internacional", label: "Internacional", description: "Atende outros países." },
];

export const BRAZIL_STATES: { value: string; label: string }[] = [
  { value: "AC", label: "AC — Acre" },
  { value: "AL", label: "AL — Alagoas" },
  { value: "AP", label: "AP — Amapá" },
  { value: "AM", label: "AM — Amazonas" },
  { value: "BA", label: "BA — Bahia" },
  { value: "CE", label: "CE — Ceará" },
  { value: "DF", label: "DF — Distrito Federal" },
  { value: "ES", label: "ES — Espírito Santo" },
  { value: "GO", label: "GO — Goiás" },
  { value: "MA", label: "MA — Maranhão" },
  { value: "MT", label: "MT — Mato Grosso" },
  { value: "MS", label: "MS — Mato Grosso do Sul" },
  { value: "MG", label: "MG — Minas Gerais" },
  { value: "PA", label: "PA — Pará" },
  { value: "PB", label: "PB — Paraíba" },
  { value: "PR", label: "PR — Paraná" },
  { value: "PE", label: "PE — Pernambuco" },
  { value: "PI", label: "PI — Piauí" },
  { value: "RJ", label: "RJ — Rio de Janeiro" },
  { value: "RN", label: "RN — Rio Grande do Norte" },
  { value: "RS", label: "RS — Rio Grande do Sul" },
  { value: "RO", label: "RO — Rondônia" },
  { value: "RR", label: "RR — Roraima" },
  { value: "SC", label: "SC — Santa Catarina" },
  { value: "SP", label: "SP — São Paulo" },
  { value: "SE", label: "SE — Sergipe" },
  { value: "TO", label: "TO — Tocantins" },
];

export const V4_UNITS_MOCK: string[] = [
  "V4 Matriz",
  "V4 São Paulo - Pinheiros",
  "V4 São Paulo - Faria Lima",
  "V4 Rio de Janeiro - Barra",
  "V4 Belo Horizonte",
  "V4 Curitiba",
  "V4 Porto Alegre",
  "V4 Florianópolis",
  "V4 Brasília",
  "V4 Salvador",
  "V4 Recife",
  "V4 Fortaleza",
];

export const SEGMENTS_MOCK: string[] = [
  "Saúde",
  "Educação",
  "Varejo físico",
  "E-commerce",
  "SaaS",
  "Indústria",
  "Serviços B2B",
  "Imobiliário",
  "Alimentação",
  "Beleza e estética",
  "Financeiro",
  "Automotivo",
  "Construção civil",
  "Outros",
];

export const INITIAL_CHALLENGES = [
  "Baixo volume de leads / vendas",
  "CAC ou CPL muito alto",
  "Mídia paga sem escalar",
  "Conversão baixa (LP, e-commerce, loja)",
  "Funil comercial não estruturado",
  "Time comercial não converte os leads gerados",
  "Falta de previsibilidade de receita",
  "Marca / posicionamento confuso ou pouco diferenciado",
  "Dependência excessiva de poucos canais",
  "Dados / tracking não confiáveis",
];

export const RESTRICTIONS = [
  "Orçamento limitado",
  "Time pequeno ou sem expertise",
  "Ferramenta/stack legada",
  "Prazo curto",
  "Política interna ou aprovações",
  "Dados/tracking inexistentes ou ruins",
];

export const PREVIOUS_ATTEMPT_OPTIONS: { value: PreviousAttempt; label: string }[] = [
  { value: "agencia", label: "Sim, com outra agência/consultoria" },
  { value: "interna", label: "Sim, internamente" },
  { value: "freelancer", label: "Sim, com freelancer" },
  { value: "nao", label: "Não, V4 foi a primeira tentativa estruturada" },
];

export const SABER_EXECUTION_OPTIONS = [
  { value: "integral", label: "Executou integralmente" },
  { value: "parcial", label: "Executou parcialmente" },
  { value: "em_execucao", label: "Está em execução" },
];

export const EXECUTAR_PROFESSIONALS = [
  "Profissional de Audiovisual",
  "Profissional de Business Intelligence",
  "Profissional de CRM",
  "Profissional de Designer Gráfico",
  "Profissional de Gestão de Mídia Paga",
  "Profissional de Marketplace",
  "Profissional de Pré-Vendas (SDR)",
  "Profissional de Redação Publicitária",
  "Profissional de Sales Enablement",
  "Profissional de SEO",
  "Profissional de Social Media",
  "Profissional de Vendas (BDR)",
  "Profissional de Web Design",
];

const ECOM_CHANNELS = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Marketplace Ads",
];
const IS_CHANNELS = [
  "Meta Ads",
  "Google Ads",
  "LinkedIn Ads",
  "YouTube Ads",
];
const PDV_CHANNELS = [
  "Meta Ads",
  "Google Ads (local)",
  "Influenciador local",
  "Mídia OOH",
];

export const CHANNELS_BY_MODEL: Record<SalesModel, string[]> = {
  ecommerce: ECOM_CHANNELS,
  inside_sales: IS_CHANNELS,
  pdv: PDV_CHANNELS,
  hibrido: Array.from(new Set([...ECOM_CHANNELS, ...IS_CHANNELS, ...PDV_CHANNELS])),
};

export const CREATIVE_TYPES = [
  "UGC",
  "Demonstração de produto/serviço",
  "Oferta/promoção",
  "Depoimento de cliente",
  "Educacional/autoridade",
  "Estático/anúncio direto",
];

// Mantida com a mesma forma para retrocompatibilidade — todos os modelos usam o mesmo conjunto.
export const CREATIVES_BY_MODEL: Record<SalesModel, string[]> = {
  ecommerce: CREATIVE_TYPES,
  inside_sales: CREATIVE_TYPES,
  pdv: CREATIVE_TYPES,
  hibrido: CREATIVE_TYPES,
};

export type MetricUnit = "currency" | "percent" | "number" | "days";
export type MetricDirection = "higher_is_better" | "lower_is_better";

export interface MetricOption {
  value: string;
  label: string;
  unit: MetricUnit;
  direction: MetricDirection;
}

export const getMetricDirection = (metricKey: string): MetricDirection => {
  // CAC, CPL e ciclo de venda → menor é melhor.
  if (["cpl", "cac", "ciclo_venda"].includes(metricKey)) return "lower_is_better";
  return "higher_is_better";
};

const ECOM_METRICS: MetricOption[] = [
  { value: "roas", label: "ROAS", unit: "number", direction: "higher_is_better" },
  { value: "receita", label: "Receita/Faturamento", unit: "currency", direction: "higher_is_better" },
  { value: "vol_pedidos", label: "Volume de pedidos", unit: "number", direction: "higher_is_better" },
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better" },
  { value: "conv_rate", label: "Taxa de conversão", unit: "percent", direction: "higher_is_better" },
];
const IS_METRICS: MetricOption[] = [
  { value: "cpl", label: "CPL", unit: "currency", direction: "lower_is_better" },
  { value: "vol_leads", label: "Volume de leads", unit: "number", direction: "higher_is_better" },
  { value: "vol_vendas", label: "Volume de vendas", unit: "number", direction: "higher_is_better" },
  { value: "receita", label: "Receita", unit: "currency", direction: "higher_is_better" },
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better" },
];
const PDV_METRICS: MetricOption[] = [
  { value: "receita", label: "Receita", unit: "currency", direction: "higher_is_better" },
  { value: "vol_vendas", label: "Volume de vendas", unit: "number", direction: "higher_is_better" },
  { value: "ticket_medio", label: "Ticket médio", unit: "currency", direction: "higher_is_better" },
  { value: "vol_atendimentos", label: "Volume de visitas/atendimentos", unit: "number", direction: "higher_is_better" },
];

export const METRICS_BY_MODEL: Record<SalesModel, MetricOption[]> = {
  ecommerce: ECOM_METRICS,
  inside_sales: IS_METRICS,
  pdv: PDV_METRICS,
  hibrido: (() => {
    const map = new Map<string, MetricOption>();
    [
      ...ECOM_METRICS,
      ...IS_METRICS,
      ...PDV_METRICS,
      {
        value: "receita",
        label: "Receita/Faturamento",
        unit: "currency",
        direction: "higher_is_better",
      } as MetricOption,
    ].forEach((m) => map.set(m.value, m));
    return Array.from(map.values());
  })(),
};

export const TIME_TO_RESULT_OPTIONS = [
  { value: "1m", label: "1 mês" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "9m", label: "9 meses" },
  { value: "12m", label: "12 meses" },
  { value: "12m+", label: "Mais de 12 meses" },
];

export const STEPS = [
  { id: 1, key: "identification", title: "Identificação", subtitle: "Quem registra e qual cliente." },
  { id: 2, key: "classification", title: "Classificação", subtitle: "Modelo de venda, segmento e produtos V4." },
  { id: 3, key: "context", title: "Contexto do desafio", subtitle: "Problema, causa raiz e restrições." },
  { id: 4, key: "strategy", title: "Estratégia aplicada", subtitle: "O que foi entregue para gerar o resultado." },
  { id: 5, key: "results", title: "Resultado quantitativo", subtitle: "Antes vs. depois com números reais." },
  { id: 6, key: "evidence", title: "Evidências", subtitle: "Links e contexto complementar." },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
```

### 5.2 Tipos do CaseRecord (types.ts)

`src/features/cases/types.ts`

```ts
import type {
  CaseStatus,
  ClientStatus,
  OperationReach,
  PreviousAttempt,
  SalesModel,
  V4Product,
} from "./options";

export interface SecondaryMetric {
  name: string;
  before: string;
  after: string;
}

export interface SaberDirection {
  direction: string;
  rationale: string;
  impact: string;
}

export interface ExecutarStrategy {
  strategy: string;
  appliedAt: string;
}

export interface ChannelInvestment {
  channel: string;
  investment: string;
  revenue: string;
}

export interface PrimaryMetricEntry {
  metricKey: string;
  label: string;
  unit: string;
  before: string;
  after: string;
}

export interface CaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  currentStep: number;

  // Etapa 1 — identificação
  ownerEmail: string;
  v4Unit: string;
  clientName: string;
  clientCnpj: string;
  clientStatus: ClientStatus | "";
  clientCity: string;
  clientState: string;
  operationReach: OperationReach | "";
  collaborators: string[];

  // Etapa 2 — classificação
  salesModel: SalesModel | "";
  segment: string;
  products: V4Product[];
  primaryDriver: V4Product | "";

  // Etapa 3 — contexto
  initialChallenges: string[];
  initialChallengesOther: string;
  problem: string;
  rootCause: string;
  restrictions: string[];
  restrictionsOther: string;
  previousAttempt: PreviousAttempt | "";
  previousFailureReason: string;

  // Etapa 4 — estratégia
  // SABER
  saberDirections: SaberDirection[];
  saberExecution: string;
  // TER
  terValuePerception: string;
  // EXECUTAR
  executarProfessionals: string[];
  executarChannels: ChannelInvestment[];
  executarCreatives: string[];
  executarCreativesCommunication: string;
  executarStrategies: ExecutarStrategy[];
  // POTENCIALIZAR
  potencializarValueModel: string;
  potencializarIndicator: string;

  // Etapa 5 — resultado
  timeToResult: string;
  primaryMetrics: PrimaryMetricEntry[];
  secondaryMetrics: SecondaryMetric[];
  // Bloco ROAS condicional
  mediaInvestment: string;
  attributedRevenue: string;

  // Etapa 6 — evidências
  dashboardUrl: string;
  presentationUrl: string;
  testimonialUrl: string;
  finalNotes: string;
}

export const emptyCase = (ownerEmail = ""): CaseRecord => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `case-${Date.now()}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "rascunho",
  currentStep: 1,
  ownerEmail,
  v4Unit: "",
  clientName: "",
  clientCnpj: "",
  clientStatus: "",
  clientCity: "",
  clientState: "",
  operationReach: "",
  collaborators: [],
  salesModel: "",
  segment: "",
  products: [],
  primaryDriver: "",
  initialChallenges: [],
  initialChallengesOther: "",
  problem: "",
  rootCause: "",
  restrictions: [],
  restrictionsOther: "",
  previousAttempt: "",
  previousFailureReason: "",
  saberDirections: [],
  saberExecution: "",
  terValuePerception: "",
  executarProfessionals: [],
  executarChannels: [],
  executarCreatives: [],
  executarCreativesCommunication: "",
  executarStrategies: [],
  potencializarValueModel: "",
  potencializarIndicator: "",
  timeToResult: "",
  primaryMetrics: [],
  secondaryMetrics: [],
  mediaInvestment: "",
  attributedRevenue: "",
  dashboardUrl: "",
  presentationUrl: "",
  testimonialUrl: "",
  finalNotes: "",
});
```

### 5.3 Persistência localStorage com migrações (storage.ts)

`src/features/cases/storage.ts`

```ts
import type { CaseRecord, ChannelInvestment, PrimaryMetricEntry } from "./types";

const STORAGE_KEY = "v4-cases-v1";

const migrateRecord = (raw: unknown): CaseRecord => {
  const record = (raw ?? {}) as Partial<CaseRecord> & Record<string, unknown>;
  const legacyChannels = record.executarChannels as unknown;
  let executarChannels: ChannelInvestment[] = [];
  if (Array.isArray(legacyChannels)) {
    executarChannels = legacyChannels.map((entry) => {
      if (typeof entry === "string") {
        return { channel: entry, investment: "", revenue: "" };
      }
      const obj = entry as Partial<ChannelInvestment>;
      return {
        channel: obj.channel ?? "",
        investment: obj.investment ?? "",
        revenue: obj.revenue ?? "",
      };
    });
  }
  let primaryMetrics: PrimaryMetricEntry[] = [];
  if (Array.isArray(record.primaryMetrics)) {
    primaryMetrics = (record.primaryMetrics as PrimaryMetricEntry[]).map((m) => ({
      metricKey: m.metricKey ?? "",
      label: m.label ?? "",
      unit: m.unit ?? "number",
      before: m.before ?? "",
      after: m.after ?? "",
    }));
  } else if (record.primaryMetric || record.primaryMetricLabel) {
    // legado: um único objeto desempacotado
    const legacy = record as Record<string, string | undefined>;
    primaryMetrics = [
      {
        metricKey: legacy.primaryMetric ?? "",
        label: legacy.primaryMetricLabel ?? "",
        unit: legacy.primaryMetricUnit ?? "number",
        before: legacy.primaryMetricBefore ?? "",
        after: legacy.primaryMetricAfter ?? "",
      },
    ];
  }

  return {
    ...record,
    executarChannels,
    primaryMetrics,
  } as CaseRecord;
};

const safeParse = (raw: string | null): CaseRecord[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateRecord);
  } catch {
    return [];
  }
};

export const listCases = (): CaseRecord[] => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const getCase = (id: string): CaseRecord | undefined =>
  listCases().find((c) => c.id === id);

export const upsertCase = (record: CaseRecord): CaseRecord => {
  const all = listCases();
  const index = all.findIndex((c) => c.id === record.id);
  const updated: CaseRecord = { ...record, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    all[index] = updated;
  } else {
    all.unshift(updated);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
};

export const deleteCase = (id: string): void => {
  const all = listCases().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};
```

### 5.4 Validação por etapa (validation.ts)

`src/features/cases/validation.ts`

```ts
import type { CaseRecord } from "./types";

export interface StepValidation {
  isValid: boolean;
  errors: Partial<Record<keyof CaseRecord | string, string>>;
}

// Flip para `false` antes de publicar para reativar todas as validações.
const BYPASS_VALIDATION = true;

const isNonEmpty = (v: string | undefined | null) => Boolean(v && v.trim().length > 0);
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/.+/i;

const runStepValidation = (step: number, record: CaseRecord): StepValidation => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!isNonEmpty(record.ownerEmail) || !emailRegex.test(record.ownerEmail))
      errors.ownerEmail = "Email do investidor é obrigatório.";
    if (!isNonEmpty(record.v4Unit)) errors.v4Unit = "Selecione a unidade V4.";
    if (!isNonEmpty(record.clientName)) errors.clientName = "Informe o nome do cliente.";
    if (!cnpjRegex.test(record.clientCnpj))
      errors.clientCnpj = "CNPJ no formato 00.000.000/0000-00.";
    if (!isNonEmpty(record.clientStatus)) errors.clientStatus = "Informe o status do cliente.";
    if (!isNonEmpty(record.clientState)) errors.clientState = "Selecione o estado de atuação.";
    if (!isNonEmpty(record.operationReach))
      errors.operationReach = "Selecione a abrangência da operação.";
    record.collaborators.forEach((c, i) => {
      if (c && !emailRegex.test(c)) errors[`collaborators.${i}`] = "Email inválido.";
    });
  }

  if (step === 2) {
    if (!isNonEmpty(record.salesModel)) errors.salesModel = "Selecione o modelo de venda.";
    if (!isNonEmpty(record.segment)) errors.segment = "Selecione o segmento.";
    if (record.products.length === 0)
      errors.products = "Marque ao menos um produto V4 envolvido.";
    if (record.products.length > 1 && !isNonEmpty(record.primaryDriver))
      errors.primaryDriver = "Indique qual produto foi o principal motor do resultado.";
  }

  if (step === 3) {
    if (record.initialChallenges.length === 0 && !isNonEmpty(record.initialChallengesOther))
      errors.initialChallenges = "Selecione ao menos um desafio inicial.";
    if (!isNonEmpty(record.problem)) errors.problem = "Descreva o problema do cliente.";
    if (record.problem.length > 500) errors.problem = "Limite de 500 caracteres.";
    if (!isNonEmpty(record.rootCause)) errors.rootCause = "Descreva a causa raiz identificada.";
    if (record.rootCause.length > 500) errors.rootCause = "Limite de 500 caracteres.";
    if (record.restrictions.length === 0 && !isNonEmpty(record.restrictionsOther))
      errors.restrictions = "Selecione pelo menos uma restrição.";
    if (!isNonEmpty(record.previousAttempt))
      errors.previousAttempt = "Indique se o cliente já havia tentado resolver antes.";
    if (
      record.previousAttempt &&
      record.previousAttempt !== "nao" &&
      !isNonEmpty(record.previousFailureReason)
    )
      errors.previousFailureReason = "Descreva o que não funcionou anteriormente.";
  }

  if (step === 4) {
    if (record.products.includes("saber")) {
      const filledDirections = record.saberDirections.filter(
        (d) => isNonEmpty(d.direction) && isNonEmpty(d.rationale),
      );
      if (filledDirections.length === 0)
        errors.saberDirections = "Adicione ao menos um direcionamento estratégico.";
      record.saberDirections.forEach((d, i) => {
        const partial =
          isNonEmpty(d.direction) || isNonEmpty(d.rationale) || isNonEmpty(d.impact);
        const valid = isNonEmpty(d.direction) && isNonEmpty(d.rationale);
        if (partial && !valid)
          errors[`saberDirections.${i}`] =
            "Preencha pelo menos o direcionamento e o motivo.";
      });
      if (!isNonEmpty(record.saberExecution))
        errors.saberExecution = "Indique como o cliente executou as recomendações.";
    }
    if (record.products.includes("ter")) {
      if (!isNonEmpty(record.terValuePerception))
        errors.terValuePerception = "Descreva a percepção de valor gerada pela implementação.";
    }
    if (record.products.includes("executar")) {
      if (record.executarProfessionals.length === 0)
        errors.executarProfessionals = "Selecione ao menos um profissional V4 alocado.";
      const validChannels = record.executarChannels.filter(
        (c) => isNonEmpty(c.channel) && isNonEmpty(c.investment) && isNonEmpty(c.revenue),
      );
      if (validChannels.length === 0)
        errors.executarChannels =
          "Adicione ao menos um canal com investimento e receita preenchidos.";
      record.executarChannels.forEach((c, i) => {
        const filled =
          isNonEmpty(c.channel) || isNonEmpty(c.investment) || isNonEmpty(c.revenue);
        const valid =
          isNonEmpty(c.channel) && isNonEmpty(c.investment) && isNonEmpty(c.revenue);
        if (filled && !valid)
          errors[`executarChannels.${i}`] = "Preencha canal, investimento e receita.";
      });
      if (record.executarCreatives.length === 0)
        errors.executarCreatives = "Marque ao menos um tipo de criativo.";
      if (!isNonEmpty(record.executarCreativesCommunication))
        errors.executarCreativesCommunication =
          "Descreva brevemente a comunicação dos criativos.";
      const validStrategies = record.executarStrategies.filter(
        (s) => isNonEmpty(s.strategy) && isNonEmpty(s.appliedAt),
      );
      if (validStrategies.length === 0)
        errors.executarStrategies = "Adicione ao menos uma estratégia aplicada.";
      record.executarStrategies.forEach((s, i) => {
        const partial = isNonEmpty(s.strategy) || isNonEmpty(s.appliedAt);
        const valid = isNonEmpty(s.strategy) && isNonEmpty(s.appliedAt);
        if (partial && !valid)
          errors[`executarStrategies.${i}`] =
            "Preencha a estratégia e onde foi aplicada.";
      });
    }
    if (record.products.includes("potencializar")) {
      if (!isNonEmpty(record.potencializarValueModel))
        errors.potencializarValueModel = "Descreva o modelo de valor percebido.";
      if (!isNonEmpty(record.potencializarIndicator))
        errors.potencializarIndicator = "Informe o indicador de valor acordado.";
    }
  }

  if (step === 5) {
    if (!isNonEmpty(record.timeToResult)) errors.timeToResult = "Selecione o tempo até o resultado.";
    const validPrimary = record.primaryMetrics.filter(
      (m) => isNonEmpty(m.metricKey) && isNonEmpty(m.before) && isNonEmpty(m.after),
    );
    if (validPrimary.length === 0)
      errors.primaryMetrics =
        "Adicione ao menos uma métrica principal com valores antes e depois.";
    record.primaryMetrics.forEach((m, i) => {
      const partial =
        isNonEmpty(m.metricKey) || isNonEmpty(m.before) || isNonEmpty(m.after);
      const valid =
        isNonEmpty(m.metricKey) && isNonEmpty(m.before) && isNonEmpty(m.after);
      if (partial && !valid)
        errors[`primaryMetrics.${i}`] = "Preencha métrica e os dois valores.";
    });
    record.secondaryMetrics.forEach((m, i) => {
      const partial = isNonEmpty(m.name) || isNonEmpty(m.before) || isNonEmpty(m.after);
      const complete = isNonEmpty(m.name) && isNonEmpty(m.before) && isNonEmpty(m.after);
      if (partial && !complete) errors[`secondaryMetrics.${i}`] = "Preencha todos os campos da métrica.";
    });
    if (record.products.includes("executar")) {
      if (!isNonEmpty(record.mediaInvestment))
        errors.mediaInvestment = "Informe o investimento total em mídia.";
      if (!isNonEmpty(record.attributedRevenue))
        errors.attributedRevenue = "Informe a receita atribuída.";
    }
  }

  if (step === 6) {
    if (record.dashboardUrl && !urlRegex.test(record.dashboardUrl))
      errors.dashboardUrl = "URL inválida.";
    if (record.presentationUrl && !urlRegex.test(record.presentationUrl))
      errors.presentationUrl = "URL inválida.";
    if (record.testimonialUrl && !urlRegex.test(record.testimonialUrl))
      errors.testimonialUrl = "URL inválida.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep = (step: number, record: CaseRecord): StepValidation => {
  if (BYPASS_VALIDATION) return { isValid: true, errors: {} };
  return runStepValidation(step, record);
};

export type StepCompletion = "empty" | "partial" | "complete";

const stepFieldKeys: Record<number, (keyof CaseRecord)[]> = {
  1: [
    "v4Unit",
    "clientName",
    "clientCnpj",
    "clientStatus",
    "clientCity",
    "clientState",
    "operationReach",
  ],
  2: ["salesModel", "segment", "products", "primaryDriver"],
  3: [
    "initialChallenges",
    "initialChallengesOther",
    "problem",
    "rootCause",
    "restrictions",
    "restrictionsOther",
    "previousAttempt",
    "previousFailureReason",
  ],
  4: [
    "saberDirections",
    "saberExecution",
    "terValuePerception",
    "executarProfessionals",
    "executarChannels",
    "executarCreatives",
    "executarCreativesCommunication",
    "executarStrategies",
    "potencializarValueModel",
    "potencializarIndicator",
  ],
  5: [
    "timeToResult",
    "primaryMetrics",
    "mediaInvestment",
    "attributedRevenue",
  ],
  6: ["dashboardUrl", "presentationUrl", "testimonialUrl", "finalNotes"],
};

const hasAnyAnswerForStep = (step: number, record: CaseRecord): boolean => {
  if (
    step === 5 &&
    (record.primaryMetrics.some((m) => m.metricKey || m.before || m.after) ||
      record.secondaryMetrics.some((m) => m.name || m.before || m.after))
  ) {
    return true;
  }
  if (
    step === 4 &&
    (record.saberDirections.some((d) => d.direction || d.rationale || d.impact) ||
      record.executarStrategies.some((s) => s.strategy || s.appliedAt) ||
      record.executarChannels.some((c) => c.channel || c.investment || c.revenue))
  ) {
    return true;
  }
  const keys = stepFieldKeys[step] ?? [];
  return keys.some((key) => {
    const value = record[key];
    if (
      key === "saberDirections" ||
      key === "executarStrategies" ||
      key === "executarChannels" ||
      key === "primaryMetrics"
    )
      return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return Boolean(value);
  });
};

export const getStepCompletion = (step: number, record: CaseRecord): StepCompletion => {
  const isComplete = runStepValidation(step, record).isValid;
  if (isComplete) return "complete";
  return hasAnyAnswerForStep(step, record) ? "partial" : "empty";
};

export const isStepReachable = (step: number, record: CaseRecord): boolean => {
  for (let i = 1; i < step; i += 1) {
    if (!validateStep(i, record).isValid) return false;
  }
  return true;
};

export const computeFinalStatus = (record: CaseRecord): "completo" | "sem_evidencia" => {
  const hasEvidence =
    Boolean(record.dashboardUrl) || Boolean(record.presentationUrl) || Boolean(record.testimonialUrl);
  return hasEvidence ? "completo" : "sem_evidencia";
};
```

### 5.5 Formatadores (format.ts)

`src/features/cases/format.ts`

```ts
import type { MetricDirection, MetricUnit } from "./options";
import { getMetricDirection } from "./options";

export const formatCnpj = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export const formatMetricValue = (raw: string, unit: MetricUnit | string): string => {
  if (!raw) return "—";
  const parsed = Number(raw.replace(",", "."));
  if (Number.isNaN(parsed)) return raw;
  switch (unit) {
    case "currency":
      return currencyFormatter.format(parsed);
    case "percent":
      return `${numberFormatter.format(parsed)}%`;
    case "days":
      return `${numberFormatter.format(parsed)} ${parsed === 1 ? "dia" : "dias"}`;
    case "number":
    default:
      return numberFormatter.format(parsed);
  }
};

export const computeVariation = (before: string, after: string): number | null => {
  const b = Number(before.replace(",", "."));
  const a = Number(after.replace(",", "."));
  if (!Number.isFinite(b) || !Number.isFinite(a) || b === 0) return null;
  return ((a - b) / Math.abs(b)) * 100;
};

export const computeRoas = (revenue: string, investment: string): number | null => {
  const r = Number(revenue.replace(",", "."));
  const i = Number(investment.replace(",", "."));
  if (!Number.isFinite(r) || !Number.isFinite(i) || i === 0) return null;
  return r / i;
};

export const formatVariation = (variation: number | null): string => {
  if (variation === null) return "—";
  const sign = variation > 0 ? "+" : "";
  return `${sign}${numberFormatter.format(variation)}%`;
};

// Retorna true se a variação representa melhora considerando a direção da métrica.
// null se não há dados suficientes pra avaliar.
export const isImprovement = (
  variation: number | null,
  direction: MetricDirection | string | undefined,
): boolean | null => {
  if (variation === null) return null;
  const dir = direction === "lower_is_better" ? "lower_is_better" : "higher_is_better";
  return dir === "lower_is_better" ? variation < 0 : variation >= 0;
};

// Retorna a "melhoria normalizada" pra ordenação cross-métrica.
// Reduções em métricas lower_is_better viram positivas.
export const normalizedImprovement = (
  variation: number | null,
  metricKey: string,
): number => {
  if (variation === null) return -Infinity;
  const direction = getMetricDirection(metricKey);
  return direction === "lower_is_better" ? -variation : variation;
};

export const formatPercent = (value: number, fractionDigits = 1): string =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;

export const formatRelativeDate = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  return date.toLocaleDateString("pt-BR");
};
```

### 5.6 Busca fuzzy (search.ts)

`src/features/cases/search.ts`

```ts
// Busca tolerante a acento, caixa e pequenos erros de digitação.
// Estratégia: normalização (NFD + strip diacritics + lowercase), match por substring
// e fallback Levenshtein por palavra com tolerância proporcional ao tamanho do token.

const DIACRITICS = /[̀-ͯ]/g;

const normalize = (value: string): string =>
  value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
};

const toleranceFor = (length: number): number => {
  if (length <= 3) return 0;
  if (length <= 5) return 1;
  if (length <= 8) return 2;
  return 3;
};

const tokenMatchesHaystack = (token: string, haystack: string): boolean => {
  if (!token) return true;
  if (haystack.includes(token)) return true;

  const tolerance = toleranceFor(token.length);
  if (tolerance === 0) return false;

  const words = haystack.split(/[\s\-_/.,;:]+/).filter(Boolean);
  return words.some((word) => {
    if (word.includes(token)) return true;
    if (Math.abs(word.length - token.length) > tolerance) return false;
    return levenshtein(word, token) <= tolerance;
  });
};

export const fuzzyMatch = (query: string, haystack: string): boolean => {
  const q = normalize(query);
  if (!q) return true;
  const h = normalize(haystack);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => tokenMatchesHaystack(token, h));
};
```

### 5.7 Cases de exemplo (seed.ts)

`src/features/cases/seed.ts`

```ts
import type { CaseRecord } from "./types";
import { listCases, upsertCase, deleteCase } from "./storage";

const EXAMPLE_PREFIX = "example-";

const baseRecord = (id: string): CaseRecord => ({
  id,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  status: "completo",
  currentStep: 6,
  ownerEmail: "",
  v4Unit: "",
  clientName: "",
  clientCnpj: "",
  clientStatus: "ativo",
  clientCity: "",
  clientState: "",
  operationReach: "",
  collaborators: [],
  salesModel: "",
  segment: "",
  products: [],
  primaryDriver: "",
  initialChallenges: [],
  initialChallengesOther: "",
  problem: "",
  rootCause: "",
  restrictions: [],
  restrictionsOther: "",
  previousAttempt: "",
  previousFailureReason: "",
  saberDirections: [],
  saberExecution: "",
  terValuePerception: "",
  executarProfessionals: [],
  executarChannels: [],
  executarCreatives: [],
  executarCreativesCommunication: "",
  executarStrategies: [],
  potencializarValueModel: "",
  potencializarIndicator: "",
  timeToResult: "",
  primaryMetrics: [],
  secondaryMetrics: [],
  mediaInvestment: "",
  attributedRevenue: "",
  dashboardUrl: "",
  presentationUrl: "",
  testimonialUrl: "",
  finalNotes: "",
});

const exampleCases: CaseRecord[] = [
  {
    ...baseRecord(`${EXAMPLE_PREFIX}1`),
    ownerEmail: "marina.costa@v4company.com",
    v4Unit: "V4 São Paulo - Pinheiros",
    clientName: "Lina Beachwear",
    clientCnpj: "23.456.789/0001-12",
    clientStatus: "ativo",
    clientCity: "São Paulo",
    clientState: "SP",
    operationReach: "nacional",
    salesModel: "ecommerce",
    segment: "E-commerce",
    products: ["saber", "executar"],
    primaryDriver: "executar",
    initialChallenges: ["CAC ou CPL muito alto", "Mídia paga sem escalar"],
    problem:
      "Marca de moda praia que conseguia escalar campanhas de Meta Ads no verão, mas o ROAS desabava fora da temporada e o CAC inviabilizava o crescimento.",
    rootCause:
      "Oferta indiferenciada e dependência de público frio no Meta. Não havia funil de retargeting nem segmentação por momento de compra. Criativo era 100% lifestyle, sem prova social.",
    restrictions: ["Time pequeno ou sem expertise", "Dados/tracking inexistentes ou ruins"],
    previousAttempt: "agencia",
    previousFailureReason:
      "A agência anterior mantinha as campanhas estáveis mas não tinha hipótese clara de escala — só ajustava lance.",
    saberDirections: [
      {
        direction: "Reposicionar para 'praia o ano todo' criando ocasiões de uso",
        rationale:
          "Pesquisa mostrou que 38% das clientes usam biquíni em piscina e academia, não apenas verão.",
        impact:
          "Permitiu rodar campanhas em meses tradicionalmente fracos com bons resultados.",
      },
      {
        direction: "Criar funil de retargeting por estágio",
        rationale:
          "Tracking mostrava 87% das visitas saindo sem converter sem nenhuma comunicação subsequente.",
        impact: "Recuperação de 18% das visitas via retargeting estruturado.",
      },
    ],
    saberExecution: "integral",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Designer Gráfico",
      "Profissional de Audiovisual",
      "Profissional de Business Intelligence",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "120000", revenue: "504000" },
      { channel: "Google Ads", investment: "45000", revenue: "162000" },
      { channel: "TikTok Ads", investment: "25000", revenue: "67500" },
    ],
    executarCreatives: ["UGC", "Demonstração de produto/serviço", "Depoimento de cliente"],
    executarCreativesCommunication:
      "Tom direto e empoderado. Mensagem central: 'biquíni que cabe em todos os corpos e em todas as estações'. Gancho de prova social com clientes reais usando em piscina, academia e viagens.",
    executarStrategies: [
      {
        strategy: "Funil de retargeting com público de carrinho abandonado",
        appliedAt: "Meta Ads — base de últimos 30 dias com criativos de prova social",
      },
      {
        strategy: "Campanhas de aquisição com lookalike de top 1% LTV",
        appliedAt: "Meta Ads — base de clientes com 2+ compras",
      },
      {
        strategy: "Catálogo dinâmico com conteúdo gerado por usuárias",
        appliedAt: "Meta Ads e TikTok Ads — substituiu 70% do criativo antigo",
      },
    ],
    timeToResult: "6m",
    primaryMetrics: [
      {
        metricKey: "roas",
        label: "ROAS",
        unit: "number",
        before: "1.6",
        after: "3.8",
      },
      {
        metricKey: "receita",
        label: "Receita/Faturamento",
        unit: "currency",
        before: "180000",
        after: "733500",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "189",
        after: "247",
      },
    ],
    secondaryMetrics: [
      { name: "Recompra em 90 dias", before: "8", after: "21" },
    ],
    mediaInvestment: "190000",
    attributedRevenue: "733500",
    dashboardUrl: "https://lookerstudio.google.com/example-lina",
    presentationUrl: "https://drive.google.com/example-deck",
    testimonialUrl: "",
    finalNotes:
      "Cliente relatou que pela primeira vez conseguiu projetar receita de mídia com confiança e alinhar produção do estoque ao forecast.",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}2`),
    ownerEmail: "rafael.silva@v4company.com",
    v4Unit: "V4 Curitiba",
    clientName: "FleetFlow Logística",
    clientCnpj: "11.222.333/0001-45",
    clientStatus: "ativo",
    clientCity: "Curitiba",
    clientState: "PR",
    operationReach: "nacional",
    salesModel: "inside_sales",
    segment: "SaaS",
    products: ["executar"],
    primaryDriver: "executar",
    initialChallenges: [
      "CAC ou CPL muito alto",
      "Time comercial não converte os leads gerados",
    ],
    problem:
      "SaaS de gestão de frotas com CPL acima de R$ 800 e SDRs reclamando que os leads não tinham fit. Pipeline travado.",
    rootCause:
      "Segmentação ampla demais nos anúncios e formulário sem qualificação. Lead de empresa com 5 carros entrando junto com lead de transportadora com 200.",
    restrictions: ["Orçamento limitado"],
    previousAttempt: "interna",
    previousFailureReason:
      "Time de marketing interno não tinha banco de criativos para testar hipóteses e a diretoria não permitia mudar formulário 'porque sempre foi assim'.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Redação Publicitária",
      "Profissional de Designer Gráfico",
    ],
    executarChannels: [
      { channel: "Google Ads", investment: "60000", revenue: "0" },
      { channel: "LinkedIn Ads", investment: "35000", revenue: "0" },
      { channel: "Meta Ads", investment: "20000", revenue: "0" },
    ],
    executarCreatives: [
      "Depoimento de cliente",
      "Educacional/autoridade",
      "Demonstração de produto/serviço",
    ],
    executarCreativesCommunication:
      "Tom técnico e direto. Mensagem: 'reduza 12% do consumo de combustível em 60 dias'. Prova social com logos de transportadoras conhecidas.",
    executarStrategies: [
      {
        strategy: "Reescrita do formulário com qualificação por porte da frota",
        appliedAt: "Todas as LPs — bloqueia leads com menos de 30 veículos",
      },
      {
        strategy: "Camada educacional para topo de funil com whitepaper de ROI",
        appliedAt: "LinkedIn Ads — público de gerentes de logística",
      },
    ],
    timeToResult: "3m",
    primaryMetrics: [
      {
        metricKey: "cpl",
        label: "CPL",
        unit: "currency",
        before: "820",
        after: "310",
      },
      {
        metricKey: "vol_leads",
        label: "Volume de leads",
        unit: "number",
        before: "42",
        after: "108",
      },
      {
        metricKey: "vol_vendas",
        label: "Volume de vendas",
        unit: "number",
        before: "3",
        after: "11",
      },
    ],
    secondaryMetrics: [],
    mediaInvestment: "115000",
    attributedRevenue: "0",
    dashboardUrl: "https://app.metabase.com/example-fleetflow",
    presentationUrl: "",
    testimonialUrl: "",
    finalNotes: "",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}3`),
    ownerEmail: "joana.lima@v4company.com",
    v4Unit: "V4 Belo Horizonte",
    clientName: "Studio Mariana",
    clientCnpj: "98.765.432/0001-89",
    clientStatus: "ativo",
    clientCity: "Belo Horizonte",
    clientState: "MG",
    operationReach: "local",
    salesModel: "pdv",
    segment: "Beleza e estética",
    products: ["ter", "executar"],
    primaryDriver: "executar",
    initialChallenges: [
      "Baixo volume de leads / vendas",
      "Dependência excessiva de poucos canais",
    ],
    problem:
      "Studio de beleza dependia 100% de indicação boca a boca. Quando indicações esfriavam, agenda ficava vazia.",
    rootCause:
      "Sem captação ativa nem CRM. Cliente que sumiu não voltava porque ninguém lembrava.",
    restrictions: ["Time pequeno ou sem expertise", "Política interna ou aprovações"],
    previousAttempt: "nao",
    terValuePerception:
      "Após o setup do CRM e da automação de WhatsApp, a recepcionista deixou de fazer agendamento manual em planilha. Reativações de clientes inativas viraram régua semanal automatizada — recuperando R$ 18 mil/mês sem custo de mídia.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Social Media",
      "Profissional de CRM",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "12000", revenue: "78000" },
      { channel: "Google Ads (local)", investment: "8000", revenue: "42000" },
    ],
    executarCreatives: ["Depoimento de cliente", "Oferta/promoção", "UGC"],
    executarCreativesCommunication:
      "Tom acolhedor, próximo do dia a dia. Foco em depoimentos curtos (15s) de clientes reais com antes/depois sutil. Gancho de oferta de primeira sessão.",
    executarStrategies: [
      {
        strategy: "Geofencing 5km ao redor do studio com criativos de primeira sessão",
        appliedAt: "Meta Ads e Google Ads local",
      },
      {
        strategy: "Régua de WhatsApp para reativação aos 60 dias",
        appliedAt: "CRM — clientes sem agendamento há 60+ dias",
      },
    ],
    timeToResult: "3m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita",
        unit: "currency",
        before: "62000",
        after: "138000",
      },
      {
        metricKey: "vol_vendas",
        label: "Volume de vendas",
        unit: "number",
        before: "85",
        after: "172",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "729",
        after: "802",
      },
    ],
    secondaryMetrics: [
      { name: "Reativações via CRM", before: "0", after: "23" },
    ],
    mediaInvestment: "20000",
    attributedRevenue: "120000",
    dashboardUrl: "",
    presentationUrl: "https://drive.google.com/example-studio",
    testimonialUrl: "https://youtu.be/example-testimonial",
    finalNotes: "",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}4`),
    ownerEmail: "pedro.alves@v4company.com",
    v4Unit: "V4 São Paulo - Faria Lima",
    clientName: "Norte Aço Indústria",
    clientCnpj: "55.444.333/0001-22",
    clientStatus: "ativo",
    clientCity: "Joinville",
    clientState: "SC",
    operationReach: "regional",
    salesModel: "inside_sales",
    segment: "Indústria",
    products: ["saber"],
    primaryDriver: "saber",
    initialChallenges: [
      "Marca / posicionamento confuso ou pouco diferenciado",
      "Falta de previsibilidade de receita",
      "Funil comercial não estruturado",
    ],
    problem:
      "Indústria de chapas de aço B2B vendendo por preço, perdendo deals para concorrentes asiáticos. Margem caindo trimestre a trimestre.",
    rootCause:
      "Posicionamento genérico ('temos qualidade e preço') sem ICP claro. Time comercial atendendo qualquer pedido sem critério, gastando tempo em deals pequenos.",
    restrictions: ["Política interna ou aprovações"],
    previousAttempt: "interna",
    previousFailureReason:
      "Diretoria comercial sempre tratou marketing como 'feira e folder'. Não havia processo de qualificação.",
    saberDirections: [
      {
        direction: "Definir ICP por verticais — automotivo e construção naval",
        rationale:
          "Análise de margem mostrou que 80% do lucro vinha de 22% dos clientes, todos nesses dois nichos.",
        impact:
          "Time comercial passou a recusar deals fora do ICP — produtividade dobrou.",
      },
      {
        direction: "Reposicionar como 'aço técnico para aplicação crítica'",
        rationale:
          "Asiáticos não atendem certificação ABNT específica que esses dois verticais exigem.",
        impact:
          "Conseguiu praticar +18% de prêmio no preço sem perda de share.",
      },
      {
        direction: "Implementar processo de qualificação por porte e ticket",
        rationale: "Time gastava 70% do tempo em deals que respondiam por 12% da receita.",
        impact: "",
      },
    ],
    saberExecution: "parcial",
    timeToResult: "9m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita",
        unit: "currency",
        before: "4200000",
        after: "5670000",
      },
      {
        metricKey: "ticket_medio",
        label: "Ticket médio",
        unit: "currency",
        before: "85000",
        after: "142000",
      },
    ],
    secondaryMetrics: [],
    mediaInvestment: "",
    attributedRevenue: "",
    dashboardUrl: "https://lookerstudio.google.com/example-norte",
    presentationUrl: "https://drive.google.com/example-norte-deck",
    testimonialUrl: "",
    finalNotes:
      "Diretoria assumiu que a maior dificuldade foi cultural — convencer comerciais antigos a recusar pedido. Processo deve consolidar nos próximos 6 meses.",
  },
  {
    ...baseRecord(`${EXAMPLE_PREFIX}5`),
    ownerEmail: "carla.mendes@v4company.com",
    v4Unit: "V4 Rio de Janeiro - Barra",
    clientName: "Verde & Saúde",
    clientCnpj: "33.221.110/0001-66",
    clientStatus: "ativo",
    clientCity: "Rio de Janeiro",
    clientState: "RJ",
    operationReach: "estadual",
    salesModel: "hibrido",
    segment: "Saúde",
    products: ["saber", "ter", "executar", "potencializar"],
    primaryDriver: "executar",
    initialChallenges: [
      "Conversão baixa (LP, e-commerce, loja)",
      "Dados / tracking não confiáveis",
      "Mídia paga sem escalar",
    ],
    problem:
      "Rede de clínicas de medicina integrativa com 4 unidades físicas e e-commerce de suplementos. Crescimento estagnado — receita do e-com flat há 8 meses, agenda das clínicas com vacância de 30%.",
    rootCause:
      "Operações de mídia separadas (uma para clínica, uma para e-com) sem cruzamento. Cliente que comprava no e-com não recebia oferta de consulta. Cliente da clínica sumia sem follow-up.",
    restrictions: ["Ferramenta/stack legada", "Política interna ou aprovações"],
    previousAttempt: "agencia",
    previousFailureReason:
      "Duas agências (uma para cada operação) com KPIs cruzados. A do e-com sabotava conversões para consulta.",
    saberDirections: [
      {
        direction: "Unificar operação de mídia com KPI de LTV cruzado",
        rationale: "Cliente que faz consulta + compra suplemento tem 3.4x mais LTV.",
        impact: "Agências internas alinhadas no mesmo norte.",
      },
    ],
    saberExecution: "integral",
    terValuePerception:
      "CRM unificou cadastro de paciente da clínica e cliente do e-com. Recepcionista da clínica passou a ver histórico de compra de suplemento na hora da consulta — recomendação ficou natural.",
    executarProfessionals: [
      "Profissional de Gestão de Mídia Paga",
      "Profissional de Business Intelligence",
      "Profissional de CRM",
      "Profissional de Designer Gráfico",
      "Profissional de Audiovisual",
      "Profissional de Web Design",
    ],
    executarChannels: [
      { channel: "Meta Ads", investment: "85000", revenue: "412000" },
      { channel: "Google Ads", investment: "55000", revenue: "298000" },
    ],
    executarCreatives: [
      "Depoimento de cliente",
      "Educacional/autoridade",
      "Demonstração de produto/serviço",
    ],
    executarCreativesCommunication:
      "Tom científico mas acessível. Médica titular como rosto da marca. Mensagem central: 'cuidado integral que une consultório e suplementação'.",
    executarStrategies: [
      {
        strategy: "Funil cruzado: comprador de suplemento vira lead de consulta",
        appliedAt: "Meta Ads — público de últimos 90 dias do e-com",
      },
      {
        strategy: "Conteúdo educacional da médica como aquisição",
        appliedAt: "Reels e YouTube — base fria",
      },
    ],
    potencializarValueModel:
      "Indicador de saúde do paciente ao longo de 6 meses (escala validada de bem-estar) cruzado com LTV financeiro. Cliente vê seu progresso, V4 mostra ROI da operação.",
    potencializarIndicator: "Índice integrado de bem-estar + LTV (12 meses)",
    timeToResult: "9m",
    primaryMetrics: [
      {
        metricKey: "receita",
        label: "Receita/Faturamento",
        unit: "currency",
        before: "640000",
        after: "1180000",
      },
      {
        metricKey: "roas",
        label: "ROAS",
        unit: "number",
        before: "2.1",
        after: "5.1",
      },
      {
        metricKey: "vol_pedidos",
        label: "Volume de pedidos",
        unit: "number",
        before: "320",
        after: "612",
      },
    ],
    secondaryMetrics: [
      { name: "Vacância na agenda das clínicas", before: "30", after: "8" },
    ],
    mediaInvestment: "140000",
    attributedRevenue: "710000",
    dashboardUrl: "https://lookerstudio.google.com/example-verde",
    presentationUrl: "https://drive.google.com/example-verde-deck",
    testimonialUrl: "https://youtu.be/example-verde",
    finalNotes:
      "Maior aprendizado: quebrar silos entre operações é mais barato e rápido do que criar canais novos.",
  },
];

export const seedExampleCases = (): number => {
  exampleCases.forEach((c) => upsertCase(c));
  return exampleCases.length;
};

export const clearExampleCases = (): number => {
  const all = listCases();
  const examples = all.filter((c) => c.id.startsWith(EXAMPLE_PREFIX));
  examples.forEach((c) => deleteCase(c.id));
  return examples.length;
};

export const hasExampleCases = (): boolean =>
  listCases().some((c) => c.id.startsWith(EXAMPLE_PREFIX));
```

### 5.8 Componente FieldShell

`src/features/cases/components/FieldShell.tsx`

```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  counter?: string;
}

export const FieldShell = ({
  label,
  required,
  hint,
  error,
  children,
  className,
  counter,
}: FieldShellProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
        {counter && <span className="text-xs text-muted-foreground">{counter}</span>}
      </div>
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
};
```

### 5.9 Componente CheckboxGroup

`src/features/cases/components/CheckboxGroup.tsx`

```tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2 | 3;
}

export const CheckboxGroup = ({ options, value, onChange, columns = 2 }: CheckboxGroupProps) => {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridClass)}>
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
              checked
                ? "border-primary/60 bg-primary/5 text-foreground shadow-sm"
                : "border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
              )}
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="leading-snug">{option}</span>
          </button>
        );
      })}
    </div>
  );
};
```

### 5.10 Componente SearchableSelect

`src/features/cases/components/SearchableSelect.tsx`

```tsx
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export const SearchableSelect = ({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option === value ? "" : option);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
```

### 5.11 Componente StepIndicator

`src/features/cases/components/StepIndicator.tsx`

```tsx
import { Check, CircleDashed, Pencil } from "lucide-react";
import { STEPS } from "../options";
import type { StepCompletion } from "../validation";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  completion: Record<number, StepCompletion>;
  onJump: (step: number) => void;
}

const STATE_LABEL: Record<StepCompletion, string> = {
  empty: "Não iniciada",
  partial: "Em andamento",
  complete: "Completa",
};

export const StepIndicator = ({ currentStep, completion, onJump }: StepIndicatorProps) => {
  return (
    <ol className="flex w-full items-stretch overflow-x-auto rounded-2xl border border-border/70 bg-card p-1.5 shadow-sm">
      {STEPS.map((step, index) => {
        const state = completion[step.id] ?? "empty";
        const isCurrent = currentStep === step.id;

        const badgeClass =
          state === "complete"
            ? "bg-ter text-ter-foreground"
            : state === "partial"
              ? "bg-amber-400 text-amber-950"
              : isCurrent
                ? "bg-primary text-primary-foreground"
                : "border border-border/70 bg-background text-muted-foreground";

        const icon =
          state === "complete" ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : state === "partial" ? (
            <Pencil className="h-3 w-3" strokeWidth={3} />
          ) : isCurrent ? (
            <span className="text-xs font-bold">{step.id}</span>
          ) : (
            <CircleDashed className="h-3.5 w-3.5" />
          );

        const stateBadgeClass =
          state === "complete"
            ? "bg-ter/10 text-ter"
            : state === "partial"
              ? "bg-amber-400/15 text-amber-700 dark:text-amber-400"
              : "bg-muted text-muted-foreground";

        return (
          <li key={step.id} className="flex min-w-[150px] flex-1">
            <button
              type="button"
              onClick={() => onJump(step.id)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                isCurrent
                  ? "bg-primary/5 ring-1 ring-primary/30"
                  : "hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
                  badgeClass,
                )}
              >
                {icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Etapa {step.id}
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {step.title}
                </span>
                <span
                  className={cn(
                    "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    stateBadgeClass,
                  )}
                >
                  {STATE_LABEL[state]}
                </span>
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span aria-hidden className="mx-0.5 hidden self-center text-border md:block">
                ›
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
```

### 5.12 Componente ChannelInvestmentList

`src/features/cases/components/ChannelInvestmentList.tsx`

```tsx
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { computeRoas } from "../format";
import type { ChannelInvestment } from "../types";
import { cn } from "@/lib/utils";

interface ChannelInvestmentListProps {
  options: string[];
  value: ChannelInvestment[];
  errors: Record<string, string>;
  onChange: (next: ChannelInvestment[]) => void;
}

const currencyFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const sumNumbers = (values: string[]): number =>
  values.reduce((acc, v) => {
    const n = Number((v || "").replace(",", "."));
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);

export const ChannelInvestmentList = ({
  options,
  value,
  errors,
  onChange,
}: ChannelInvestmentListProps) => {
  const isActive = (name: string) => value.some((v) => v.channel === name);

  const togglePredefined = (name: string) => {
    if (isActive(name)) {
      onChange(value.filter((v) => v.channel !== name));
    } else {
      onChange([...value, { channel: name, investment: "", revenue: "" }]);
    }
  };

  const updateAt = (index: number, patch: Partial<ChannelInvestment>) => {
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addCustom = () => {
    onChange([...value, { channel: "", investment: "", revenue: "" }]);
  };

  const totalInvestment = sumNumbers(value.map((v) => v.investment));
  const totalRevenue = sumNumbers(value.map((v) => v.revenue));
  const totalRoas = totalInvestment > 0 ? totalRevenue / totalInvestment : null;

  const customEntries = value
    .map((v, i) => ({ entry: v, index: i }))
    .filter(({ entry }) => !options.includes(entry.channel));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((name) => {
          const active = isActive(name);
          const index = value.findIndex((v) => v.channel === name);
          const entry = active ? value[index] : null;
          const roas = entry ? computeRoas(entry.revenue, entry.investment) : null;
          const error = active ? errors[`executarChannels.${index}`] : undefined;

          return (
            <div
              key={name}
              className={cn(
                "rounded-xl border transition-all",
                active
                  ? "border-executar/50 bg-executar/5 shadow-sm"
                  : "border-border/70 bg-background hover:border-executar/40 hover:bg-muted/40",
              )}
            >
              <button
                type="button"
                onClick={() => togglePredefined(name)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span
                  className={cn(
                    "h-4 w-4 rounded border transition-colors",
                    active ? "border-executar bg-executar" : "border-border bg-background",
                  )}
                  aria-hidden
                />
              </button>

              {active && entry && (
                <div className="border-t border-border/60 bg-background/60 px-4 py-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Investimento (R$)
                      </span>
                      <Input
                        type="number"
                        step="any"
                        value={entry.investment}
                        onChange={(e) => updateAt(index, { investment: e.target.value })}
                        placeholder="0,00"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Receita gerada (R$)
                      </span>
                      <Input
                        type="number"
                        step="any"
                        value={entry.revenue}
                        onChange={(e) => updateAt(index, { revenue: e.target.value })}
                        placeholder="0,00"
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ROAS do canal</span>
                    <span
                      className={cn(
                        "font-semibold",
                        roas === null
                          ? "text-muted-foreground"
                          : roas >= 1
                            ? "text-ter"
                            : "text-destructive",
                      )}
                    >
                      {roas === null
                        ? "—"
                        : `${roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                    </span>
                  </div>
                  {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {customEntries.length > 0 && (
        <div className="space-y-2">
          {customEntries.map(({ entry, index }) => {
            const roas = computeRoas(entry.revenue, entry.investment);
            const error = errors[`executarChannels.${index}`];
            return (
              <div
                key={index}
                className="rounded-xl border border-dashed border-executar/40 bg-background p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-executar/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-executar">
                    Canal customizado
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAt(index)}
                    aria-label="Remover canal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    value={entry.channel}
                    onChange={(e) => updateAt(index, { channel: e.target.value })}
                    placeholder="Nome do canal"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={entry.investment}
                    onChange={(e) => updateAt(index, { investment: e.target.value })}
                    placeholder="Investimento (R$)"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={entry.revenue}
                    onChange={(e) => updateAt(index, { revenue: e.target.value })}
                    placeholder="Receita (R$)"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ROAS do canal</span>
                  <span
                    className={cn(
                      "font-semibold",
                      roas === null
                        ? "text-muted-foreground"
                        : roas >= 1
                          ? "text-ter"
                          : "text-destructive",
                    )}
                  >
                    {roas === null
                      ? "—"
                      : `${roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addCustom}>
        <Plus className="mr-1 h-4 w-4" /> Adicionar outro canal
      </Button>

      {value.length > 0 && (
        <div className="rounded-xl border border-executar/30 bg-executar/5 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Investimento total
              </p>
              <p className="text-sm font-bold text-foreground">
                {currencyFmt.format(totalInvestment)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Receita total
              </p>
              <p className="text-sm font-bold text-foreground">{currencyFmt.format(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                ROAS médio
              </p>
              <p
                className={cn(
                  "text-sm font-bold",
                  totalRoas === null
                    ? "text-muted-foreground"
                    : totalRoas >= 1
                      ? "text-ter"
                      : "text-destructive",
                )}
              >
                {totalRoas === null
                  ? "—"
                  : `${totalRoas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 5.13 Step 1 — Identificação

`src/features/cases/steps/Step1Identification.tsx`

```tsx
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
  V4_UNITS_MOCK,
} from "../options";
import type { ClientStatus, OperationReach } from "../options";
import type { CaseRecord } from "../types";
import { formatCnpj } from "../format";

const STATE_OPTIONS = BRAZIL_STATES.map((s) => s.label);
const STATE_LABEL_TO_VALUE = Object.fromEntries(BRAZIL_STATES.map((s) => [s.label, s.value]));
const STATE_VALUE_TO_LABEL = Object.fromEntries(BRAZIL_STATES.map((s) => [s.value, s.label]));

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

export const Step1Identification = ({ record, errors, update }: StepProps) => {
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
            options={V4_UNITS_MOCK}
            onChange={(v) => update({ v4Unit: v })}
            placeholder="Selecione a unidade"
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
        <FieldShell label="Cidade da sede" error={errors.clientCity} className="md:col-span-2">
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
```

### 5.14 Step 2 — Classificação

`src/features/cases/steps/Step2Classification.tsx`

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "../components/FieldShell";
import { SALES_MODELS, SEGMENTS_MOCK, V4_PRODUCTS } from "../options";
import type { V4Product } from "../options";
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
    const patch: Partial<CaseRecord> = { products: next };
    if (next.length === 1) patch.primaryDriver = next[0];
    if (next.length === 0) patch.primaryDriver = "";
    if (record.primaryDriver && !next.includes(record.primaryDriver as V4Product))
      patch.primaryDriver = next[0] ?? "";
    update(patch);
  };

  return (
    <div className="space-y-6">
      <FieldShell
        label="Modelo de venda do cliente"
        required
        error={errors.salesModel}
        hint="Esta resposta define as opções que aparecem nas perguntas de canais, criativos e métricas mais à frente."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {SALES_MODELS.map((model) => {
            const selected = record.salesModel === model.value;
            return (
              <button
                type="button"
                key={model.value}
                onClick={() => update({ salesModel: model.value })}
                className={[
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  selected
                    ? "border-primary/60 bg-primary/5 shadow-sm"
                    : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="text-sm font-semibold text-foreground">{model.label}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {model.description}
                </div>
              </button>
            );
          })}
        </div>
      </FieldShell>

      <FieldShell label="Segmento do cliente" required error={errors.segment}>
        <Select value={record.segment} onValueChange={(v) => update({ segment: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o segmento" />
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
        label="Produtos V4 contratados que contribuíram para o case"
        required
        error={errors.products}
        hint="Pode marcar mais de um. Cada produto marcado ativa um bloco específico de perguntas na Etapa 4."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {V4_PRODUCTS.map((product) => {
            const selected = record.products.includes(product.value);
            return (
              <button
                type="button"
                key={product.value}
                onClick={() => toggleProduct(product.value)}
                className={[
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  selected ? `${product.toneClass} shadow-sm` : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{product.label}</span>
                  <span
                    className={[
                      "h-4 w-4 rounded border transition-colors",
                      selected ? "border-current bg-current" : "border-border bg-background",
                    ].join(" ")}
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.tagline}</p>
              </button>
            );
          })}
        </div>
      </FieldShell>

      {record.products.length > 1 && (
        <FieldShell
          label="Qual foi o principal motor do resultado?"
          required
          error={errors.primaryDriver}
          hint="Ajuda a IA a atribuir peso e ajuda o vendedor a filtrar cases por produto principal."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {V4_PRODUCTS.filter((p) => record.products.includes(p.value)).map((product) => {
              const selected = record.primaryDriver === product.value;
              return (
                <button
                  type="button"
                  key={product.value}
                  onClick={() => update({ primaryDriver: product.value })}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-semibold transition-all",
                    selected
                      ? `${product.toneClass} shadow-sm`
                      : "border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-muted/40",
                  ].join(" ")}
                >
                  {product.label}
                </button>
              );
            })}
          </div>
        </FieldShell>
      )}
    </div>
  );
};
```

### 5.15 Step 3 — Contexto do desafio

`src/features/cases/steps/Step3Context.tsx`

```tsx
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FieldShell } from "../components/FieldShell";
import { CheckboxGroup } from "../components/CheckboxGroup";
import {
  INITIAL_CHALLENGES,
  PREVIOUS_ATTEMPT_OPTIONS,
  RESTRICTIONS,
} from "../options";
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
        label="Qual era o problema que o cliente queria resolver?"
        required
        error={errors.problem}
        hint="Descreva o que o cliente trouxe como dor inicial — o que ele acreditava ser o problema."
        counter={`${record.problem.length}/${MAX_LEN}`}
      >
        <Textarea
          value={record.problem}
          maxLength={MAX_LEN}
          onChange={(e) => update({ problem: e.target.value })}
          rows={4}
          placeholder="Ex.: a operação queria escalar mídia mas o ROAS não fechava o LTV."
        />
      </FieldShell>

      <FieldShell
        label="Qual foi a causa raiz que a V4 identificou?"
        required
        error={errors.rootCause}
        hint="Muitas vezes o que o cliente pede é diferente do que ele precisa. Qual foi o diagnóstico real?"
        counter={`${record.rootCause.length}/${MAX_LEN}`}
      >
        <Textarea
          value={record.rootCause}
          maxLength={MAX_LEN}
          onChange={(e) => update({ rootCause: e.target.value })}
          rows={4}
          placeholder="Ex.: oferta sem diferenciação clara e tracking subnotificando conversões assistidas."
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

      <FieldShell
        label="O cliente já havia tentado resolver isso antes?"
        required
        error={errors.previousAttempt}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {PREVIOUS_ATTEMPT_OPTIONS.map((opt) => {
            const selected = record.previousAttempt === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() =>
                  update({
                    previousAttempt: opt.value,
                    previousFailureReason:
                      opt.value === "nao" ? "" : record.previousFailureReason,
                  })
                }
                className={[
                  "rounded-lg border px-4 py-3 text-left text-sm transition-all",
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

      {record.previousAttempt && record.previousAttempt !== "nao" && (
        <FieldShell
          label="O que não funcionou nas tentativas anteriores?"
          required
          error={errors.previousFailureReason}
          hint="Esse campo é ouro para o vendedor — mostra que a V4 resolveu o que outras tentativas não resolveram."
          counter={`${record.previousFailureReason.length}/${MAX_LEN}`}
        >
          <Textarea
            value={record.previousFailureReason}
            maxLength={MAX_LEN}
            onChange={(e) => update({ previousFailureReason: e.target.value })}
            rows={3}
            placeholder="Ex.: a agência anterior não entregava criativo no ritmo necessário."
          />
        </FieldShell>
      )}
    </div>
  );
};
```

### 5.16 Step 4 — Estratégia aplicada

`src/features/cases/steps/Step4Strategy.tsx`

```tsx
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const MAX_SABER_DIRECTIONS = 5;
const MAX_EXECUTAR_STRATEGIES = 5;

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
            label="Direcionamentos estratégicos que fizeram a diferença"
            required
            error={errors.saberDirections}
            hint="Liste os direcionamentos específicos que destravaram o caso. Foque no que de fato moveu o ponteiro — não em recomendações genéricas."
          >
            <div className="space-y-3">
              {record.saberDirections.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/70 bg-background px-4 py-6 text-center text-xs text-muted-foreground">
                  Nenhum direcionamento adicionado ainda.
                </div>
              )}
              {record.saberDirections.map((dir, index) => {
                const updateDir = (patch: Partial<SaberDirection>) => {
                  const next = record.saberDirections.map((d, i) =>
                    i === index ? { ...d, ...patch } : d,
                  );
                  update({ saberDirections: next });
                };
                const remove = () =>
                  update({
                    saberDirections: record.saberDirections.filter((_, i) => i !== index),
                  });
                return (
                  <div
                    key={index}
                    className="space-y-3 rounded-xl border border-border/70 bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-saber/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-saber">
                        Direcionamento {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={remove}
                        aria-label="Remover direcionamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Direcionamento dado
                      </label>
                      <Input
                        value={dir.direction}
                        onChange={(e) => updateDir({ direction: e.target.value })}
                        placeholder="Ex.: Reposicionar oferta para B2B mid-market"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Por que fez sentido para esse cliente
                      </label>
                      <Textarea
                        rows={2}
                        value={dir.rationale}
                        onChange={(e) => updateDir({ rationale: e.target.value })}
                        placeholder="O insight do diagnóstico que justificou esse direcionamento."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Resultado / impacto observado{" "}
                        <span className="font-normal">(opcional)</span>
                      </label>
                      <Textarea
                        rows={2}
                        value={dir.impact}
                        onChange={(e) => updateDir({ impact: e.target.value })}
                        placeholder="Efeito prático percebido depois que o direcionamento foi aplicado."
                      />
                    </div>

                    {errors[`saberDirections.${index}`] && (
                      <p className="text-xs text-destructive">
                        {errors[`saberDirections.${index}`]}
                      </p>
                    )}
                  </div>
                );
              })}

              {record.saberDirections.length < MAX_SABER_DIRECTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    update({
                      saberDirections: [
                        ...record.saberDirections,
                        { direction: "", rationale: "", impact: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Adicionar direcionamento
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground">
                {record.saberDirections.length}/{MAX_SABER_DIRECTIONS} direcionamentos
              </p>
            </div>
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
            label="Estratégias aplicadas no case"
            required
            error={errors.executarStrategies}
            hint="As jogadas que efetivamente moveram o ponteiro. Foque no que foi diferente do que o cliente fazia antes."
          >
            <div className="space-y-3">
              {record.executarStrategies.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/70 bg-background px-4 py-6 text-center text-xs text-muted-foreground">
                  Nenhuma estratégia adicionada ainda.
                </div>
              )}
              {record.executarStrategies.map((str, index) => {
                const updateStr = (patch: Partial<ExecutarStrategy>) => {
                  const next = record.executarStrategies.map((s, i) =>
                    i === index ? { ...s, ...patch } : s,
                  );
                  update({ executarStrategies: next });
                };
                const remove = () =>
                  update({
                    executarStrategies: record.executarStrategies.filter((_, i) => i !== index),
                  });
                return (
                  <div
                    key={index}
                    className="space-y-3 rounded-xl border border-border/70 bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-executar/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-executar">
                        Estratégia {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={remove}
                        aria-label="Remover estratégia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Estratégia / jogada aplicada
                      </label>
                      <Input
                        value={str.strategy}
                        onChange={(e) => updateStr({ strategy: e.target.value })}
                        placeholder='Ex.: "Funil de retargeting com público de carrinho abandonado"'
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Onde foi aplicada
                      </label>
                      <Input
                        value={str.appliedAt}
                        onChange={(e) => updateStr({ appliedAt: e.target.value })}
                        placeholder="Canal ou etapa do funil — ex.: Meta Ads, base lookalike 1%"
                      />
                    </div>

                    {errors[`executarStrategies.${index}`] && (
                      <p className="text-xs text-destructive">
                        {errors[`executarStrategies.${index}`]}
                      </p>
                    )}
                  </div>
                );
              })}

              {record.executarStrategies.length < MAX_EXECUTAR_STRATEGIES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    update({
                      executarStrategies: [
                        ...record.executarStrategies,
                        { strategy: "", appliedAt: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Adicionar estratégia
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground">
                {record.executarStrategies.length}/{MAX_EXECUTAR_STRATEGIES} estratégias
              </p>
            </div>
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
```

### 5.17 Step 5 — Resultado quantitativo

`src/features/cases/steps/Step5Results.tsx`

```tsx
import { Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
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
import { METRICS_BY_MODEL, TIME_TO_RESULT_OPTIONS } from "../options";
import type { MetricOption, SalesModel } from "../options";
import type { CaseRecord, PrimaryMetricEntry, SecondaryMetric } from "../types";
import {
  computeRoas,
  computeVariation,
  formatMetricValue,
  formatVariation,
  isImprovement,
} from "../format";

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const MAX_PRIMARY_METRICS = 4;

export const Step5Results = ({ record, errors, update }: StepProps) => {
  const salesModel = (record.salesModel || "hibrido") as SalesModel;
  const metrics = METRICS_BY_MODEL[salesModel];

  const usedKeys = new Set(record.primaryMetrics.map((m) => m.metricKey).filter(Boolean));
  const availableMetrics = metrics.filter((m) => !usedKeys.has(m.value));

  const roas = computeRoas(record.attributedRevenue, record.mediaInvestment);
  const roasMode = record.products.includes("executar");

  const updatePrimary = (index: number, patch: Partial<PrimaryMetricEntry>) => {
    const next = record.primaryMetrics.map((m, i) =>
      i === index ? { ...m, ...patch } : m,
    );
    update({ primaryMetrics: next });
  };

  const removePrimary = (index: number) => {
    update({ primaryMetrics: record.primaryMetrics.filter((_, i) => i !== index) });
  };

  const addPrimary = () => {
    if (record.primaryMetrics.length >= MAX_PRIMARY_METRICS) return;
    update({
      primaryMetrics: [
        ...record.primaryMetrics,
        { metricKey: "", label: "", unit: "number", before: "", after: "" },
      ],
    });
  };

  const setMetricForRow = (index: number, value: string) => {
    const meta = metrics.find((mm) => mm.value === value) as MetricOption | undefined;
    updatePrimary(index, {
      metricKey: value,
      label: meta?.label ?? "",
      unit: meta?.unit ?? "number",
      before: "",
      after: "",
    });
  };

  const updateSecondary = (index: number, patch: Partial<SecondaryMetric>) => {
    const next = record.secondaryMetrics.map((m, i) =>
      i === index ? { ...m, ...patch } : m,
    );
    update({ secondaryMetrics: next });
  };
  const addSecondary = () => {
    if (record.secondaryMetrics.length >= 2) return;
    update({
      secondaryMetrics: [...record.secondaryMetrics, { name: "", before: "", after: "" }],
    });
  };
  const removeSecondary = (index: number) => {
    update({ secondaryMetrics: record.secondaryMetrics.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <FieldShell
        label="Em quanto tempo o cliente atingiu esse novo patamar?"
        required
        error={errors.timeToResult}
        hint="Esse pode ser diferente do tempo de contrato — considere desde o início do trabalho até o resultado consolidado."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {TIME_TO_RESULT_OPTIONS.map((opt) => {
            const selected = record.timeToResult === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => update({ timeToResult: opt.value })}
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

      <FieldShell
        label="Métricas principais de resultado"
        required
        error={errors.primaryMetrics}
        hint="Adicione ao menos uma. Múltiplas métricas reforçam o case e ajudam a Zyman AI a contar a história completa."
      >
        <div className="space-y-3">
          {record.primaryMetrics.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-background px-4 py-6 text-center text-xs text-muted-foreground">
              Nenhuma métrica adicionada ainda.
            </div>
          )}

          {record.primaryMetrics.map((entry, index) => {
            const variation = computeVariation(entry.before, entry.after);
            const metricMeta = metrics.find((m) => m.value === entry.metricKey);
            const positive = isImprovement(variation, metricMeta?.direction);
            const error = errors[`primaryMetrics.${index}`];
            const rowOptions = metrics.filter(
              (m) => !usedKeys.has(m.value) || m.value === entry.metricKey,
            );

            return (
              <div
                key={index}
                className="rounded-2xl border border-border/70 bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Métrica {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrimary(index)}
                    aria-label="Remover métrica"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Métrica
                    </label>
                    <Select
                      value={entry.metricKey}
                      onValueChange={(value) => setMetricForRow(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {rowOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Antes
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={entry.before}
                      onChange={(e) => updatePrimary(index, { before: e.target.value })}
                      placeholder="0"
                      disabled={!entry.metricKey}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Depois
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={entry.after}
                      onChange={(e) => updatePrimary(index, { after: e.target.value })}
                      placeholder="0"
                      disabled={!entry.metricKey}
                    />
                  </div>
                </div>

                {entry.metricKey && entry.before && entry.after && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-full",
                          positive
                            ? "bg-ter/10 text-ter"
                            : "bg-destructive/10 text-destructive",
                        ].join(" ")}
                      >
                        {variation !== null && variation >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatMetricValue(entry.before, entry.unit)}
                        {" → "}
                        <span className="font-semibold text-foreground">
                          {formatMetricValue(entry.after, entry.unit)}
                        </span>
                      </span>
                    </div>
                    <span
                      className={[
                        "text-base font-bold",
                        positive ? "text-ter" : "text-destructive",
                      ].join(" ")}
                    >
                      {formatVariation(variation)}
                    </span>
                  </div>
                )}

                {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              </div>
            );
          })}

          {record.primaryMetrics.length < MAX_PRIMARY_METRICS && availableMetrics.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={addPrimary}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar métrica principal
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground">
            {record.primaryMetrics.length}/{MAX_PRIMARY_METRICS} métricas principais
          </p>
        </div>
      </FieldShell>

      <FieldShell
        label="Métricas secundárias"
        hint="Indicadores complementares com nome livre (até 2)."
      >
        <div className="space-y-3">
          {record.secondaryMetrics.map((metric, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/70 bg-background p-4"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_auto]">
                <Input
                  value={metric.name}
                  onChange={(e) => updateSecondary(index, { name: e.target.value })}
                  placeholder="Nome da métrica"
                />
                <Input
                  type="number"
                  step="any"
                  value={metric.before}
                  onChange={(e) => updateSecondary(index, { before: e.target.value })}
                  placeholder="Antes"
                />
                <Input
                  type="number"
                  step="any"
                  value={metric.after}
                  onChange={(e) => updateSecondary(index, { after: e.target.value })}
                  placeholder="Depois"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSecondary(index)}
                  aria-label="Remover métrica"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {errors[`secondaryMetrics.${index}`] && (
                <p className="mt-2 text-xs text-destructive">{errors[`secondaryMetrics.${index}`]}</p>
              )}
            </div>
          ))}
          {record.secondaryMetrics.length < 2 && (
            <Button type="button" variant="outline" size="sm" onClick={addSecondary}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar métrica secundária
            </Button>
          )}
        </div>
      </FieldShell>

      {roasMode && (
        <section className="rounded-2xl border border-executar/40 bg-executar/5 p-5">
          <header className="mb-4 flex items-center gap-2">
            <span className="rounded-md bg-executar/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-executar">
              EXECUTAR
            </span>
            <span className="text-xs text-muted-foreground">
              Investimento e receita atribuída no período do case.
            </span>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell
              label="Investimento total em mídia (R$)"
              required
              error={errors.mediaInvestment}
            >
              <Input
                type="number"
                step="any"
                value={record.mediaInvestment}
                onChange={(e) => update({ mediaInvestment: e.target.value })}
                placeholder="0,00"
              />
            </FieldShell>
            <FieldShell
              label="Receita atribuída (R$)"
              required
              error={errors.attributedRevenue}
            >
              <Input
                type="number"
                step="any"
                value={record.attributedRevenue}
                onChange={(e) => update({ attributedRevenue: e.target.value })}
                placeholder="0,00"
              />
            </FieldShell>
          </div>
          {roas !== null && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ROAS calculado
              </span>
              <span className="text-2xl font-bold tracking-tight text-executar">
                {roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
```

### 5.18 Step 6 — Evidências

`src/features/cases/steps/Step6Evidence.tsx`

```tsx
import { ExternalLink, FileText, Mic, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "../components/FieldShell";
import type { CaseRecord } from "../types";

interface StepProps {
  record: CaseRecord;
  errors: Record<string, string>;
  update: (patch: Partial<CaseRecord>) => void;
}

const LinkField = ({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  description,
}: {
  icon: typeof Monitor;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  description: string;
}) => (
  <div className="rounded-xl border border-border/70 bg-background p-4">
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label="Abrir link"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  </div>
);

export const Step6Evidence = ({ record, errors, update }: StepProps) => {
  const hasAnyEvidence = Boolean(
    record.dashboardUrl || record.presentationUrl || record.testimonialUrl,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
        <p className="font-semibold">Última etapa.</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Cases com evidências comprováveis ganham prioridade nas buscas. Sem nenhum link, o case
          é registrado com a flag <span className="font-semibold">"Sem evidência"</span> e fica
          pendente de curadoria.
        </p>
      </div>

      <div className="space-y-3">
        <LinkField
          icon={Monitor}
          label="Link do dashboard de resultado"
          description="Looker, Metabase, Power BI, planilha pública etc."
          value={record.dashboardUrl}
          onChange={(v) => update({ dashboardUrl: v })}
          error={errors.dashboardUrl}
        />
        <LinkField
          icon={FileText}
          label="Link da apresentação completa do case"
          description="Slide deck, PDF, Notion, doc compartilhado."
          value={record.presentationUrl}
          onChange={(v) => update({ presentationUrl: v })}
          error={errors.presentationUrl}
        />
        <LinkField
          icon={Mic}
          label="Link de gravação de chamada com cliente / depoimento"
          description="Vídeo, podcast, gravação de reunião."
          value={record.testimonialUrl}
          onChange={(v) => update({ testimonialUrl: v })}
          error={errors.testimonialUrl}
        />
      </div>

      {!hasAnyEvidence && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          Nenhum link informado — o case será marcado como{" "}
          <span className="font-semibold">"Sem evidência"</span>. Você ainda pode finalizar o
          registro.
        </div>
      )}

      <FieldShell
        label="Observações finais"
        hint="Espaço para qualquer contexto que não coube nas perguntas anteriores."
      >
        <Textarea
          rows={4}
          value={record.finalNotes}
          onChange={(e) => update({ finalNotes: e.target.value })}
        />
      </FieldShell>
    </div>
  );
};
```

### 5.19 Página Cases (listagem com filtros + tabs)

`src/pages/Cases.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Compass,
  Eraser,
  FileSpreadsheet,
  Filter,
  FlaskConical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LOCAL_PREVIEW_EMAIL, isLocalPreviewAuthEnabled } from "@/lib/auth";
import { deleteCase, listCases } from "@/features/cases/storage";
import { fuzzyMatch } from "@/features/cases/search";
import {
  clearExampleCases,
  hasExampleCases,
  seedExampleCases,
} from "@/features/cases/seed";
import type { CaseRecord } from "@/features/cases/types";
import {
  computeVariation,
  formatMetricValue,
  formatRelativeDate,
  formatVariation,
  isImprovement,
  normalizedImprovement,
} from "@/features/cases/format";
import { getMetricDirection } from "@/features/cases/options";
import {
  BRAZIL_STATES,
  OPERATION_REACH_OPTIONS,
  SALES_MODELS,
  SEGMENTS_MOCK,
  STEPS,
  V4_PRODUCTS,
} from "@/features/cases/options";
import type { V4Product } from "@/features/cases/options";
import { cn } from "@/lib/utils";

const PRODUCT_LABEL = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p.label]));
const PRODUCT_TONE = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p.toneClass]));
const SALES_LABEL = Object.fromEntries(SALES_MODELS.map((m) => [m.value, m.label]));

type SortKey = "recent" | "variation";

const ALL = "__all__";

const PRODUCT_INITIAL: Record<string, string> = {
  saber: "S",
  ter: "T",
  executar: "E",
  potencializar: "P",
};

const ProductDots = ({ products }: { products: CaseRecord["products"] }) => (
  <div className="flex items-center gap-1">
    {products.map((p) => (
      <span
        key={p}
        title={PRODUCT_LABEL[p]}
        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${PRODUCT_TONE[p]}`}
      >
        {PRODUCT_INITIAL[p] ?? "·"}
      </span>
    ))}
  </div>
);

const CaseCard = ({
  record,
  onDelete,
  onOpen,
  showOwner,
  isMine,
}: {
  record: CaseRecord;
  onDelete?: () => void;
  onOpen: () => void;
  showOwner?: boolean;
  isMine?: boolean;
}) => {
  const firstMetric = record.primaryMetrics[0];
  const variation = firstMetric
    ? computeVariation(firstMetric.before, firstMetric.after)
    : null;
  const isPositive = firstMetric
    ? isImprovement(variation, getMetricDirection(firstMetric.metricKey))
    : null;
  const extraMetrics = Math.max(0, record.primaryMetrics.length - 1);
  const lastStep = STEPS.find((s) => s.id === record.currentStep);
  const isDraft = record.status === "rascunho";

  const showWarning = record.status === "sem_evidencia";

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleCardKeyDown}
      className="group cursor-pointer border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">
              {record.clientName || "(Cliente sem nome)"}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {record.segment || "—"}
              {(record.clientCity || record.clientState) && (
                <>
                  {" · "}
                  {[record.clientCity, record.clientState].filter(Boolean).join("/")}
                </>
              )}
              {" · "}
              {formatRelativeDate(record.updatedAt)}
            </p>
          </div>
          {record.products.length > 0 && <ProductDots products={record.products} />}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="-mr-2 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!isDraft && firstMetric && firstMetric.label && firstMetric.before && firstMetric.after ? (
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground">
              {firstMetric.label}
              {extraMetrics > 0 && (
                <span className="ml-1 text-[10px] font-semibold text-primary">
                  +{extraMetrics}
                </span>
              )}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-lg font-bold tracking-tight",
                isPositive === null
                  ? "text-muted-foreground"
                  : isPositive
                    ? "text-ter"
                    : "text-destructive",
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {formatVariation(variation)}
            </span>
          </div>
        ) : isDraft ? (
          <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              Parou em <span className="text-foreground">{lastStep?.title ?? "Etapa 1"}</span>
            </span>
            <span className="font-semibold text-foreground">
              {Math.round(((record.currentStep - 1) / STEPS.length) * 100)}%
            </span>
          </div>
        ) : null}

        {(showWarning || isMine || isDraft) && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {showWarning && (
              <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-3 w-3" /> sem evidência
              </span>
            )}
            {isMine && !isDraft && !showWarning && (
              <span className="text-primary">meu</span>
            )}
            {isDraft && <span className="text-amber-600 dark:text-amber-400">rascunho</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EmptyState = ({
  icon: Icon = FileSpreadsheet,
  title,
  description,
  cta,
}: {
  icon?: typeof FileSpreadsheet;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-xs text-muted-foreground">{description}</p>
    </div>
    {cta}
  </div>
);

const Cases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>(ALL);
  const [salesModelFilter, setSalesModelFilter] = useState<string>(ALL);
  const [stateFilter, setStateFilter] = useState<string>(ALL);
  const [reachFilter, setReachFilter] = useState<string>(ALL);
  const [productsFilter, setProductsFilter] = useState<V4Product[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>("");

  useEffect(() => {
    const sync = async () => {
      if (isLocalPreviewAuthEnabled()) {
        setCurrentEmail(LOCAL_PREVIEW_EMAIL);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setCurrentEmail(data.session?.user.email ?? "");
    };
    void sync();
  }, []);

  const refresh = () => setCases(listCases());

  useEffect(() => {
    refresh();
  }, []);

  const toggleProduct = (product: V4Product) => {
    setProductsFilter((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSegmentFilter(ALL);
    setSalesModelFilter(ALL);
    setStateFilter(ALL);
    setReachFilter(ALL);
    setProductsFilter([]);
  };

  const hasActiveFilters =
    Boolean(search) ||
    segmentFilter !== ALL ||
    salesModelFilter !== ALL ||
    stateFilter !== ALL ||
    reachFilter !== ALL ||
    productsFilter.length > 0;

  const applyCommonFilters = (records: CaseRecord[]): CaseRecord[] => {
    let result = records;
    const term = search.trim();
    if (term) {
      result = result.filter((c) => {
        const haystack = [
          c.clientName,
          c.v4Unit,
          c.segment,
          c.clientCity ?? "",
          c.clientState ?? "",
          c.salesModel ? SALES_LABEL[c.salesModel] : "",
          ...c.products.map((p) => PRODUCT_LABEL[p] ?? p),
          ...(c.primaryMetrics?.map((m) => m.label) ?? []),
          ...(c.initialChallenges ?? []),
          c.problem ?? "",
          c.rootCause ?? "",
          c.ownerEmail ?? "",
        ]
          .filter(Boolean)
          .join(" ");
        return fuzzyMatch(term, haystack);
      });
    }
    if (segmentFilter !== ALL) result = result.filter((c) => c.segment === segmentFilter);
    if (salesModelFilter !== ALL) result = result.filter((c) => c.salesModel === salesModelFilter);
    if (stateFilter !== ALL) result = result.filter((c) => c.clientState === stateFilter);
    if (reachFilter !== ALL) result = result.filter((c) => c.operationReach === reachFilter);
    if (productsFilter.length > 0) {
      result = result.filter((c) => productsFilter.every((p) => c.products.includes(p)));
    }
    return result;
  };

  const sortRecords = (records: CaseRecord[]): CaseRecord[] => {
    const list = [...records];
    if (sortKey === "recent") {
      list.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
    } else if (sortKey === "variation") {
      const score = (c: CaseRecord) => {
        const m = c.primaryMetrics[0];
        if (!m) return -Infinity;
        const v = computeVariation(m.before, m.after);
        return normalizedImprovement(v, m.metricKey);
      };
      list.sort((a, b) => score(b) - score(a));
    }
    return list;
  };

  const myEmailLower = currentEmail.toLowerCase();

  const explore = useMemo(
    () =>
      sortRecords(
        applyCommonFilters(cases.filter((c) => c.status !== "rascunho")),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, search, segmentFilter, salesModelFilter, stateFilter, reachFilter, productsFilter, sortKey],
  );

  const myCases = useMemo(
    () =>
      sortRecords(
        applyCommonFilters(
          cases.filter(
            (c) =>
              c.status !== "rascunho" &&
              c.ownerEmail?.toLowerCase() === myEmailLower,
          ),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, search, segmentFilter, salesModelFilter, stateFilter, reachFilter, productsFilter, sortKey, myEmailLower],
  );

  const myDrafts = useMemo(
    () =>
      sortRecords(
        cases.filter(
          (c) =>
            c.status === "rascunho" &&
            (!c.ownerEmail || c.ownerEmail.toLowerCase() === myEmailLower),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, sortKey, myEmailLower],
  );

  const myStats = useMemo(() => {
    const mine = cases.filter(
      (c) => c.ownerEmail?.toLowerCase() === myEmailLower,
    );
    return {
      total: mine.length,
      complete: mine.filter((c) => c.status === "completo").length,
      drafts: mine.filter((c) => c.status === "rascunho").length,
      noEvidence: mine.filter((c) => c.status === "sem_evidencia").length,
    };
  }, [cases, myEmailLower]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCase(pendingDelete);
    setPendingDelete(null);
    refresh();
    toast({ title: "Case removido" });
  };

  const exampleLoaded = hasExampleCases();

  const handleSeed = () => {
    const count = seedExampleCases();
    refresh();
    toast({
      title: `${count} cases de exemplo carregados`,
      description: "Use para visualizar a experiência com a base populada.",
    });
  };

  const handleClearExamples = () => {
    const count = clearExampleCases();
    refresh();
    toast({ title: `${count} exemplos removidos` });
  };

  const renderFiltersBar = () => (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, segmento, métrica…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="variation">Maior variação</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os segmentos</SelectItem>
            {SEGMENTS_MOCK.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={salesModelFilter} onValueChange={setSalesModelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Modelo de venda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os modelos</SelectItem>
            {SALES_MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os estados</SelectItem>
            {BRAZIL_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={reachFilter} onValueChange={setReachFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Abrangência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toda abrangência</SelectItem>
            {OPERATION_REACH_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Filter className="h-3 w-3" /> Produtos V4
        </span>
        {V4_PRODUCTS.map((p) => {
          const selected = productsFilter.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => toggleProduct(p.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-all",
                selected
                  ? `${p.toneClass} shadow-sm`
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> Zyman AI
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Cases
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore cases publicados por todas as unidades V4. Use como munição comercial,
              referência de estratégia e fonte para a Zyman AI por segmento e modelo de venda.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {exampleLoaded ? (
              <Button variant="outline" size="sm" onClick={handleClearExamples}>
                <Eraser className="mr-1.5 h-3.5 w-3.5" /> Limpar exemplos
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSeed}>
                <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Carregar exemplos
              </Button>
            )}
            <Button asChild size="lg">
              <Link to="/cases/novo">
                <Plus className="mr-1.5 h-4 w-4" /> Registrar case
              </Link>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="explorar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="explorar">
              <Compass className="mr-1.5 h-3.5 w-3.5" />
              Explorar ({explore.length})
            </TabsTrigger>
            <TabsTrigger value="meus">
              Meus cases ({myCases.length})
            </TabsTrigger>
            <TabsTrigger value="rascunhos">
              Rascunhos ({myDrafts.length})
              {myDrafts.length > 0 && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorar" className="space-y-4">
            {renderFiltersBar()}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{explore.length}</strong>{" "}
                {explore.length === 1 ? "case encontrado" : "cases encontrados"}
              </span>
            </div>

            {explore.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  icon={Filter}
                  title="Nenhum case com esses filtros"
                  description="Tente afrouxar os critérios ou limpar os filtros para ver mais resultados."
                  cta={
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Compass}
                  title="Nenhum case publicado ainda"
                  description="Quando os primeiros cases forem registrados pelas unidades, eles aparecerão aqui pra todo mundo explorar. Para visualizar como será a experiência, carregue exemplos."
                  cta={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleSeed}>
                        <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Carregar exemplos
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/cases/novo">
                          <Plus className="mr-1.5 h-4 w-4" /> Registrar primeiro case
                        </Link>
                      </Button>
                    </div>
                  }
                />
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {explore.map((c) => (
                  <CaseCard
                    key={c.id}
                    record={c}
                    showOwner
                    isMine={c.ownerEmail?.toLowerCase() === myEmailLower}
                    onOpen={() =>
                      navigate(
                        c.status === "rascunho"
                          ? `/cases/${c.id}/editar`
                          : `/cases/${c.id}`,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meus" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total registrados", value: myStats.total, tone: "text-foreground" },
                { label: "Completos", value: myStats.complete, tone: "text-ter" },
                { label: "Sem evidência", value: myStats.noEvidence, tone: "text-orange-600" },
                { label: "Rascunhos", value: myStats.drafts, tone: "text-amber-600" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {renderFiltersBar()}

            {myCases.length === 0 ? (
              <EmptyState
                title="Você ainda não publicou nenhum case"
                description="Conclua o wizard de 6 etapas e seu case aparecerá aqui — pronto para alimentar a Zyman AI."
                cta={
                  <Button asChild size="sm">
                    <Link to="/cases/novo">
                      <Plus className="mr-1.5 h-4 w-4" /> Registrar primeiro case
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {myCases.map((c) => (
                  <CaseCard
                    key={c.id}
                    record={c}
                    isMine
                    onOpen={() =>
                      navigate(
                        c.status === "rascunho"
                          ? `/cases/${c.id}/editar`
                          : `/cases/${c.id}`,
                      )
                    }
                    onDelete={() => setPendingDelete(c.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rascunhos" className="space-y-4">
            {myDrafts.length === 0 ? (
              <EmptyState
                title="Sem rascunhos pendentes"
                description="Quando você começar um registro e não terminar, ele aparecerá aqui para você retomar de onde parou."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {myDrafts.map((c) => (
                  <CaseCard
                    key={c.id}
                    record={c}
                    onOpen={() => navigate(`/cases/${c.id}/editar`)}
                    onDelete={() => setPendingDelete(c.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este case?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente do seu
              navegador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Cases;
```

### 5.20 Página CaseForm (wizard orquestrador)

`src/pages/CaseForm.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Save,
  Sparkles,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LOCAL_PREVIEW_EMAIL,
  isLocalPreviewAuthEnabled,
} from "@/lib/auth";
import { StepIndicator } from "@/features/cases/components/StepIndicator";
import { Step1Identification } from "@/features/cases/steps/Step1Identification";
import { Step2Classification } from "@/features/cases/steps/Step2Classification";
import { Step3Context } from "@/features/cases/steps/Step3Context";
import { Step4Strategy } from "@/features/cases/steps/Step4Strategy";
import { Step5Results } from "@/features/cases/steps/Step5Results";
import { Step6Evidence } from "@/features/cases/steps/Step6Evidence";
import { STEPS } from "@/features/cases/options";
import { emptyCase } from "@/features/cases/types";
import type { CaseRecord } from "@/features/cases/types";
import { getCase, upsertCase } from "@/features/cases/storage";
import {
  computeFinalStatus,
  getStepCompletion,
  isStepReachable,
  validateStep,
} from "@/features/cases/validation";
import type { StepCompletion } from "@/features/cases/validation";
import { formatRelativeDate } from "@/features/cases/format";

const CaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [record, setRecord] = useState<CaseRecord>(() => emptyCase());
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const initializedRef = useRef(false);

  // Load draft or seed owner email on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const seedEmail = async () => {
      let email = "";
      if (isLocalPreviewAuthEnabled()) {
        email = LOCAL_PREVIEW_EMAIL;
      } else {
        const { data } = await supabase.auth.getSession();
        email = data.session?.user.email ?? "";
      }

      if (id) {
        const existing = getCase(id);
        if (existing) {
          setRecord(existing);
          return;
        }
      }
      setRecord((prev) => ({ ...prev, ownerEmail: email || prev.ownerEmail }));
    };
    void seedEmail();
  }, [id]);

  // Auto-save with debounce
  useEffect(() => {
    if (!record.ownerEmail) return;
    if (submitted) return;
    const handle = window.setTimeout(() => {
      const saved = upsertCase(record);
      setLastSavedAt(saved.updatedAt);
    }, 600);
    return () => window.clearTimeout(handle);
  }, [record, submitted]);

  const update = (patch: Partial<CaseRecord>) => {
    setRecord((prev) => ({ ...prev, ...patch }));
  };

  const currentValidation = useMemo(
    () => validateStep(record.currentStep, record),
    [record],
  );

  const completion = useMemo(() => {
    const map: Record<number, StepCompletion> = {};
    STEPS.forEach((s) => {
      map[s.id] = getStepCompletion(s.id, record);
    });
    return map;
  }, [record]);

  const completeCount = useMemo(
    () => Object.values(completion).filter((s) => s === "complete").length,
    [completion],
  );

  const overallProgress = Math.round((completeCount / STEPS.length) * 100);

  const goToStep = (step: number) => {
    if (step < 1 || step > STEPS.length) return;
    if (step > record.currentStep && !currentValidation.isValid) {
      setShowStepErrors(true);
      return;
    }
    if (!isStepReachable(step, record) && step > record.currentStep) {
      setShowStepErrors(true);
      return;
    }
    setShowStepErrors(false);
    setRecord((prev) => ({ ...prev, currentStep: step }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!currentValidation.isValid) {
      setShowStepErrors(true);
      toast({
        variant: "destructive",
        title: "Faltam campos obrigatórios",
        description: "Revise os campos destacados antes de continuar.",
      });
      return;
    }
    if (record.currentStep === STEPS.length) {
      handleSubmit();
      return;
    }
    goToStep(record.currentStep + 1);
  };

  const handleSaveDraft = () => {
    const saved = upsertCase({ ...record, status: "rascunho" });
    setLastSavedAt(saved.updatedAt);
    toast({
      title: "Rascunho salvo",
      description: "Você pode retomar este case a qualquer momento.",
    });
  };

  const handleSubmit = () => {
    for (let i = 1; i <= STEPS.length; i += 1) {
      if (!validateStep(i, record).isValid) {
        toast({
          variant: "destructive",
          title: `Etapa ${i} incompleta`,
          description: "Volte e preencha os campos obrigatórios para finalizar o registro.",
        });
        setRecord((prev) => ({ ...prev, currentStep: i }));
        setShowStepErrors(true);
        return;
      }
    }
    const finalStatus = computeFinalStatus(record);
    upsertCase({ ...record, status: finalStatus });
    setSubmitted(true);
    toast({
      title: "Case registrado!",
      description:
        finalStatus === "completo"
          ? "Já está disponível na base."
          : "Registrado sem evidência — fica pendente de curadoria.",
    });
  };

  if (submitted) {
    const finalStatus = computeFinalStatus(record);
    return (
      <Layout>
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ter/10 text-ter">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Case registrado</h1>
            <p className="text-sm text-muted-foreground">
              {finalStatus === "completo"
                ? "Tudo certo. O case já está disponível para outros investidores e para a Zyman AI."
                : "Registrado, mas sem evidência. Fica pendente de curadoria — adicione um link quando puder para destravá-lo."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to={`/cases/${record.id}`}>Ver case publicado</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/cases">Voltar para lista</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/cases/novo">Registrar outro</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const stepMeta = STEPS[record.currentStep - 1];
  const isLastStep = record.currentStep === STEPS.length;

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <Link
              to="/cases"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Zyman AI (Cases)
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Registrar novo case
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Cases viram munição comercial e alimentam a Zyman AI. Quanto mais estruturada a
              entrada, mais útil a saída.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Progresso
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground">{overallProgress}%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar rascunho
            </Button>
          </div>
        </header>

        <StepIndicator
          currentStep={record.currentStep}
          completion={completion}
          onJump={goToStep}
        />

        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Etapa {record.currentStep} de {STEPS.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{stepMeta.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stepMeta.subtitle}</p>
            </div>
            {lastSavedAt && (
              <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-muted-foreground sm:flex">
                <CloudUpload className="h-3 w-3" />
                Salvo {formatRelativeDate(lastSavedAt)}
              </div>
            )}
          </div>

          {record.currentStep === 1 && (
            <Step1Identification
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 2 && (
            <Step2Classification
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 3 && (
            <Step3Context
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 4 && (
            <Step4Strategy
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 5 && (
            <Step5Results
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
          {record.currentStep === 6 && (
            <Step6Evidence
              record={record}
              errors={showStepErrors ? currentValidation.errors : {}}
              update={update}
            />
          )}
        </div>

        <div className="sticky bottom-3 z-30 flex flex-col items-stretch gap-2 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            disabled={record.currentStep === 1}
            onClick={() => goToStep(record.currentStep - 1)}
            className="justify-start"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Anterior
          </Button>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button onClick={handleNext}>
                Próxima etapa
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="mr-1.5 h-4 w-4" /> Finalizar registro
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CaseForm;
```

### 5.21 Página CaseDetail (visualização read-only)

`src/pages/CaseDetail.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mic,
  Monitor,
  PenLine,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LOCAL_PREVIEW_EMAIL, isLocalPreviewAuthEnabled } from "@/lib/auth";
import { deleteCase, getCase } from "@/features/cases/storage";
import type { CaseRecord } from "@/features/cases/types";
import {
  computeRoas,
  computeVariation,
  formatMetricValue,
  formatRelativeDate,
  formatVariation,
  isImprovement,
} from "@/features/cases/format";
import { getMetricDirection } from "@/features/cases/options";
import {
  BRAZIL_STATES,
  OPERATION_REACH_OPTIONS,
  PREVIOUS_ATTEMPT_OPTIONS,
  SABER_EXECUTION_OPTIONS,
  SALES_MODELS,
  TIME_TO_RESULT_OPTIONS,
  V4_PRODUCTS,
} from "@/features/cases/options";
import { cn } from "@/lib/utils";

const PRODUCT_META = Object.fromEntries(V4_PRODUCTS.map((p) => [p.value, p]));
const SALES_LABEL = Object.fromEntries(SALES_MODELS.map((m) => [m.value, m.label]));
const TIME_LABEL = Object.fromEntries(TIME_TO_RESULT_OPTIONS.map((t) => [t.value, t.label]));
const PREVIOUS_LABEL = Object.fromEntries(
  PREVIOUS_ATTEMPT_OPTIONS.map((p) => [p.value, p.label]),
);
const SABER_EXECUTION_LABEL = Object.fromEntries(
  SABER_EXECUTION_OPTIONS.map((s) => [s.value, s.label]),
);
const STATE_LABEL = Object.fromEntries(BRAZIL_STATES.map((s) => [s.value, s.label]));
const REACH_LABEL = Object.fromEntries(
  OPERATION_REACH_OPTIONS.map((r) => [r.value, r.label]),
);

const StatusBadge = ({ status }: { status: CaseRecord["status"] }) => {
  if (status === "rascunho") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        Rascunho
      </span>
    );
  }
  if (status === "sem_evidencia") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-400/10 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
        <AlertCircle className="h-3 w-3" /> Sem evidência
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ter/40 bg-ter/10 px-2.5 py-0.5 text-xs font-semibold text-ter">
      <CheckCircle2 className="h-3 w-3" /> Completo
    </span>
  );
};

const SectionShell = ({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
    <header className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        Etapa {step}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
    <div className="space-y-5">{children}</div>
  </section>
);

const Field = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="text-sm leading-relaxed text-foreground">
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  </div>
);

const TagList = ({
  items,
  toneClass,
}: {
  items: string[];
  toneClass?: string;
}) => {
  if (!items?.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
            toneClass ?? "border-border/60 bg-muted/40 text-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const Prose = ({ text }: { text: string }) =>
  text ? (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  );

const CaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    const r = getCase(id);
    setRecord(r ?? null);
  }, [id]);

  useEffect(() => {
    const sync = async () => {
      if (isLocalPreviewAuthEnabled()) {
        setCurrentEmail(LOCAL_PREVIEW_EMAIL);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setCurrentEmail(data.session?.user.email ?? "");
    };
    void sync();
  }, []);

  const isOwner = useMemo(
    () =>
      record?.ownerEmail?.toLowerCase() === currentEmail.toLowerCase() &&
      Boolean(currentEmail),
    [record, currentEmail],
  );

  if (!record) {
    return (
      <Layout>
        <section className="mx-auto max-w-md py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Case não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O case que você tentou abrir não existe ou foi removido.
          </p>
          <Button asChild className="mt-6">
            <Link to="/cases">Voltar para Zyman AI (Cases)</Link>
          </Button>
        </section>
      </Layout>
    );
  }

  // Se for rascunho, redireciona pro editor — não faz sentido visualização read-only
  if (record.status === "rascunho") {
    navigate(`/cases/${record.id}/editar`, { replace: true });
    return null;
  }

  const handleDelete = () => {
    deleteCase(record.id);
    setConfirmDelete(false);
    toast({ title: "Case removido" });
    navigate("/cases", { replace: true });
  };

  const roas = computeRoas(record.attributedRevenue, record.mediaInvestment);

  return (
    <Layout>
      <section className="space-y-6 animate-fade-in">
        <Link
          to="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Zyman AI (Cases)
        </Link>

        {/* Hero */}
        <header className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={record.status} />
                {record.salesModel && (
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {SALES_LABEL[record.salesModel]}
                  </span>
                )}
                {record.segment && (
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {record.segment}
                  </span>
                )}
                {isOwner && (
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Meu case
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {record.clientName || "(Cliente sem nome)"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Registrado por <strong className="text-foreground">{record.ownerEmail || "—"}</strong>
                {record.v4Unit && <> · {record.v4Unit}</>}
                {(record.clientCity || record.clientState) && (
                  <>
                    {" · "}
                    {[record.clientCity, record.clientState].filter(Boolean).join("/")}
                  </>
                )}
                {record.operationReach && (
                  <> · {REACH_LABEL[record.operationReach] ?? record.operationReach}</>
                )}
                {" · atualizado "}
                {formatRelativeDate(record.updatedAt)}
              </p>
              {record.products.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {record.products.map((p) => (
                    <span
                      key={p}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        PRODUCT_META[p]?.toneClass,
                      )}
                    >
                      {PRODUCT_META[p]?.label}
                      {record.primaryDriver === p && " ★"}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 self-start">
              {isOwner && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/cases/${record.id}/editar`}>
                      <PenLine className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Hero metrics */}
          {record.primaryMetrics.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {record.primaryMetrics.map((m, i) => {
                const variation = computeVariation(m.before, m.after);
                const positive = isImprovement(variation, getMetricDirection(m.metricKey));
                const trendingUp = variation !== null && variation >= 0;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-background px-4 py-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="line-through">
                          {formatMetricValue(m.before, m.unit)}
                        </span>
                        <span className="mx-1">→</span>
                        <span className="text-base font-bold text-foreground">
                          {formatMetricValue(m.after, m.unit)}
                        </span>
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-bold",
                          positive ? "text-ter" : "text-destructive",
                        )}
                      >
                        {trendingUp ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {formatVariation(variation)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {record.timeToResult && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Resultado consolidado em{" "}
              <strong>{TIME_LABEL[record.timeToResult] ?? record.timeToResult}</strong>
            </div>
          )}
        </header>

        {/* Etapa 1 — Identificação */}
        <SectionShell step={1} title="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente" value={record.clientName} />
            <Field label="CNPJ" value={record.clientCnpj} />
            <Field
              label="Status do cliente"
              value={record.clientStatus === "ativo" ? "Ativo" : record.clientStatus === "inativo" ? "Inativo" : ""}
            />
            <Field label="Unidade V4" value={record.v4Unit} />
            <Field
              label="Sede do cliente"
              value={
                [record.clientCity, record.clientState ? STATE_LABEL[record.clientState] : ""]
                  .filter(Boolean)
                  .join(" / ") || ""
              }
            />
            <Field
              label="Abrangência da operação"
              value={
                record.operationReach ? REACH_LABEL[record.operationReach] ?? record.operationReach : ""
              }
            />
            <Field
              label="Pessoas envolvidas"
              value={
                record.collaborators.length > 0
                  ? record.collaborators.filter(Boolean).join(" · ")
                  : ""
              }
              className="sm:col-span-2"
            />
          </div>
        </SectionShell>

        {/* Etapa 2 — Classificação */}
        <SectionShell step={2} title="Classificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Modelo de venda"
              value={record.salesModel ? SALES_LABEL[record.salesModel] : ""}
            />
            <Field label="Segmento" value={record.segment} />
            <Field
              label="Produtos V4 contratados"
              className="sm:col-span-2"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {record.products.map((p) => (
                    <span
                      key={p}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        PRODUCT_META[p]?.toneClass,
                      )}
                    >
                      {PRODUCT_META[p]?.label}
                    </span>
                  ))}
                </div>
              }
            />
            {record.primaryDriver && (
              <Field
                label="Principal motor do resultado"
                className="sm:col-span-2"
                value={
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      PRODUCT_META[record.primaryDriver]?.toneClass,
                    )}
                  >
                    ★ {PRODUCT_META[record.primaryDriver]?.label}
                  </span>
                }
              />
            )}
          </div>
        </SectionShell>

        {/* Etapa 3 — Contexto */}
        <SectionShell step={3} title="Contexto do desafio">
          <Field
            label="Desafios iniciais que o cliente trouxe"
            value={
              <TagList
                items={[
                  ...record.initialChallenges,
                  ...(record.initialChallengesOther
                    ? [record.initialChallengesOther]
                    : []),
                ]}
                toneClass="border-primary/30 bg-primary/5 text-primary"
              />
            }
          />
          <Field label="Problema do cliente" value={<Prose text={record.problem} />} />
          <Field label="Causa raiz identificada" value={<Prose text={record.rootCause} />} />
          <Field
            label="Restrições"
            value={
              <TagList
                items={[
                  ...record.restrictions,
                  ...(record.restrictionsOther ? [record.restrictionsOther] : []),
                ]}
              />
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Já havia tentado resolver?"
              value={
                record.previousAttempt ? PREVIOUS_LABEL[record.previousAttempt] : ""
              }
            />
            {record.previousAttempt && record.previousAttempt !== "nao" && (
              <Field
                label="O que não funcionou"
                value={<Prose text={record.previousFailureReason} />}
              />
            )}
          </div>
        </SectionShell>

        {/* Etapa 4 — Estratégia */}
        <SectionShell step={4} title="Estratégia aplicada">
          {record.products.includes("saber") && (
            <div className={cn("rounded-2xl border p-5", PRODUCT_META.saber?.toneClass)}>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  SABER
                </span>
                <span className="text-xs text-muted-foreground">
                  Direcionamentos estratégicos entregues
                </span>
              </div>
              <div className="space-y-3">
                {record.saberDirections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  record.saberDirections.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-saber">
                        Direcionamento {i + 1}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {d.direction || "—"}
                      </p>
                      {d.rationale && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Por que fez sentido
                          </p>
                          <p className="text-sm text-foreground">{d.rationale}</p>
                        </div>
                      )}
                      {d.impact && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Impacto observado
                          </p>
                          <p className="text-sm text-foreground">{d.impact}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {record.saberExecution && (
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Execução pelo cliente
                    </p>
                    <p className="text-sm text-foreground">
                      {SABER_EXECUTION_LABEL[record.saberExecution] ?? record.saberExecution}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {record.products.includes("ter") && (
            <div className={cn("rounded-2xl border p-5", PRODUCT_META.ter?.toneClass)}>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  TER
                </span>
                <span className="text-xs text-muted-foreground">
                  Percepção de valor gerada pela implementação
                </span>
              </div>
              <Prose text={record.terValuePerception} />
            </div>
          )}

          {record.products.includes("executar") && (
            <div className={cn("rounded-2xl border p-5", PRODUCT_META.executar?.toneClass)}>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  EXECUTAR
                </span>
                <span className="text-xs text-muted-foreground">
                  Operação de mídia, criativo e estratégias
                </span>
              </div>
              <div className="space-y-5">
                <Field
                  label="Profissionais V4 alocados"
                  value={
                    <TagList
                      items={record.executarProfessionals}
                      toneClass="border-executar/30 bg-executar/5 text-executar"
                    />
                  }
                />

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Canais de mídia operados
                  </p>
                  {record.executarChannels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {record.executarChannels.map((c, i) => {
                        const r = computeRoas(c.revenue, c.investment);
                        return (
                          <div
                            key={i}
                            className="rounded-xl border border-border/60 bg-background p-3"
                          >
                            <p className="text-sm font-semibold text-foreground">
                              {c.channel || "Canal sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatMetricValue(c.investment, "currency")} →{" "}
                              <span className="font-semibold text-foreground">
                                {formatMetricValue(c.revenue, "currency")}
                              </span>
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-xs font-bold",
                                r === null
                                  ? "text-muted-foreground"
                                  : r >= 1
                                    ? "text-ter"
                                    : "text-destructive",
                              )}
                            >
                              ROAS{" "}
                              {r === null
                                ? "—"
                                : `${r.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Field
                  label="Tipos de criativo"
                  value={<TagList items={record.executarCreatives} />}
                />
                <Field
                  label="Comunicação dos criativos"
                  value={<Prose text={record.executarCreativesCommunication} />}
                />

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Estratégias aplicadas
                  </p>
                  {record.executarStrategies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {record.executarStrategies.map((s, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-border/60 bg-background p-3"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-executar">
                            Estratégia {i + 1}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {s.strategy}
                          </p>
                          {s.appliedAt && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Onde:</span> {s.appliedAt}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {record.products.includes("potencializar") && (
            <div
              className={cn("rounded-2xl border p-5", PRODUCT_META.potencializar?.toneClass)}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  POTENCIALIZAR
                </span>
                <span className="text-xs text-muted-foreground">
                  Sucesso direcionado e valor percebido
                </span>
              </div>
              <div className="space-y-4">
                <Field
                  label="Modelo de valor percebido"
                  value={<Prose text={record.potencializarValueModel} />}
                />
                <Field
                  label="Indicador de valor acordado"
                  value={record.potencializarIndicator}
                />
              </div>
            </div>
          )}
        </SectionShell>

        {/* Etapa 5 — Resultado */}
        <SectionShell step={5} title="Resultado quantitativo">
          <Field
            label="Tempo até o resultado"
            value={record.timeToResult ? TIME_LABEL[record.timeToResult] : ""}
          />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Métricas principais
            </p>
            {record.primaryMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {record.primaryMetrics.map((m, i) => {
                  const variation = computeVariation(m.before, m.after);
                  const positive = isImprovement(variation, getMetricDirection(m.metricKey));
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Antes: {formatMetricValue(m.before, m.unit)} · Depois:{" "}
                        <span className="font-semibold text-foreground">
                          {formatMetricValue(m.after, m.unit)}
                        </span>
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-base font-bold",
                          positive ? "text-ter" : "text-destructive",
                        )}
                      >
                        {formatVariation(variation)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {record.secondaryMetrics.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Métricas secundárias
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {record.secondaryMetrics.map((m, i) => {
                  const variation = computeVariation(m.before, m.after);
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background p-3"
                    >
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.before} → <span className="font-semibold">{m.after}</span> ·{" "}
                        <span
                          className={cn(
                            variation !== null && variation >= 0
                              ? "text-ter"
                              : "text-destructive",
                          )}
                        >
                          {formatVariation(variation)}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {record.products.includes("executar") &&
            (record.mediaInvestment || record.attributedRevenue) && (
              <div className="rounded-2xl border border-executar/40 bg-executar/5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-executar">
                  Investimento × Receita atribuída
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field
                    label="Investimento total"
                    value={formatMetricValue(record.mediaInvestment, "currency")}
                  />
                  <Field
                    label="Receita atribuída"
                    value={formatMetricValue(record.attributedRevenue, "currency")}
                  />
                  <Field
                    label="ROAS calculado"
                    value={
                      roas === null ? (
                        "—"
                      ) : (
                        <span className="text-xl font-bold text-executar">
                          {roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            )}
        </SectionShell>

        {/* Etapa 6 — Evidências */}
        <SectionShell step={6} title="Evidências">
          <div className="grid gap-3 sm:grid-cols-3">
            <EvidenceLink
              icon={Monitor}
              label="Dashboard de resultado"
              url={record.dashboardUrl}
            />
            <EvidenceLink
              icon={FileText}
              label="Apresentação completa"
              url={record.presentationUrl}
            />
            <EvidenceLink
              icon={Mic}
              label="Depoimento / chamada"
              url={record.testimonialUrl}
            />
          </div>
          {record.finalNotes && (
            <Field label="Observações finais" value={<Prose text={record.finalNotes} />} />
          )}
        </SectionShell>
      </section>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este case?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

const EvidenceLink = ({
  icon: Icon,
  label,
  url,
}: {
  icon: typeof Monitor;
  label: string;
  url: string;
}) => {
  const hasUrl = Boolean(url);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-all",
        hasUrl
          ? "border-border/70 bg-background hover:border-primary/40"
          : "border-dashed border-border/50 bg-muted/20",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          hasUrl ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {hasUrl ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 truncate text-xs text-primary transition-colors hover:underline"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">Não informado</p>
        )}
      </div>
    </div>
  );
};

export default CaseDetail;
```

---

## 6. Notas finais

### 6.1 Rota dos rascunhos
- Card de rascunho navega para `/cases/:id/editar` (wizard).
- Card de case publicado navega para `/cases/:id` (visualização). Se for um rascunho, o `CaseDetail` redireciona automaticamente para o editor.
- Wizard com `id` na URL carrega o registro existente do localStorage. Sem `id` (rota `/cases/novo`) cria novo.

### 6.2 Validação
Em `validation.ts`, a constante `BYPASS_VALIDATION = true` desliga todas as obrigatoriedades para facilitar testes de UX. Antes de publicar, troque para `false`.

A função `getStepCompletion(step, record)` retorna `'empty' | 'partial' | 'complete'` independente do flag — é o que alimenta o `StepIndicator` com 3 estados visuais (não iniciada, em andamento, completa).

### 6.3 Migração futura para Supabase
A camada de persistência (`storage.ts`) é a única superfície que precisa ser trocada. Mantenha as assinaturas (`listCases`, `getCase`, `upsertCase`, `deleteCase`) e substitua a implementação por chamadas à API.

Schema sugerido para o Supabase (resumo das principais tabelas):

```sql
create table cases (
  id uuid primary key,
  owner_email text not null,
  v4_unit text,
  client_name text,
  client_cnpj text,
  client_status text,
  client_city text,
  client_state text,
  operation_reach text,
  sales_model text,
  segment text,
  status text not null,
  current_step int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
  -- + colunas para os textos longos (problem, root_cause, etc.)
);

create table case_products (
  case_id uuid references cases on delete cascade,
  product text not null check (product in ('saber','ter','executar','potencializar')),
  is_primary_driver boolean default false,
  primary key (case_id, product)
);

create table metrics_catalog (
  metric_key text primary key,
  label text not null,
  unit text not null check (unit in ('currency','percent','number','days')),
  direction text not null check (direction in ('higher_is_better','lower_is_better'))
);

create table case_primary_metrics (
  id uuid primary key,
  case_id uuid references cases on delete cascade,
  metric_key text references metrics_catalog,
  position int not null,
  value_before numeric not null,
  value_after numeric not null
);

create table case_channels (
  id uuid primary key,
  case_id uuid references cases on delete cascade,
  channel text not null,
  investment numeric not null,
  revenue numeric not null
);

-- + tabelas auxiliares para saber_directions, executar_strategies, secondary_metrics, evidências, etc.
```

### 6.4 Lista de campos por etapa (resumo)

| Etapa | Campos | Notas |
|---|---|---|
| 1 — Identificação | email, unidade V4, nome do cliente, CNPJ, cidade, estado UF, abrangência, status, colaboradores | Email auto-preenchido do usuário logado |
| 2 — Classificação | modelo de venda, segmento, produtos V4 (multi), principal motor (condicional) | Principal motor só aparece com 2+ produtos |
| 3 — Contexto | desafios iniciais, problema, causa raiz, restrições, tentativa anterior, motivo do fracasso (condicional) | Motivo só se houve tentativa anterior |
| 4 — Estratégia | depende dos produtos marcados | SABER: direcionamentos repetidor + execução; TER: percepção de valor; EXECUTAR: profissionais alocados, canais com investimento+receita, criativos, comunicação, estratégias repetidor; POTENCIALIZAR: modelo de valor + indicador |
| 5 — Resultado | tempo até resultado, métricas principais (repetidor 1-4), métricas secundárias (até 2), investimento+receita (condicional EXECUTAR) | Cores por direção da métrica (CPL/CAC menor = verde) |
| 6 — Evidências | dashboard, apresentação, depoimento (URLs opcionais), observações finais | Sem nenhum link → status `sem_evidencia` |

### 6.5 Convenções de cores e tema

- Status: amber (rascunho), orange (sem evidência), ter green (completo)
- Produtos: cores próprias (saber red, ter green, executar orange, potencializar purple)
- Variação: `text-ter` se positivo (considerando direção), `text-destructive` se negativo
- Hover de card: borda primary, leve translate-y, shadow-md
