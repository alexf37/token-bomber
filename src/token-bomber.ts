/**
 * Inserts zero-width characters into spaces of a string
 * @param originalText - The text to process
 * @param targetTokens - Number of zero-width characters to insert (default: 1,000,000)
 * @returns Text with zero-width characters inserted into spaces
 */
export async function insertZeroWidthChars(
  originalText: string,
  targetTokens: number = 1_000_000
): Promise<string> {
  const ZWC_CHARS = ["\u200b", "\u200c", "\u200d", "\ufeff", "\u2060"];

  // Special markdown characters that should not have ZWCs before them at line start
  const MARKDOWN_CHARS = [
    "#",
    "-",
    "*",
    ">",
    "`",
    "|",
    ":",
    "[",
    "]",
    "(",
    ")",
    "!",
    "_",
    "~",
    "=",
    "\\",
  ];

  // First, count total number of gaps across all lines
  const lines = originalText.split("\n");
  let totalGaps = 0;
  const lineGaps: number[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      lineGaps.push(0);
      continue;
    }

    const firstChar = line.trim()[0];
    const isMarkdownLine = MARKDOWN_CHARS.includes(firstChar);
    const parts = line.split(/(\s+)/);
    const numGaps = Math.floor(parts.length / 2);

    // If it's a markdown line, subtract one gap from the count
    const adjustedGaps = isMarkdownLine ? Math.max(0, numGaps - 1) : numGaps;
    lineGaps.push(adjustedGaps);
    totalGaps += adjustedGaps;
  }

  if (totalGaps === 0) return originalText;

  // Calculate distribution for the entire file
  const zwcPerGap = Math.floor(targetTokens / totalGaps);
  const remainder = targetTokens % totalGaps;

  // Generate a string of random zero-width characters
  function generateZwcString(n: number): string {
    return Array.from(
      { length: n },
      () => ZWC_CHARS[Math.floor(Math.random() * ZWC_CHARS.length)]
    ).join("");
  }

  // Process each line with the correct token distribution
  let remainingTokens = remainder;
  const processedLines = lines.map((line, lineIndex) => {
    if (!line.trim()) return line;

    const firstChar = line.trim()[0];
    const isMarkdownLine = MARKDOWN_CHARS.includes(firstChar);
    const parts = line.split(/(\s+)/);
    const numGaps = Math.floor(parts.length / 2);

    if (numGaps === 0) return line;

    // Calculate how many extra tokens this line gets from the remainder
    const lineRemainder = Math.min(remainingTokens, lineGaps[lineIndex]);
    remainingTokens -= lineRemainder;

    // Insert zero-width characters into spaces
    for (let i = 1; i < parts.length; i += 2) {
      if (isMarkdownLine && i === 1) continue;

      const gapIndex = Math.floor(i / 2);
      const count = zwcPerGap + (gapIndex < lineRemainder ? 1 : 0);
      parts[i] = parts[i] + generateZwcString(count);
    }

    return parts.join("");
  });

  return processedLines.join("\n");
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
  // Split the string into parts, preserving URLs
  const parts = input.split(/(https?:\/\/[^\s]+)/g);

  return parts
    .map((part) => {
      // If the part is a URL, return it unchanged
      if (part.startsWith("http")) {
        return part;
      }
      // Otherwise confusify it
      return part
        .split("")
        .map((char) => asciiToUnicodeMap[char] ?? char)
        .join("");
    })
    .join("");
}
