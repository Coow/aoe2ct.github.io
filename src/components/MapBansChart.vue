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

const series: SeriesParam[] = [
  { type: "playerBans", title: "Player bans" },
  { type: "adminBans", title: "Admin bans" },
];
</script>
<template>
  <div>
    <BarChart title="Map bans" yAxis="Bans" :counts="bans" :series="series" />
  </div>
</template>
