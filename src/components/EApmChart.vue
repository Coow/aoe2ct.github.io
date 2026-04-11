<script setup lang="ts">
import { use, format } from "echarts/core";
import "echarts/theme/rainbow.js";
import { ScatterChart } from "echarts/charts";
import { TitleComponent, GridComponent } from "echarts/components";
import { ScatterJitter } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption } from "echarts/core";
import type { ScatterSeriesOption } from "echarts/charts";
import type {
  TitleComponentOption,
  GridComponentOption,
} from "echarts/components";
import { useData } from "vitepress";
import { registerTheme, TooltipComponentOption } from "echarts";
import { computed, ComputedRef } from "vue";
import VChart from "vue-echarts";
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

const props = defineProps<{ players: Player[] }>();
const { isDark } = useData();
const axisTheme = {
  axisLine: {
    lineStyle: {
      color: "#c6d0f5",
    },
  },
  axisLabel: {
    color: null,
  },
  splitLine: {
    lineStyle: {
      color: ["#E0E6F1"],
    },
  },
  splitArea: {
    areaStyle: {
      color: ["rgba(250,250,250,0.2)", "rgba(210,219,238,0.2)"],
    },
  },
  minorSplitLine: {
    color: "#F4F7FD",
  },
};
registerTheme("frappe", {
  backgroundColor: "#303446",
  subtitleColor: "#b5bfe2",
  title: {
    backgroundColor: "rgba(0,0,0,0)",
    borderColor: "#babbf1",
    textStyle: {
      color: "#c6d0f5",
    },
    subtextStyle: {
      color: "#b5bfe2",
    },
  },
  color: [
    "#8caaee", // Blue
    "#e5c890", // Yellow
    "#a6d189", // Green
    "#e78284", // Red
    "#a5adce", // Subtext 0
    "#81c8be", // Teal
    "#f4b8e4", // Pink
  ],
  valueAxis: { ...axisTheme },
  timeAxis: { ...axisTheme },
  logAxis: { ...axisTheme },
  categoryAxis: { ...axisTheme },
});
const brackets = computed(() => [
  ...new Set(props.players.map((player) => player.bracket)),
]);
const eapmData = computed(() =>
  props.players
    .filter((player) => player.duration > 60 * 2 * 1000)
    .map((player) => [
      player.eapm,
      player.bracket,
      player.player,
      `${player.set_id} on ${player.map} (${player.winner ? "W" : "L"})`,
    ]),
);
const themeName = computed(() => (isDark.value ? "frappe" : "rainbow"));
const option: ComputedRef<EChartsOption> = computed(() => {
  return {
    title: { text: "eAPM by bracket" },
    xAxis: { type: "value" },
    yAxis: {
      type: "category",
      jitter: (1000 * 0.8) / brackets.value.length,
      data: brackets.value,
    },
    tooltip: {
      show: true,
      formatter: (params) =>
        `${format.encodeHTML(params.value[2])}: <b>${params.value[0]}</b><br>${format.encodeHTML(params.value[3])}`,
    },
    series: [
      {
        name: "eAPM",
        type: "scatter",
        data: eapmData.value,
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
