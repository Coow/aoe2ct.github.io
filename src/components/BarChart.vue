<script setup lang="ts">
import { use, registerTheme } from "echarts/core";
import "echarts/theme/rainbow.js";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption } from "echarts/core";
import type { BarSeriesOption } from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  GridComponentOption,
} from "echarts/components";
import VChart from "vue-echarts";
import { useData } from "vitepress";
import { computed, ComputedRef } from "vue";
import { Counts } from "../types";

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
]);

type EChartsOption = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | GridComponentOption
  | BarSeriesOption
>;

const availableSeries = {
  adminPicks(counts: Counts[]): BarSeriesOption {
    return {
      data: counts.map(
        ([_, count]) =>
          count.admin.pick - count.player.snipe.admin - count.admin.snipe.admin,
      ),
    };
  },
  playerPicks(counts: Counts[]): BarSeriesOption {
    return {
      data: counts.map(
        ([_, count]) =>
          count.player.pick -
          count.player.snipe.player -
          count.admin.snipe.player,
      ),
    };
  },
  snipesOnPlayer(counts: Counts[]): BarSeriesOption {
    return {
      data: counts.map(
        ([_, count]) => count.player.snipe.player + count.admin.snipe.player,
      ),
    };
  },
  snipesOnAdmin(counts: Counts[]): BarSeriesOption {
    return {
      data: counts.map(
        ([_, count]) => count.player.snipe.admin + count.admin.snipe.admin,
      ),
    };
  },
  adminBans(counts: Counts[]): BarSeriesOption {
    return { data: counts.map(([_, count]) => count.admin.ban) };
  },
  playerBans(counts: Counts[]): BarSeriesOption {
    return { data: counts.map(([_, count]) => count.player.ban) };
  },
  civPlayed(counts: Counts[]): BarSeriesOption {
    return { data: counts.map(([_, count]) => count) };
  },
  civWinrate(counts): BarSeriesOption {
    return {
      data: counts.map(([_, count]) => Math.round(count.winrate * 10000) / 100),
    };
  },
  mapPlayed(counts: [string, number][]): BarSeriesOption {
    return { data: counts.map(([_, count]) => count) };
  },
};

type Series = typeof availableSeries;
export type SeriesParam = { title?: string; type: keyof Series };

const {
  counts,
  title,
  yAxis,
  series,
  horizontal = false,
  valueFormatter = undefined,
  labelFormat = "{value}",
} = defineProps<{
  counts: Counts[];
  title: string;
  yAxis: string;
  series: SeriesParam[];
  horizontal?: boolean;
  valueFormatter?: TooltipComponentOption["valueFormatter"];
  labelFormat?: string;
}>();
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
const themeName = computed(() => (isDark.value ? "frappe" : "rainbow"));

const option: ComputedRef<EChartsOption> = computed(() => {
  const labels = counts.map(([map, _]) => map);
  return {
    title: {
      text: title,
    },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          formatter: ({ axisDimension, value }) => {
            const categoryDimension = horizontal ? "y" : "x";
            if (axisDimension == categoryDimension) {
              return value;
            }
            const roundedValue =
              typeof value == "number" ? Math.round(value * 100) / 100 : value;
            return labelFormat.replace("{value}", `${roundedValue}`);
          },
        },
      },
      valueFormatter,
    },
    xAxis: {
      name: horizontal ? yAxis : undefined,
      type: horizontal ? "value" : "category",
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        rotate: 30,
        formatter: labelFormat,
      },
      data: horizontal ? undefined : labels,
    },
    yAxis: {
      name: horizontal ? undefined : yAxis,
      type: horizontal ? "category" : "value",
      data: horizontal ? labels : undefined,
    },
    // color: [
    //   // "#e78284", // Red
    //   // "#a6d189", // Green
    //   // "#e5c890", // Yellow
    //   // "#8caaee", // Blue
    //   // "#f4b8e4", // Pink
    //   // "#81c8be", // Teal
    //   // "#f2d5cf", // Rosewater
    //   // "#85c1dc", // Sapphire
    //   // "#ea999c", // Maroon
    //   // "#99d1db", // Sky
    //   // "#ca9ee6", // Mauve
    //   // "#ef9f76", // Peach
    //   // "#babbf1", // Lavender
    //   // "#eebebe", // Flamingo
    // ],
    series: series.map((series) => ({
      name: series.title,
      type: "bar",
      stack: "x",
      ...availableSeries[series.type](counts),
    })),
  };
});
</script>
<template>
  <div>
    <ClientOnly>
      <v-chart
        :style="{ height: horizontal ? '1000px' : '500px' }"
        :option="option"
        :theme="themeName"
      />
    </ClientOnly>
  </div>
</template>
