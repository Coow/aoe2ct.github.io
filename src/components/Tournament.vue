<script setup lang="ts">
import { computed, Ref, ref, watchEffect } from "vue";
import { withBase } from "vitepress";
import MapPicksChart from "./MapPicksChart.vue";
import MapBansChart from "./MapBansChart.vue";
import CivPickChart from "./CivPickChart.vue";
import { allCivs, Draft, Drafts, Game } from "../types";
import CivBansChart from "./CivBansChart.vue";
import CivPlayedChart, { type GameStats } from "./CivPlayedChart.vue";
import CivWinrateChart from "./CivWinrateChart.vue";
import { normalizeCivs } from "../utils";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});

const drafts: Ref<Drafts> = ref({ civDrafts: [], mapDrafts: [] });
const games: Ref<Game[]> = ref([]);
const players = ref([]);

watchEffect(async () => {
  drafts.value = await fetchData("drafts");
  games.value = await fetchData("games");
  players.value = await fetchData("players");
});

async function fetchData(type: string) {
  const response = await fetch(withBase(`/${props.code}/${type}.json`));
  return response.json();
}

function summarizeDrafts(drafts: Draft[]) {
  const t = (id: string) => normalizeCivs(props.presetMapNames[id] ?? id);
  let counts = Object.fromEntries(
    drafts
      .flatMap((draft) => draft.draft)
      .map((draft) => [
        t(draft.map),
        {
          admin: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
          player: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
        },
      ]),
  );

  for (let draft of drafts) {
    let picks = Object.fromEntries(
      draft.draft.map((draft) => [t(draft.map), { admin: 0, player: 0 }]),
    );
    for (let action of draft.draft) {
      if (action.action == "pick") {
        picks[t(action.map)][action.type] += 1;
      }

      if (action.action != "snipe") {
        counts[t(action.map)][action.type][action.action] += 1;
      } else {
        const affectedPick =
          picks[t(action.map)].admin > 0 ? "admin" : "player";
        counts[t(action.map)][action.type][action.action][affectedPick] += 1;
      }
    }
  }
  return counts;
}
const mapCounts = computed(() => {
  if (!drafts.value?.mapDrafts) {
    return [];
  }
  return summarizeDrafts(drafts.value.mapDrafts);
});
const civCounts = computed(() => {
  if (!drafts.value?.civDrafts) {
    return {};
  }
  return summarizeDrafts(drafts.value.civDrafts);
});

const gameStats = computed(() => {
  return games.value.reduce<GameStats>(
    (stats, game) => {
      const winning = normalizeCivs(game.winningCiv);
      const losing = normalizeCivs(game.losingCiv);

      return {
        ...stats,
        civs: {
          ...stats.civs,
          [winning]: {
            ...stats.civs[winning],
            wins: stats.civs[winning].wins + 1,
            losses: stats.civs[winning].wins,
            total: stats.civs[winning].total + 1,
            winrate:
              (stats.civs[winning].wins + 1) / (stats.civs[winning].total + 1),
          },
          [losing]: {
            ...stats.civs[losing],
            wins: stats.civs[losing].wins,
            losses: stats.civs[losing].wins + 1,
            total: stats.civs[losing].total + 1,
            winrate: stats.civs[losing].wins / (stats.civs[losing].total + 1),
          },
        },
      };
    },
    {
      civs: Object.fromEntries(
        allCivs.map((civ) => [
          civ,
          {
            wins: 0,
            losses: 0,
            total: 0,
            winrate: 0,
            drafted:
              civCounts.value[civ]?.admin?.pick +
              civCounts.value[civ]?.player?.pick,
          },
        ]),
      ),
    },
  );
});
</script>

<template>
  <h1>{{ $params.name }} stats</h1>
  <h2>Drafts</h2>
  <MapPicksChart v-if="Object.keys(mapCounts).length > 0" :drafts="mapCounts" />
  <MapBansChart v-if="Object.keys(mapCounts).length > 0" :drafts="mapCounts" />
  <CivPickChart :drafts="civCounts" />
  <CivBansChart :drafts="civCounts" />
  <h2>Games</h2>
  <CivPlayedChart :games="gameStats" />
  <CivWinrateChart :games="gameStats" />
</template>
