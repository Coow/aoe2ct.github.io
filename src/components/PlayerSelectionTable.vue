<script setup lang="ts">
import { Player } from "../types";

const { players } = defineProps<{ players: Player[] }>();
const emit = defineEmits<{
  selectPlayer: [name: Player["player"]];
}>();
</script>

<template>
  <table class="striped">
    <thead>
      <tr>
        <th width="150">Bracket</th>
        <th width="300">Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="player in players" :key="player.player">
        <td>{{ player.bracket }}</td>
        <td>
          <a href="" @click="emit('selectPlayer', player.player)">{{
            player.player
          }}</a>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style module>
td a {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
