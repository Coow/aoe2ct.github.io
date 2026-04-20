<script setup lang="ts">
import { useData } from "vitepress";
import { computed, Ref, ref, watchEffect } from "vue";
import { allCivs, Player } from "../types";
import { fetchData, normalizeCivs } from "../utils";
import PlayerSelectionTable from "./PlayerSelectionTable.vue";
import { format, fromUnixTime } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import MapPicksChart from "./MapPicksChart.vue";
import MapBansChart from "./MapBansChart.vue";
import CivPickChart from "./CivPickChart.vue";
import CivBansChart from "./CivBansChart.vue";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});
const { params } = useData();

const players: Ref<Player[]> = ref([]);
const playerFilter = ref("");
const selectedBrackets = ref([...(params.value?.brackets ?? [])]);
const selectedPlayer = ref("");

watchEffect(async () => {
  players.value = await fetchData(props.code, "players");
});

const filteredPlayers = computed(() =>
  players.value
    .filter((player) => selectedBrackets.value.includes(player.bracket))
    .filter((player) =>
      player.player.toLowerCase().includes(playerFilter.value.toLowerCase()),
    ),
);

const sortedPlayers = computed(() => {
  const brackets = params.value?.brackets ?? [];
  const playerGames = filteredPlayers.value
    .toSorted((a, b) => {
      const [bIndex, aIndex] = [
        brackets.indexOf(b.bracket),
        brackets.indexOf(a.bracket),
      ];
      if (bIndex != aIndex) {
        return bIndex - aIndex;
      }
      return a.player.localeCompare(b.player);
    })
    .reduce(
      (games, player) => ({
        ...games,
        [player.player]: [...(games[player.player] ?? []), player],
      }),
      {} as Record<Player["player"], Player[]>,
    );
  return Object.entries(playerGames).map(([_playerName, games]) => games[0]);
});

const playerGames = computed(() =>
  players.value.filter((player) => player.player == selectedPlayer.value),
);

const gameStats = computed(() => {
  const setsPlayed = playerGames.value.reduce((sets, game) => {
    return sets.add(game.set_id);
  }, new Set());
  const durations = playerGames.value.map((game) => game.duration);
  const totalDuration = durations.reduce((sum, v) => sum + v);
  const eapm = playerGames.value.map((game) => game.eapm);
  return {
    games: playerGames.value.length,
    sets: setsPlayed.size,
    victories: playerGames.value.filter((game) => game.winner).length,
    gameTime: totalDuration,
    shortest: Math.min.apply(null, durations),
    longest: Math.max.apply(null, durations),
    averageGameTime: totalDuration / durations.length,
    minEapm: Math.min.apply(null, eapm),
    maxEapm: Math.max.apply(null, eapm),
    averageEapm:
      Math.round((eapm.reduce((a, b) => a + b) / eapm.length) * 100) / 100,
  };
});

function mapName(name: string) {
  return props.presetMapNames[name] ?? name;
}
const mapCounts = computed(() => {
  const counts = Object.fromEntries(
    Object.values(props.presetMapNames).map((name) => [
      name,
      {
        player: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
        admin: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
      },
    ]),
  );

  return playerGames.value.reduce((c, game) => {
    const newCounts = { ...c };
    for (let map_id of game.map_picks) {
      newCounts[mapName(map_id)].player.pick += 1;
    }
    for (let map_id of game.map_bans) {
      newCounts[mapName(map_id)].player.ban += 1;
    }
    for (let map_id of game.map_snipes) {
      newCounts[mapName(map_id)].player.snipe.player += 1;
    }
    return newCounts;
  }, counts);
});

const civCounts = computed(() => {
  const counts = Object.fromEntries(
    allCivs.map((name) => [
      name,
      {
        player: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
        admin: { pick: 0, ban: 0, snipe: { player: 0, admin: 0 }, steal: 0 },
      },
    ]),
  );

  return playerGames.value.reduce((c, game) => {
    const newCounts = { ...c };
    for (let civ_id of game.civ_picks) {
      newCounts[normalizeCivs(civ_id)].player.pick += 1;
    }
    for (let civ_id of game.civ_bans) {
      newCounts[normalizeCivs(civ_id)].player.ban += 1;
    }
    for (let civ_id of game.civ_snipes) {
      newCounts[normalizeCivs(civ_id)].player.snipe.player += 1;
    }
    for (let civ_id of game.civ_steals) {
      newCounts[normalizeCivs(civ_id)].player.steal += 1;
    }
    return newCounts;
  }, counts);
});

function durationToString(duration: number) {
  return format(new UTCDate(fromUnixTime(duration / 1000)), "HH:mm:ss");
}

function civIconName(name: string) {
  if (name == "Maya") return "mayans";
  return name.toLowerCase();
}
</script>

<template>
  <div class="pico" v-if="!selectedPlayer">
    <h5>Find Players</h5>
    <input type="search" placeholder="Search player" v-model="playerFilter" />
    <details :class="$style.options">
      <summary>Brackets</summary>
      <fieldset>
        <fieldset class="grid">
          <label v-for="bracket in params?.brackets" :id="bracket">
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
          @click="selectedBrackets = params?.brackets"
        />
        <input
          type="button"
          class="outline secondary"
          value="Deselect all"
          @click="selectedBrackets = []"
        />
      </fieldset>
    </details>

    <p>
      <small>Showing {{ sortedPlayers.length }} players</small>
    </p>

    <div class="grid">
      <PlayerSelectionTable
        v-if="sortedPlayers.length <= 10"
        :players="sortedPlayers"
        @selectPlayer="selectedPlayer = $event"
      />
      <PlayerSelectionTable
        v-if="sortedPlayers.length > 10"
        :players="sortedPlayers.slice(0, sortedPlayers.length / 3)"
        @selectPlayer="selectedPlayer = $event"
      />
      <PlayerSelectionTable
        v-if="sortedPlayers.length > 10"
        :players="
          sortedPlayers.slice(
            sortedPlayers.length / 3,
            (sortedPlayers.length / 3) * 2,
          )
        "
        @selectPlayer="selectedPlayer = $event"
      />
      <PlayerSelectionTable
        v-if="sortedPlayers.length > 10"
        :players="sortedPlayers.slice((sortedPlayers.length / 3) * 2)"
        @selectPlayer="selectedPlayer = $event"
      />
    </div>
  </div>
  <div v-if="selectedPlayer">
    <div class="pico">
      <button @click="selectedPlayer = ''">< Go back</button>
    </div>
    <br />
    <h1>Stats for {{ selectedPlayer }}</h1>
    <div class="pico">
      <table class="striped">
        <tbody>
          <tr>
            <td>Sets played</td>
            <td>{{ gameStats.sets }}</td>
          </tr>
          <tr>
            <td>Games played</td>
            <td>{{ gameStats.games }}</td>
          </tr>
          <tr>
            <td>Average games per set</td>
            <td>{{ gameStats.games / gameStats.sets }}</td>
          </tr>
          <tr>
            <td>Victories/Losses</td>
            <td>
              {{ gameStats.victories }}W
              {{ gameStats.games - gameStats.victories }}L
            </td>
          </tr>
          <tr>
            <td>Total game time</td>
            <td>{{ durationToString(gameStats.gameTime) }}</td>
          </tr>
          <tr>
            <td>Shortest game</td>
            <td>{{ durationToString(gameStats.shortest) }}</td>
          </tr>
          <tr>
            <td>Longest game</td>
            <td>{{ durationToString(gameStats.longest) }}</td>
          </tr>
          <tr>
            <td>Average game length</td>
            <td>{{ durationToString(gameStats.averageGameTime) }}</td>
          </tr>
          <tr>
            <td>Min eAPM</td>
            <td>{{ gameStats.minEapm }}</td>
          </tr>
          <tr>
            <td>Max eAPM</td>
            <td>{{ gameStats.maxEapm }}</td>
          </tr>
          <tr>
            <td>Average eAPM</td>
            <td>{{ gameStats.averageEapm }}</td>
          </tr>
        </tbody>
      </table>
      <MapPicksChart
        v-if="Object.keys(mapCounts).length > 0"
        :drafts="mapCounts"
      />
      <MapBansChart
        v-if="Object.keys(mapCounts).length > 0"
        :drafts="mapCounts"
      />
      <CivPickChart :drafts="civCounts" />
      <CivBansChart :drafts="civCounts" />
      <h2>{{ selectedPlayer }}'s games</h2>
      <table>
        <thead>
          <tr>
            <th>Opponent</th>
            <th>Drafts</th>
            <th>Map</th>
            <th>Player civ</th>
            <th>Opponent civ</th>
            <th>Winner</th>
            <th>Duration</th>
            <th>Age up timings</th>
            <th>Vil count</th>
            <th>Most created</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="game in playerGames"
            :key="game.set_id + game.map"
            :class="{
              [$style.win]: game.winner,
              [$style.loss]: !game.winner,
            }"
          >
            <td>{{ game.opponent }}</td>
            <td>
              <a
                :href="`https://aoe2cm.net/draft/${game.map_draft}`"
                target="_blank"
              >
                Map </a
              ><br />
              <a
                :href="`https://aoe2cm.net/draft/${game.civ_draft}`"
                target="_blank"
              >
                Civ
              </a>
            </td>
            <td>{{ game.map }}</td>
            <td>
              <a
                :href="`https://aoe2techtree.net/#${civIconName(game.civ)}`"
                target="_blank"
              >
                <img
                  :src="`https://aoe2techtree.net/img/Civs/${civIconName(game.civ)}.png`"
                  :alt="game.civ"
                  :title="game.civ"
                  width="32"
                  height="32"
                />
              </a>
            </td>
            <td>
              <a
                :href="`https://aoe2techtree.net/#${game.opponent_civ}`"
                target="_blank"
              >
                <img
                  :src="`https://aoe2techtree.net/img/Civs/${civIconName(game.opponent_civ)}.png`"
                  :alt="game.opponent_civ"
                  :title="game.opponent_civ"
                  width="32"
                  height="32"
                />
              </a>
            </td>
            <td>{{ game.winner ? game.player : game.opponent }}</td>
            <td>{{ durationToString(game.duration) }}</td>
            <td>
              F: {{ game.feudal_time }}<br />
              C: {{ game.castle_time }}<br />
              I: {{ game.imperial_time }}
            </td>
            <td>{{ game.vil_count }}</td>
            <td>{{ game.most_created }} ({{ game.most_created_count }})</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="css" module>
.options {
  :global(.grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.bracket {
  :global(.grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

:global(.pico) {
  input[type="search"] {
    margin-top: 2rem;
  }
}

.win td {
  background-color: var(--vp-c-green-3);
}

.loss td {
  background-color: var(--vp-c-red-3);
}
</style>
