import fs from "node:fs";
import yaml from "js-yaml";
import type { PageData } from "vitepress";

type TournamentInfo = {
  name: string;
  presets: Record<string, string | string[]>;
  brackets: string[];
  naming?: {
    maps?: { prefix: string; versioned: boolean };
    map_draft?: { prefix_len: number };
  };
};
function presetToNameMapping(prefix_len: number) {
  return async (preset: string) => {
    const response = await fetch(`https://aoe2cm.net/api/preset/${preset}`);
    const json = await response.json();
    return Object.fromEntries(
      json.draftOptions.map((option) => [
        option.id,
        option.name.substring(prefix_len),
      ]),
    );
  };
}
export default {
  transformPageData(pageData: PageData) {
    pageData.title = pageData.title.replace(
      "%TOURNAMENT%",
      pageData?.params?.name,
    );
  },
  async paths() {
    const dirContents = fs.readdirSync("./data");
    const tournaments = await Promise.all(
      dirContents.map(async (tournament) => {
        const { mtime } = fs.statSync(`./public/${tournament}/drafts.json`);
        const info = yaml.load(
          fs.readFileSync(`./data/${tournament}/tournament.yaml`),
        ) as TournamentInfo;
        const presetCodes = info.presets.maps
          ? Object.values(info.presets.maps)
          : [];
        const draft_map_prefix_len = info.naming?.map_draft?.prefix_len ?? 0;
        const presetMapChoices = (
          await Promise.all(
            presetCodes.flatMap((preset) => {
              const presets = Array.isArray(preset) ? preset : [preset];
              return presets.map(presetToNameMapping(draft_map_prefix_len));
            }),
          )
        )
          .flat()
          .reduce((cumulative, mapping) => {
            return { ...cumulative, ...mapping };
          }, {});
        return {
          params: {
            tournament: tournament,
            name: info.name,
            presetMapChoices,
            brackets: info.brackets,
            lastUpdated: mtime,
          },
        };
      }),
    );
    return tournaments;
  },
};
