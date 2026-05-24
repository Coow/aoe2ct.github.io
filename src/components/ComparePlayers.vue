<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue";
import { Player, allCivs } from "../types";
import { fetchData, normalizeCivs } from "../utils";
import PlayerCard, { PlayerSummary } from "./PlayerCard.vue";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});
const players: Ref<Player[]> = ref([]);

watchEffect(async () => {
  players.value = await fetchData(props.code, "players");
});

const pageUrl = new URL(globalThis.location.toString());
const bracket = pageUrl.searchParams.get("bracket");

const playersCompared = pageUrl.searchParams.get("players") || ",";
const [player1, player2] = playersCompared.split(",");

function summarizePlayer(accumulator: PlayerSummary, game: Player) {
  const wins = accumulator.wins + (game.winner ? 1 : 0);
  const games = accumulator.games + 1;
  const eapms = [...accumulator.eapms, game.eapm];
  const civPicks = accumulator.sets.includes(game.set_id)
    ? { ...accumulator.civStats }
    : (game.civ_picks as Array<(typeof allCivs)[number]>)
        .map(normalizeCivs)
        .reduce(
          (civs, civ) => ({
            ...civs,
            [civ]: { ...civs[civ], picks: civs[civ].picks + 1 },
          }),
          accumulator.civStats,
        );
  const civBans = accumulator.sets.includes(game.set_id)
    ? { ...accumulator.civStats }
    : (game.civ_bans as Array<(typeof allCivs)[number]>)
        .map(normalizeCivs)
        .reduce(
          (civs, civ) => ({
            ...civs,
            [civ]: { ...civs[civ], bans: civs[civ].bans + 1 },
          }),
          civPicks,
        );
  const gameCiv = normalizeCivs(game.civ) as (typeof allCivs)[number];
  const civsPlayed = {
    ...civBans,
    [gameCiv]: {
      ...civBans[gameCiv],
      played: civBans[gameCiv].played + 1,
      wins: civBans[gameCiv].wins + (game.winner ? 1 : 0),
      playtime: civBans[gameCiv].playtime + game.duration,
    },
  };
  return {
    ...accumulator,
    games,
    wins,
    losses: accumulator.losses + (game.winner ? 0 : 1),
    winrate: Math.round((100 * wins) / games),
    eapms,
    civStats: civsPlayed,
    durations: [...accumulator.durations, game.duration],
    vils: [...accumulator.vils, game.vil_count],
    sets: [...new Set([...accumulator.sets, game.set_id])],
  };
}
const bracketPlayers = computed(() =>
  players.value.filter((player) =>
    bracket ? player.bracket == bracket : true,
  ),
);

function computeStats(playerName: string) {
  return bracketPlayers.value
    .filter((player) => player.player == playerName)
    .reduce(summarizePlayer, {
      name: playerName,
      games: 0,
      wins: 0,
      losses: 0,
      colorPicks: [],
      favouriteColor: 0,
      eapms: [],
      civStats: Object.fromEntries(
        allCivs.map((civ) => [
          civ,
          { picks: 0, bans: 0, played: 0, wins: 0, playtime: 0 },
        ]),
      ) as PlayerSummary["civStats"],
      durations: [],
      vils: [],
      sets: [],
    } as PlayerSummary);
}
const player1Stats = computed(() => computeStats(player1));
const player2Stats = computed(() => computeStats(player2));
</script>

<template>
  <div :class="$style.comparison">
    <div class="error" v-if="!player1 || !player2">
      Missing correct parameter for players. Use the format
      <code>players=player1,player2</code>
    </div>
    <PlayerCard :stats="player1Stats" />
    <PlayerCard :stats="player2Stats" />
  </div>
</template>

<style lang="css" module>
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>
