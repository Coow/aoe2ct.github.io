import { allCivs } from "./types";

export function normalizeCivs(civ: string) {
  if (civ == "Mayans") {
    return "Maya";
  }
  if (civ == "Incas") {
    return "Inca";
  }
  return civ;
}
