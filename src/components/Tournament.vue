<script setup lang="ts">
import { computed, Ref, ref, watch, watchEffect } from "vue";
import { withBase, useData, inBrowser } from "vitepress";
import MapPicksChart from "./MapPicksChart.vue";
import MapBansChart from "./MapBansChart.vue";
import CivPickChart from "./CivPickChart.vue";
import { allCivs, Draft, Drafts, Game, Player } from "../types";
import CivBansChart from "./CivBansChart.vue";
import CivPlayedChart, { type GameStats } from "./CivPlayedChart.vue";
import CivWinrateChart from "./CivWinrateChart.vue";
import MapPlayedChart from "./MapPlayedChart.vue";
import { normalizeCivs } from "../utils";
import EApmChart from "./EApmChart.vue";
import VilCountChart from "./VilCountChart.vue";
import MostCreatedChart from "./MostCreatedChart.vue";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});
const { params } = useData();

const drafts: Ref<Drafts> = ref({ civDrafts: [], mapDrafts: [] });
const games: Ref<Game[]> = ref([]);
const players: Ref<Player[]> = ref([]);
const selectedBrackets = ref([...(params.value?.brackets ?? [])]);
const selectedMaps: Ref<string[]> = ref([]);

watchEffect(async () => {
  const promises = [
    fetchData("drafts"),
    fetchData("games"),
    fetchData("players"),
  ];
  drafts.value = await promises[0];
  games.value = await promises[1];
  players.value = await promises[2];
});

async function fetchData(type: string) {
  if (!inBrowser) {
    return {};
  }
  const url = withBase(`/${props.code}/${type}.json`);
  const response = await fetch(url);
  return response.json();
}

function mapName(map_id: string) {
  return props.presetMapNames[map_id] ?? map_id;
}

function summarizeDrafts(drafts: Draft[]) {
  const t = (id: string) => normalizeCivs(mapName(id));

  let counts = Object.fromEntries(
    drafts
      .flatMap((draft) => draft.draft)
      .map((draft) => [
        t(draft.map),
        {
          admin: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
          player: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
        },
      ]),
  );

  for (let draft of drafts) {
    let picks = Object.fromEntries(
      draft.draft.map((draft) => [t(draft.map), { admin: 0, player: 0 }]),
    );
    for (let action of draft.draft) {
      if (action.action == "pick") {
        picks[t(action.map)][action.type] += 1;
      }

      if (action.action != "snipe") {
        counts[t(action.map)][action.type][action.action] += 1;
      } else {
        const affectedPick =
          picks[t(action.map)].admin > 0 ? "admin" : "player";
        counts[t(action.map)][action.type][action.action][affectedPick] += 1;
      }
    }
  }
  return counts;
}

const filteredDrafts = computed(() => {
  return {
    mapDrafts: drafts.value?.mapDrafts
      ? drafts.value.mapDrafts.filter((draft) =>
          selectedBrackets.value.includes(draft.bracket),
        )
      : [],
    civDrafts: drafts.value?.civDrafts
      ? drafts.value.civDrafts.filter((draft) =>
          selectedBrackets.value.includes(draft.bracket),
        )
      : [],
  };
});
const mapCounts = computed(() => {
  return summarizeDrafts(filteredDrafts.value.mapDrafts);
});
const civCounts = computed(() => {
  return summarizeDrafts(filteredDrafts.value.civDrafts);
});

const filteredGames = computed(() =>
  games.value
    .filter((game) => selectedBrackets.value.includes(game.bracket))
    .filter((game) => selectedMaps.value.includes(game.map)),
);
const gameStats = computed(() => {
  return filteredGames.value.reduce<GameStats>(
    (stats, game) => {
      const winning = normalizeCivs(game.winningCiv);
      const losing = normalizeCivs(game.losingCiv);

      return {
        ...stats,
        civs: {
          ...stats.civs,
          [winning]: {
            ...stats.civs[winning],
            wins: stats.civs[winning].wins + 1,
            losses: stats.civs[winning].wins,
            total: stats.civs[winning].total + 1,
            winrate:
              (stats.civs[winning].wins + 1) / (stats.civs[winning].total + 1),
          },
          [losing]: {
            ...stats.civs[losing],
            wins: stats.civs[losing].wins,
            losses: stats.civs[losing].wins + 1,
            total: stats.civs[losing].total + 1,
            winrate: stats.civs[losing].wins / (stats.civs[losing].total + 1),
          },
        },
        maps: {
          ...stats.maps,
          [game.map]: (stats.maps[game.map] ?? 0) + 1,
        },
      };
    },
    {
      civs: Object.fromEntries(
        allCivs.map((civ) => [
          civ,
          {
            wins: 0,
            losses: 0,
            total: 0,
            winrate: 0,
            drafted:
              civCounts.value[civ]?.admin?.pick +
              civCounts.value[civ]?.player?.pick,
          },
        ]),
      ),
      maps: Object.fromEntries(
        Object.values(props.presetMapNames).map((mapName) => [mapName, 0]),
      ),
    },
  );
});

const filteredPlayers = computed(
  () =>
    players.value.filter((player) =>
      selectedBrackets.value.includes(player.bracket),
    ),
  // .filter((player) => selectedMaps.value.includes(mapName(player.map))),
);

const allMaps = computed(() => {
  return [...new Set(games.value.map((game) => game.map))].toSorted();
});

watch(allMaps, () => {
  selectedMaps.value = [...allMaps.value];
});
</script>

<template>
  <h1>{{ $params.name }} stats</h1>
  <hr />
  <h5>Global Filters</h5>
  <div class="pico">
    <details :class="$style.options">
      <summary>Brackets</summary>
      <fieldset>
        <fieldset class="grid">
          <label v-for="bracket in $params.brackets" :id="bracket">
            <input
              type="checkbox"
              :value="bracket"
              v-model="selectedBrackets"
            />
            {{ bracket }}
          </label>
        </fieldset>
        <input
          type="button"
          class="outline"
          value="Select all"
          @click="selectedBrackets = $params.brackets"
        />
        <input
          type="button"
          class="outline secondary"
          value="Deselect all"
          @click="selectedBrackets = []"
        />
      </fieldset>
    </details>
    <small>
      <strong>Brackets:</strong>
      {{
        selectedBrackets.length == $params.brackets.length
          ? "All"
          : selectedBrackets.length == 0
            ? "None"
            : selectedBrackets.join(", ")
      }}
    </small>
  </div>
  <div class="pico">
    <hgroup>
      <h2>Drafts</h2>
      <p>
        Showing
        <strong
          >{{ filteredDrafts.mapDrafts.length }} of
          {{ drafts?.mapDrafts?.length ?? 0 }}</strong
        >
        sets,
        <strong>{{ filteredGames.length }} of {{ games.length }}</strong> games
      </p>
    </hgroup>
  </div>
  <MapPicksChart v-if="Object.keys(mapCounts).length > 0" :drafts="mapCounts" />
  <MapBansChart v-if="Object.keys(mapCounts).length > 0" :drafts="mapCounts" />
  <CivPickChart :drafts="civCounts" />
  <CivBansChart :drafts="civCounts" />
  <div class="pico">
    <hgroup>
      <h2>Games</h2>
      <p>
        Showing
        <strong
          >{{ filteredDrafts.mapDrafts.length }} of
          {{ drafts?.mapDrafts?.length ?? 0 }}</strong
        >
        sets,
        <strong>{{ filteredGames.length }} of {{ games.length }}</strong> games
      </p>
    </hgroup>
  </div>
  <hr />
  <h5>Game Filters</h5>
  <div class="pico">
    <details :class="$style.options">
      <summary>Maps</summary>
      <fieldset>
        <fieldset class="grid">
          <label v-for="mapName in allMaps" :id="mapName">
            <input type="checkbox" :value="mapName" v-model="selectedMaps" />
            {{ mapName }}
          </label>
        </fieldset>
        <input
          type="button"
          class="outline"
          value="Select all"
          @click="selectedMaps = [...allMaps]"
        />
        <input
          type="button"
          class="outline secondary"
          value="Deselect all"
          @click="selectedMaps = []"
        />
      </fieldset>
    </details>
    <small>
      <strong>Maps:</strong>
      {{
        selectedMaps.length == allMaps.length
          ? "All"
          : selectedMaps.length == 0
            ? "None"
            : selectedMaps.join(", ")
      }}
    </small>
  </div>
  <MapPlayedChart :games="gameStats" />
  <CivPlayedChart :games="gameStats" />
  <CivWinrateChart :games="gameStats" />
  <EApmChart :players="filteredPlayers" />
  <VilCountChart :players="filteredPlayers" />
  <MostCreatedChart :players="filteredPlayers" />
</template>

<style lang="css" module>
.options {
  :global(.grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
