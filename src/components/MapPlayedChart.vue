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
  Object.entries(props.games.maps).toSorted(([_mapA, a], [_mapB, b]) => b - a),
);

const series: SeriesParam[] = [{ type: "mapPlayed" }];
</script>
<template>
  <div>
    <BarChart
      title="Maps Played"
      yAxis="Games"
      :counts="played"
      :series="series"
    />
  </div>
</template>
