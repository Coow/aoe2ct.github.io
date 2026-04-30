<script setup lang="ts">
import { TooltipComponentOption } from "echarts";
import type { ScatterSeriesOption } from "echarts/charts";
import { ScatterChart } from "echarts/charts";
import type {
  GridComponentOption,
  TitleComponentOption,
} from "echarts/components";
import { GridComponent, TitleComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { format, use } from "echarts/core";
import { ScatterJitter } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import "echarts/theme/rainbow.js";
import { computed, ComputedRef } from "vue";
import VChart from "vue-echarts";
import { setupCharts, useThemeName } from "../charts";
import { Player } from "../types";

use([
  TitleComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  ScatterJitter,
]);
type EChartsOption = ComposeOption<
  | TitleComponentOption
  | GridComponentOption
  | ScatterSeriesOption
  | TooltipComponentOption
>;

setupCharts();
const themeName = useThemeName();
const props = defineProps<{ players: Player[] }>();
const brackets = computed(() => [
  ...new Set(props.players.map((player) => player.bracket)),
]);
const unitCounts = computed(() =>
  props.players
    .filter((player) => player.duration > 60 * 2 * 1000)
    .map((player) => [
      Math.min(800, player.most_created_count),
      player.bracket,
      {
        name: player.most_created,
        player: player.player,
        series: `${player.set_id} on ${player.map} (${player.winner ? "W" : "L"})`,
        actual: player.most_created_count,
      },
    ]),
);
const option: ComputedRef<EChartsOption> = computed(() => {
  return {
    title: { text: "Most created unit by bracket" },
    xAxis: { type: "value" },
    yAxis: {
      type: "category",
      jitter: (1000 * 0.8) / brackets.value.length,
      data: brackets.value,
    },
    tooltip: {
      show: true,
      formatter: (params) => {
        return (
          `${format.encodeHTML(params.value[2].player)}<br>` +
          `${format.encodeHTML(params.value[2].name)}: <b>${params.value[2].actual}</b><br>` +
          `${format.encodeHTML(params.value[2].series)}`
        );
      },
    },
    series: [
      {
        name: "Units Queued",
        type: "scatter",
        data: unitCounts.value,
        colorBy: "data",
        itemStyle: { opacity: 0.4 },
      },
    ],
  };
});
</script>
<template>
  <div>
    <v-chart
      :style="{ height: '1000px' }"
      :option="option"
      :theme="themeName"
    />
  </div>
</template>
