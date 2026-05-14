<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue";
import { Drafts, Player } from "../types";
import { fetchData } from "../utils";
import MapTable from "./MapTable.vue";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});
const drafts: Ref<Drafts> = ref({ civDrafts: [], mapDrafts: [] });
const players: Ref<Player[]> = ref([]);

watchEffect(async () => {
  const promises = [
    fetchData(props.code, "drafts"),
    fetchData(props.code, "players"),
  ];
  drafts.value = await promises[0];
  players.value = await promises[1];
});

const draftStats = computed(() => {
  const emptyObj = Object.fromEntries(
    Object.values(props.presetMapNames).map((mapName) => [
      mapName,
      { admin_picks: 0, picks: 0 },
    ]),
  );
  return drafts.value.mapDrafts.reduce(
    (overallStats, draft) => {
      const draftTotals = draft.draft.reduce(
        (cumulator, action) => {
          const mapName = props.presetMapNames[action.map] ?? action.map;
          const admin_picks =
            cumulator[mapName].admin_picks + (action.type == "admin" ? 1 : 0);
          const picks =
            cumulator[mapName].picks + (action.type == "player" ? 1 : 0);
          return { ...cumulator, [mapName]: { admin_picks, picks } };
        },
        { ...emptyObj },
      );
      return Object.keys(overallStats).reduce((accumulator, mapName) => {
        return {
          ...accumulator,
          [mapName]: {
            admin_picks:
              accumulator[mapName].admin_picks +
              draftTotals[mapName].admin_picks,
            picks: accumulator[mapName].picks + draftTotals[mapName].picks,
          },
        };
      }, overallStats);
    },
    { ...emptyObj },
  );
});

const playerStats = computed(() => {
  const emptyObj: Record<
    string,
    {
      played: number;
      duration: number;
      max_duration: number;
      min_duration: number;
      played_civs: string[];
    }
  > = Object.fromEntries(
    Object.values(props.presetMapNames).map((mapName) => [
      mapName,
      {
        played: 0,
        duration: 0,
        max_duration: 0,
        min_duration: 0,
        played_civs: [],
      },
    ]),
  );
  return players.value.reduce(
    (accumulator, player) => {
      if (!player.map) {
        return accumulator;
      }
      const c = accumulator[player.map]; //current stats for map
      return {
        ...accumulator,
        [player.map]: {
          played: c.played + 1,
          duration: c.duration + player.duration,
          max_duration: Math.max(c.max_duration, player.duration),
          min_duration:
            c.min_duration == 0
              ? player.duration
              : Math.min(c.min_duration, player.duration),
          played_civs: [...c.played_civs, player.civ],
        },
      };
    },
    { ...emptyObj },
  );
});
const mapStats = computed(() => {
  return Object.values(props.presetMapNames)
    .map((mapName) => {
      const drafts = draftStats.value[mapName];
      const players = playerStats.value[mapName];
      const picks = drafts.picks;
      const admin_picks = drafts.admin_picks;
      const played = players.played / 2;
      const duration = players.duration / 2;
      const civCounts = Object.entries(
        players.played_civs.reduce(
          (acc, civ) => ({ ...acc, [civ]: (acc[civ] ?? 0) + 1 }),
          {} as Record<string, number>,
        ),
      ).sort(([_civA, countA], [_civB, countB]) => countB - countA);
      return {
        name: mapName,
        picks,
        admin_picks,
        played,
        played_pct: Math.round((played / (picks + admin_picks)) * 100),
        total_duration: duration,
        max_duration: players.max_duration,
        min_duration: players.min_duration,
        top_civ: civCounts[0] ?? ["None", 0],
        second_civ: civCounts[1] ?? ["None", 0],
      };
    })
    .filter((mapStats) => !["Steppe", "Seasons"].includes(mapStats.name))
    .sort((a, b) => {
      if (a.picks + a.admin_picks == b.picks + b.admin_picks) {
        return b.played - a.played;
      }
      return b.admin_picks + b.picks - a.admin_picks - a.picks;
    });
});
</script>

<template>
  <div class="statsTable">
    <MapTable :mapStats="mapStats" />
  </div>
</template>
