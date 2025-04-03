export function convertCase(
  input: string,
  format: "camel" | "pascal" | "sentence"
): string {
  if (!input) return "";
  const words = input
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s']/g, "")
    .trim()
    .split(/\s+/);

  switch (format) {
    case "camel":
      if (isCamelCase(input)) return input;
      return words
        .map((word, index) =>
          index === 0 ? word.toLowerCase() : capitalize(word)
        )
        .join("");

    case "pascal":
      if (isPascalCase(input)) return input;
      return words.map(capitalize).join("");

    case "sentence":
      if (isSentenceCase(input)) return input;
      return capitalize(words.join(" "));

    default:
      return input;
  }
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function isCamelCase(input: string): boolean {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(input);
}

function isPascalCase(input: string): boolean {
  return /^[A-Z][a-z]*([A-Z][a-z]*)*$/.test(input);
}

function isSentenceCase(input: string): boolean {
  return /^[A-Z][^A-Z]*$/.test(input);
}
