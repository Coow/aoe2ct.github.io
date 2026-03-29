import { allCivs } from "./types";

export function normalizeCivs(civ: string) {
  if (civ == "Mayans") {
    return "Maya";
  }
  if (civ == "Incas") {
    return "Inca";
  }
  if (!allCivs.includes(civ)) {
    console.warn(`Could not find ${civ} in the list of all civs`);
  }
  return civ;
}
