/**
 * Inserts zero-width characters into whitespace of a string
 * @param originalText - The text to process
 * @param targetTokens - Number of zero-width characters to insert (default: 1,000,000)
 * @returns Text with zero-width characters inserted into whitespace
 */
export async function insertZeroWidthChars(
  originalText: string,
  targetTokens: number = 1_000_000
): Promise<string> {
  const ZWC_CHARS = ["\u200b", "\u200c", "\u200d", "\ufeff", "\u2060"];

  // Split text into content and whitespace parts
  const parts = originalText.split(/(\s+)/);
  const gapIndices = Array.from(
    { length: Math.floor(parts.length / 2) },
    (_, i) => i * 2 + 1
  );
  const numGaps = gapIndices.length;

  // Calculate distribution of zero-width chars - total targetTokens distributed across all gaps
  const zwcPerGap = Math.floor(targetTokens / numGaps);
  const remainder = targetTokens % numGaps;

  // Generate a string of random zero-width characters
  function generateZwcString(n: number): string {
    return Array.from(
      { length: n },
      () => ZWC_CHARS[Math.floor(Math.random() * ZWC_CHARS.length)]
    ).join("");
  }

  // Insert zero-width characters into each gap
  for (let i = 0; i < gapIndices.length; i++) {
    const gapIndex = gapIndices[i];
    const count = zwcPerGap + (i < remainder ? 1 : 0);
    const zwcString = generateZwcString(count);
    parts[gapIndex] = parts[gapIndex] + zwcString;
  }

  return parts.join("");
}

const asciiToUnicodeMap: Record<string, string> = {
  A: "Α", // greek capital alpha
  B: "Β", // greek capital beta
  C: "С", // cyrillic capital es
  E: "Ε", // greek capital epsilon
  H: "Н", // cyrillic capital en
  I: "Ι", // greek capital iota
  J: "Ј", // cyrillic capital je
  K: "Κ", // greek capital kappa
  M: "М", // cyrillic capital em
  N: "Ν", // greek capital nu
  O: "Ο", // greek capital omicron
  P: "Р", // cyrillic capital er
  S: "Ѕ", // cyrillic capital dze (looks like weird S but plausible)
  T: "Τ", // greek capital tau
  X: "Χ", // greek capital chi
  Y: "Υ", // greek capital upsilon
  Z: "Ζ", // greek capital zeta

  a: "а", // cyrillic small a
  c: "с", // cyrillic small es
  e: "е", // cyrillic small e
  i: "і", // cyrillic small i
  j: "ј", // cyrillic small je
  o: "ο", // greek small omicron
  p: "р", // cyrillic small er
  s: "ѕ", // cyrillic small dze
  x: "х", // cyrillic small ha
  y: "у", // cyrillic small u
};

export function confusify(input: string): string {
  return input
    .split("")
    .map((char) => asciiToUnicodeMap[char] ?? char)
    .join("");
}
