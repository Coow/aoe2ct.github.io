<script setup lang="ts">
import { computed } from "vue";
import BarChart, { type SeriesParam } from "./BarChart.vue";

const props = defineProps(["drafts"]);
const picks = computed(() =>
  Object.entries(props.drafts).toSorted(
    ([_mapA, a], [_mapB, b]) =>
      a.admin.pick + a.player.pick - b.admin.pick - b.player.pick,
  ),
);

const series: SeriesParam[] = [
  { type: "playerPicks", title: "Player picks" },
  { type: "snipesOnPlayer", title: "Player picks sniped" },
  { type: "adminPicks", title: "Admin picks" },
  { type: "snipesOnAdmin", title: "Admin picks sniped" },
];
</script>
<template>
  <div>
    <BarChart
      title="Civilization Picks"
      yAxis="Picks"
      :counts="picks"
      :series="series"
      horizontal
    />
  </div>
</template>
