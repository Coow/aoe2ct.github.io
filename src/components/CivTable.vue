<script setup lang="ts">
const props = defineProps<{
  civStats: {
    name: string;
    winrate: number;
    wins: number;
    losses: number;
    picks: number;
    bans: number;
  }[];
}>();

function iconName(name: string) {
  if (name.toLowerCase() == "maya") {
    return "mayans";
  }
  if (name.toLowerCase() == "inca") {
    return "incas";
  }
  return name.toLowerCase();
}
</script>

<template>
  <table class="civs">
    <thead>
      <tr>
        <td class="civ">Civ</td>
        <td>Winrate</td>
        <td>Wins</td>
        <td>Losses</td>
        <td>Picks</td>
        <td>Bans</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stats in civStats" :key="stats.name">
        <td class="civ">
          <div class="civ-cell">
            <img
              :src="`https://aoe2techtree.net/img/Civs/${iconName(stats.name)}.png`"
              :alt="`${stats.name} emblem`"
            />{{ stats.name }}
          </div>
        </td>
        <td>{{ stats.winrate }}%</td>
        <td class="wins">{{ stats.wins }}</td>
        <td class="losses">{{ stats.losses }}</td>
        <td>{{ stats.picks }}</td>
        <td>{{ stats.bans }}</td>
      </tr>
    </tbody>
  </table>
</template>
