<script setup lang="ts">
import { durationToString, iconName } from "../utils";

const props = defineProps<{
  mapStats: {
    name: string;
    picks: number;
    admin_picks: number;
    played: number;
    played_pct: number;
    total_duration: number;
    max_duration: number;
    min_duration: number;
    top_civ: [string, number];
    second_civ: [string, number];
  }[];
}>();
</script>

<template>
  <table class="maps">
    <thead>
      <tr>
        <td class="map">Map</td>
        <td>Played</td>
        <td>Admin Picks</td>
        <td>Player Picks</td>
        <td>Total time played</td>
        <td>Longest game</td>
        <td>Shortest game</td>
        <td>Most played civ</td>
        <td>2nd most played civ</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stats in mapStats" :key="stats.name">
        <td class="map">
          {{ stats.name }}
        </td>
        <td>{{ stats.played }} ({{ stats.played_pct }}%)</td>
        <td>{{ stats.admin_picks }}</td>
        <td>{{ stats.picks }}</td>
        <td>{{ durationToString(stats.total_duration) }}</td>
        <td>{{ durationToString(stats.max_duration) }}</td>
        <td>{{ durationToString(stats.min_duration) }}</td>
        <td class="civ">
          <div class="civ-cell">
            <img
              v-if="stats.top_civ[0] != 'None'"
              :src="`https://aoe2techtree.net/img/Civs/${iconName(stats.top_civ[0])}.png`"
              :alt="`${stats.top_civ[0]} emblem`"
            />{{ stats.top_civ[0] }} ({{ stats.top_civ[1] }})
          </div>
        </td>
        <td class="civ">
          <div class="civ-cell">
            <img
              v-if="stats.second_civ[0] != 'None'"
              :src="`https://aoe2techtree.net/img/Civs/${iconName(stats.second_civ[0])}.png`"
              :alt="`${stats.second_civ[0]} emblem`"
            />{{ stats.second_civ[0] }} ({{ stats.second_civ[1] }})
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
