import { inBrowser, withBase } from "vitepress";

export function normalizeCivs(civ: string) {
  if (civ == "Mayans") {
    return "Maya";
  }
  if (civ == "Incas") {
    return "Inca";
  }
  return civ;
}

export async function fetchData(tournament: string, type: string) {
  if (!inBrowser) {
    return {};
  }
  const url = withBase(`/${tournament}/${type}.json`);
  const response = await fetch(url);
  return response.json();
}
