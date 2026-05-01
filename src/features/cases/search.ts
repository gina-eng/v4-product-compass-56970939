// Busca tolerante a acento, caixa e pequenos erros de digitação.

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
