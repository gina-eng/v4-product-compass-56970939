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

export const isImprovement = (
  variation: number | null,
  direction: MetricDirection | string | undefined,
): boolean | null => {
  if (variation === null) return null;
  const dir = direction === "lower_is_better" ? "lower_is_better" : "higher_is_better";
  return dir === "lower_is_better" ? variation < 0 : variation >= 0;
};

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
