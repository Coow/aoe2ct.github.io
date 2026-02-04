<script setup lang="ts">
import { use } from "echarts/core";
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
import VChart, { THEME_KEY } from "vue-echarts";
import { useData } from "vitepress";
import { computed, ComputedRef, provide } from "vue";
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
provide(THEME_KEY, isDark ? "chalk" : "vintage");

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
      />
    </ClientOnly>
  </div>
</template>
