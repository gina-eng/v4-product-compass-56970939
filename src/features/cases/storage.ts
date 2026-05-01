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

// Remove todos os cases com status "rascunho". Retorna quantos foram apagados.
export const clearAllDrafts = (): number => {
  const all = listCases();
  const drafts = all.filter((c) => c.status === "rascunho");
  if (drafts.length === 0) return 0;
  const remaining = all.filter((c) => c.status !== "rascunho");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return drafts.length;
};
