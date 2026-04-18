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
const vilCounts = computed(() =>
  props.players
    .filter((player) => player.duration > 60 * 2 * 1000)
    .map((player) => [
      player.most_created_count,
      player.bracket,
      player.most_created,
      player.player,
      `${player.set_id} on ${player.map} (${player.winner ? "W" : "L"})`,
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
      formatter: (params) =>
        `${format.encodeHTML(params.value[3])}<br>` +
        `${format.encodeHTML(params.value[2])}: <b>${params.value[0]}</b><br>` +
        `${format.encodeHTML(params.value[4])}`,
    },
    series: [
      {
        name: "Vils Queued",
        type: "scatter",
        data: vilCounts.value,
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
