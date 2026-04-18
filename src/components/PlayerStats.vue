<script setup lang="ts">
import { useData } from "vitepress";
import { computed, Ref, ref, watchEffect } from "vue";
import { Player } from "../types";
import { fetchData } from "../utils";

const props = defineProps({
  code: { type: String, required: true },
  presetMapNames: { type: Object, required: true },
});
const { params } = useData();

const players: Ref<Player[]> = ref([]);
const playerFilter = ref("");
const selectedBrackets = ref([...(params.value?.brackets ?? [])]);

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
</script>

<template>
  <div class="pico">
    <h5>Find Players</h5>
    <input type="search" placeholder="Search player" v-model="playerFilter" />
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

    <p>
      <small>Showing {{ sortedPlayers.length }} players</small>
    </p>

    <div class="grid">
      <table class="striped">
        <thead>
          <tr>
            <th width="150">Bracket</th>
            <th width="300">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in sortedPlayers.slice(0, sortedPlayers.length / 3)"
            :key="player.player"
          >
            <td>{{ player.bracket }}</td>
            <td>{{ player.player }}</td>
          </tr>
        </tbody>
      </table>
      <table class="striped">
        <thead>
          <tr>
            <th width="150">Bracket</th>
            <th width="300">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in sortedPlayers.slice(
              sortedPlayers.length / 3,
              (sortedPlayers.length / 3) * 2,
            )"
            :key="player.player"
          >
            <td>{{ player.bracket }}</td>
            <td>{{ player.player }}</td>
          </tr>
        </tbody>
      </table>
      <table class="striped">
        <thead>
          <tr>
            <th width="150">Bracket</th>
            <th width="300">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in sortedPlayers.slice(
              (sortedPlayers.length / 3) * 2,
            )"
            :key="player.player"
          >
            <td>{{ player.bracket }}</td>
            <td>{{ player.player }}</td>
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
</style>
