import { registerTheme } from "echarts/core";
import { useData } from "vitepress";
import { computed } from "vue";

export function setupCharts() {
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
}

export function useThemeName() {
  const { isDark } = useData();
  const themeName = computed(() => (isDark.value ? "frappe" : "rainbow"));
  return themeName;
}
