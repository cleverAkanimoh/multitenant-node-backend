import { v4 as uuid } from "uuid";
import { fashionPhrases } from "../data/fashionPhrases";

export function generateDefaultUsername(name?: string) {
  const base =
    name || fashionPhrases[Math.floor(Math.random() * fashionPhrases.length)];

  const uuidFragment = uuid().substring(0, 6);

  return `${base}-${uuidFragment}`;
}

// Example usage
// const username = generateDefaultUsername("Clever");
// console.log(username); // e.g., "Clever-1a2b3c"

// const randomUsername = generateDefaultUsername();
// console.log(randomUsername);
