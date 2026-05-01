import { MOCK_CONSULTANTS } from "./mock";
import type { Consultant } from "./types";

const STORAGE_KEY = "v4-consultants-v1";
const SEEDED_KEY = "v4-consultants-seeded-v1";

const safeParse = (raw: string | null): Consultant[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Consultant[];
  } catch {
    return [];
  }
};

const seedIfNeeded = (): void => {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEEDED_KEY)) return;
  if (window.localStorage.getItem(STORAGE_KEY)) {
    window.localStorage.setItem(SEEDED_KEY, "1");
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CONSULTANTS));
  window.localStorage.setItem(SEEDED_KEY, "1");
};

export const listConsultants = (): Consultant[] => {
  if (typeof window === "undefined") return [];
  seedIfNeeded();
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const getConsultant = (id: string): Consultant | undefined =>
  listConsultants().find((c) => c.id === id);

export const upsertConsultant = (record: Consultant): Consultant => {
  const all = listConsultants();
  const index = all.findIndex((c) => c.id === record.id);
  if (index >= 0) {
    all[index] = record;
  } else {
    all.unshift(record);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return record;
};

export const deleteConsultant = (id: string): void => {
  const all = listConsultants().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const resetToMock = (): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CONSULTANTS));
  window.localStorage.setItem(SEEDED_KEY, "1");
};

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || `consultor-${Date.now()}`;

export const generateConsultantId = (name: string): string => {
  const base = slugify(name);
  const all = listConsultants();
  const taken = new Set(all.map((c) => c.id));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
};
