import { inBrowser, withBase } from "vitepress";
import { format, fromUnixTime } from "date-fns";
import { UTCDate } from "@date-fns/utc";

export function normalizeCivs<T extends string>(civ: T) {
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

export function durationToString(duration: number) {
  return format(new UTCDate(fromUnixTime(duration / 1000)), "HH:mm:ss");
}

export function iconName(name: string) {
  if (name.toLowerCase() == "maya") {
    return "mayans";
  }
  if (name.toLowerCase() == "inca") {
    return "incas";
  }
  return name.toLowerCase();
}
