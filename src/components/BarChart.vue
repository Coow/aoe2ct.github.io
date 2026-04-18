<script setup lang="ts">
import type { BarSeriesOption } from "echarts/charts";
import { BarChart } from "echarts/charts";
import type {
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import "echarts/theme/rainbow.js";
import { computed, ComputedRef } from "vue";
import VChart from "vue-echarts";
import { setupCharts, useThemeName } from "../charts";
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

setupCharts();
const themeName = useThemeName();

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
