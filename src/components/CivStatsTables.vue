<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue";
import { allCivs, Drafts, Player } from "../types";
import { fetchData, normalizeCivs } from "../utils";
import CivTable from "./CivTable.vue";

const props = defineProps({
  code: { type: String, required: true },
});
const drafts: Ref<Drafts> = ref({ civDrafts: [], mapDrafts: [] });
const players: Ref<Player[]> = ref([]);

watchEffect(async () => {
  const promises = [
    fetchData(props.code, "drafts"),
    fetchData(props.code, "players"),
  ];
  drafts.value = await promises[0];
  players.value = await promises[1];
});

const draftStats = computed(() => {
  const emptyObj: Record<string, { bans: number; picks: number }> =
    allCivs.reduce(
      (empty, civ) => ({
        ...empty,
        [civ]: { bans: 0, picks: 0 },
      }),
      {},
    );
  return drafts.value.civDrafts.reduce(
    (overallStats, draft) => {
      const draftStats = draft.draft.reduce(
        (draftStats, action) => {
          const civ = normalizeCivs(action.map);
          const bans = (action.action == "ban" ? 1 : 0) + draftStats[civ].bans;
          const picks =
            (action.action == "pick" ? 1 : 0) + draftStats[civ].picks;
          return { ...draftStats, [civ]: { bans, picks } };
        },
        { ...emptyObj },
      );
      return Object.entries(draftStats).reduce((stats, [civ, civStats]) => {
        return {
          ...stats,
          [civ]: {
            bans: civStats.bans + stats[civ].bans,
            picks: civStats.picks + stats[civ].picks,
          },
        };
      }, overallStats);
    },
    { ...emptyObj },
  );
});
const playerStats = computed(() => {
  const emptyObj: Record<string, { wins: number; losses: number }> =
    allCivs.reduce(
      (empty, civ) => ({
        ...empty,
        [civ]: { wins: 0, losses: 0 },
      }),
      {},
    );
  return players.value.reduce(
    (acc, player) => {
      const civ = normalizeCivs(player.civ);
      const win = player.winner ? 1 : 0;
      return {
        ...acc,
        [civ]: {
          wins: acc[civ].wins + win,
          losses: acc[civ].losses + (1 - win),
        },
      };
    },
    { ...emptyObj },
  );
});
const civStats = computed(() => {
  return allCivs
    .map((civ) => {
      const wins = playerStats.value[civ].wins;
      const losses = playerStats.value[civ].losses;
      return {
        name: civ,
        wins,
        losses,
        winrate:
          wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0,
        picks: draftStats.value[civ].picks,
        bans: draftStats.value[civ].bans,
      };
    })
    .sort((a, b) => {
      if (a.winrate == b.winrate) {
        return b.wins + b.losses - a.wins - a.losses;
      }
      return b.winrate - a.winrate;
    });
});
</script>

<template>
  <div class="statsTable">
    <CivTable :civStats="civStats.slice(0, civStats.length / 3)" />
    <CivTable
      :civStats="civStats.slice(civStats.length / 3, (2 * civStats.length) / 3)"
    />
    <CivTable
      :civStats="civStats.slice((2 * civStats.length) / 3, civStats.length)"
    />
  </div>
</template>
