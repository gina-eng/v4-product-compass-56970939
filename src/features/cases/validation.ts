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
    // Identificação
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
    // Classificação
    if (!isNonEmpty(record.salesModel)) errors.salesModel = "Selecione o modelo de venda.";
    if (!isNonEmpty(record.segment)) errors.segment = "Selecione o segmento.";
    if (record.products.length === 0)
      errors.products = "Marque ao menos um produto V4 envolvido.";
  }

  if (step === 2) {
    if (record.initialChallenges.length === 0 && !isNonEmpty(record.initialChallengesOther))
      errors.initialChallenges = "Selecione ao menos um desafio inicial.";
    if (!isNonEmpty(record.problem)) errors.problem = "Descreva o contexto do desafio.";
    if (record.problem.length > 500) errors.problem = "Limite de 500 caracteres.";
    if (record.restrictions.length === 0 && !isNonEmpty(record.restrictionsOther))
      errors.restrictions = "Selecione pelo menos uma restrição.";
  }

  if (step === 3) {
    if (record.products.includes("saber")) {
      const first = record.saberDirections[0];
      if (!first || !isNonEmpty(first.direction))
        errors.saberDirections = "Descreva o direcionamento estratégico.";
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
      const firstStrategy = record.executarStrategies[0];
      if (!firstStrategy || !isNonEmpty(firstStrategy.strategy))
        errors.executarStrategies = "Descreva a estratégia aplicada.";
    }
    if (record.products.includes("potencializar")) {
      if (!isNonEmpty(record.potencializarValueModel))
        errors.potencializarValueModel = "Descreva o modelo de valor percebido.";
      if (!isNonEmpty(record.potencializarIndicator))
        errors.potencializarIndicator = "Informe o indicador de valor acordado.";
    }
  }

  if (step === 4) {
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

  if (step === 5) {
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
    "salesModel",
    "segment",
    "products",
    "primaryDriver",
  ],
  2: [
    "initialChallenges",
    "initialChallengesOther",
    "problem",
    "rootCause",
    "restrictions",
    "restrictionsOther",
    "previousAttempt",
    "previousFailureReason",
  ],
  3: [
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
  4: [
    "timeToResult",
    "primaryMetrics",
    "mediaInvestment",
    "attributedRevenue",
  ],
  5: ["dashboardUrl", "presentationUrl", "testimonialUrl", "finalNotes"],
};

const hasAnyAnswerForStep = (step: number, record: CaseRecord): boolean => {
  if (
    step === 4 &&
    (record.primaryMetrics.some((m) => m.metricKey || m.before || m.after) ||
      record.secondaryMetrics.some((m) => m.name || m.before || m.after))
  ) {
    return true;
  }
  if (
    step === 3 &&
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
