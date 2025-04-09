/**
 * Inserts zero-width characters between alphabetical characters and in spaces
 * @param originalText - The text to process
 * @param targetTokens - Number of zero-width characters to insert (default: 1,000,000)
 * @returns Text with zero-width characters inserted between alphabetical characters and in spaces
 */
export async function insertZeroWidthChars(
  originalText: string,
  targetTokens: number = 1_000_000
): Promise<string> {
  const ZWC_CHARS = [
    "\u200b",
    "\u200c",
    "\u200d",
    "\ufeff",
    "\u2060",
    "\u00ad",
  ];

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

  // Split text into lines and process each line
  const lines = originalText.split("\n");
  const processedLines = lines.map((line) => {
    // Skip empty lines
    if (!line.trim()) return line;

    // Check if line starts with a markdown character
    const firstChar = line.trim()[0];
    const isMarkdownLine = MARKDOWN_CHARS.includes(firstChar);

    // Split text into parts, keeping alphabetical characters and spaces separate
    const parts: string[] = [];
    let currentPart = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const isLetter = /[a-zA-Z]/.test(char);
      const isSpace = /\s/.test(char);

      if (isLetter || isSpace) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = "";
        }
        parts.push(char);
      } else {
        currentPart += char;
      }
    }

    if (currentPart) {
      parts.push(currentPart);
    }

    // Calculate distribution of zero-width chars
    const numGaps = Math.max(
      0,
      parts.filter((part) => /[a-zA-Z]/.test(part) || /\s/.test(part)).length -
        1
    );
    if (numGaps === 0) return line;

    const zwcPerGap = Math.floor(targetTokens / numGaps);
    const remainder = targetTokens % numGaps;

    // Generate a string of random zero-width characters
    function generateZwcString(n: number): string {
      return Array.from(
        { length: n },
        () => ZWC_CHARS[Math.floor(Math.random() * ZWC_CHARS.length)]
      ).join("");
    }

    // Insert zero-width characters between alphabetical characters and in spaces
    const result: string[] = [];
    let gapCount = 0;

    for (let i = 0; i < parts.length; i++) {
      result.push(parts[i]);
      if (
        i < parts.length - 1 &&
        (/[a-zA-Z]/.test(parts[i]) || /\s/.test(parts[i])) &&
        (/[a-zA-Z]/.test(parts[i + 1]) || /\s/.test(parts[i + 1]))
      ) {
        // Skip inserting ZWC if this is a markdown line and we're at the start
        if (isMarkdownLine && i === 0) continue;

        const count = zwcPerGap + (gapCount < remainder ? 1 : 0);
        result.push(generateZwcString(count));
        gapCount++;
      }
    }

    return result.join("");
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
