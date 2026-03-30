<script setup lang="ts">
import { computed } from "vue";
import BarChart, { type SeriesParam } from "./BarChart.vue";

export type GameStats = {
  civs: Record<
    string,
    { wins: number; losses: number; total: number; winrate: number }
  >;
  maps: Record<string, number>;
};
const props = defineProps<{ games: GameStats }>();
const played = computed(() =>
  Object.entries(props.games.civs)
    .map(([civ, game]) => [civ, game.total])
    .toSorted(([_civA, a], [_civB, b]) => a - b),
);

const series: SeriesParam[] = [{ type: "civPlayed" }];
</script>
<template>
  <div>
    <BarChart
      title="Civilizations Played"
      yAxis="Games"
      :counts="played"
      :series="series"
      horizontal
    />
  </div>
</template>
