<script setup lang="ts">
import { computed } from "vue";
import BarChart, { type SeriesParam } from "./BarChart.vue";

const props = defineProps(["drafts"]);
const bans = computed(() =>
  Object.entries(props.drafts).toSorted(
    ([_mapA, a], [_mapB, b]) =>
      b.admin.ban + b.player.ban - a.admin.ban - a.player.ban,
  ),
);

const totalBanCount = computed(() => {
  return bans.value.reduce((total, [_, counts]) => {
    return total + counts.admin.ban + counts.player.ban;
  }, 0);
});

const series: SeriesParam[] = [
  { type: "playerBans", title: "Player bans" },
  { type: "adminBans", title: "Admin bans" },
];
</script>
<template>
  <BarChart
    v-if="totalBanCount > 0"
    title="Map bans"
    yAxis="Bans"
    :counts="bans"
    :series="series"
  />
</template>
