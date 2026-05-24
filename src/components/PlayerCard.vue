<script setup lang="ts">
import { computed } from "vue";
import { durationToString, iconName } from "../utils";
const { stats } = defineProps<{ stats: PlayerSummary }>();

const durations = computed(() =>
  stats.durations.length > 0 ? stats.durations : [0],
);
const eapms = computed(() => (stats.eapms.length > 0 ? stats.eapms : [0]));
const vils = computed(() => (stats.vils.length > 0 ? stats.vils : [0]));
const civStats = computed(() => {
  return {
    totalPlayed: Object.entries(stats.civStats).filter(
      ([, { played }]) => played > 0,
    ).length,
    mostPlayed: Object.entries(stats.civStats)
      .map(([civ, { played, wins }]) => [civ, { played, wins }])
      .toSorted(([, a], [, b]) => {
        if (b.played == a.played) {
          return b.wins - a.wins;
        }
        return b.played - a.played;
      })
      .at(0),
    mostPicked: Object.entries(stats.civStats)
      .map(([civ, { picks }]) => [civ, picks])
      .toSorted(([, a], [, b]) => b - a)
      .at(0),
    mostBanned: Object.entries(stats.civStats)
      .map(([civ, { bans }]) => [civ, bans])
      .toSorted(([, a], [, b]) => b - a)
      .at(0),
    longestPlayed: Object.entries(stats.civStats)
      .map(([civ, { playtime }]) => [civ, playtime])
      .toSorted(([, a], [, b]) => b - a)
      .at(0),
  };
});
</script>
<script lang="ts">
import { allCivs } from "../types";
import { withBase } from "vitepress";
export type PlayerSummary = {
  name: string;
  games: number;
  wins: number;
  losses: number;
  colorPicks: number[];
  favouriteColor: number;
  eapms: number[];
  civStats: {
    [K in (typeof allCiv)[number]]: {
      picks: number;
      bans: number;
      played: number;
      wins: number;
      playtime: number;
    };
  };
  durations: number[];
  vils: number[];
};
</script>
<template>
  <div class="finalistCard">
    <div class="playerImage">
      <img
        :src="withBase(`/images/${stats.name.toLowerCase()}.webp`)"
        :alt="stats.name"
      />
    </div>
    <div class="finalistTables playerStats">
      <table class="civs">
        <colgroup>
          <col width="400" />
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">Player stats</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Wins</td>
            <td>{{ stats.wins }}</td>
          </tr>
          <tr>
            <td>Losses</td>
            <td>{{ stats.losses }}</td>
          </tr>
          <tr>
            <td>Winrate</td>
            <td>{{ Math.round((10000 * stats.wins) / stats.games) / 100 }}%</td>
          </tr>
        </tbody>
      </table>
      <table class="civs">
        <colgroup>
          <col width="400" />
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">Time played</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Longest game</td>
            <td>{{ durationToString(Math.max(...durations)) }}</td>
          </tr>
          <tr>
            <td>Shortest game</td>
            <td>{{ durationToString(Math.min(...durations)) }}</td>
          </tr>
          <tr>
            <td>Mean</td>
            <td>
              {{
                durationToString(
                  durations.reduce((a, b) => a + b) / durations.length,
                )
              }}
            </td>
          </tr>
          <tr>
            <td>Overall</td>
            <td>
              {{ durationToString(durations.reduce((a, b) => a + b)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="finalistTables gamesStats">
      <table class="civs">
        <colgroup>
          <col width="400" />
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">EAPM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Max</td>
            <td>{{ Math.max(...eapms) }}</td>
          </tr>
          <tr>
            <td>Min</td>
            <td>{{ Math.min(...eapms) }}</td>
          </tr>
          <tr>
            <td>Mean</td>
            <td>
              {{ Math.round(eapms.reduce((a, b) => a + b) / eapms.length) }}
            </td>
          </tr>
        </tbody>
      </table>
      <table class="civs">
        <colgroup>
          <col width="400" />
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">Vils Queued</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Max</td>
            <td>{{ Math.max(...vils) }}</td>
          </tr>
          <tr>
            <td>Min</td>
            <td>{{ Math.min(...vils) }}</td>
          </tr>
          <tr>
            <td>Mean</td>
            <td>
              {{ Math.round(vils.reduce((a, b) => a + b) / vils.length) }}
            </td>
          </tr>
          <tr>
            <td>Overall</td>
            <td>
              {{ Math.round(vils.reduce((a, b) => a + b)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="finalistTables civStats">
      <table class="civs">
        <colgroup>
          <col width="400" />
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">Civ stats</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Civs played</td>
            <td>
              {{ civStats.totalPlayed }}
            </td>
          </tr>
          <tr>
            <td>Most played</td>
            <td class="civ">
              <div
                class="civ-cell"
                v-if="civStats.mostPlayed && civStats.mostPlayed.length == 2"
              >
                <img
                  v-if="civStats.mostPlayed[0] != 'None'"
                  :src="`https://aoe2techtree.net/img/Civs/${iconName(civStats.mostPlayed[0])}.png`"
                  :alt="`${civStats.mostPlayed[0]} emblem`"
                />{{ civStats.mostPlayed[0] }}
              </div>
            </td>
          </tr>
          <tr>
            <td>Times played</td>
            <td>
              {{ civStats.mostPlayed[1].played }}
            </td>
          </tr>
          <tr>
            <td>Winrate</td>
            <td>
              {{
                Math.round(
                  (100 * civStats.mostPlayed[1].wins) /
                    civStats.mostPlayed[1].played,
                )
              }}%
            </td>
          </tr>
          <tr>
            <td>Most picked</td>
            <td class="civ">
              <div
                class="civ-cell"
                v-if="civStats.mostPicked && civStats.mostPicked.length == 2"
              >
                <img
                  v-if="civStats.mostPicked[0] != 'None'"
                  :src="`https://aoe2techtree.net/img/Civs/${iconName(civStats.mostPicked[0])}.png`"
                  :alt="`${civStats.mostPicked[0]} emblem`"
                />{{ civStats.mostPicked[0] }} ({{ civStats.mostPicked[1] }})
              </div>
            </td>
          </tr>
          <tr>
            <td>Most banned</td>
            <td class="civ">
              <div
                class="civ-cell"
                v-if="civStats.mostBanned && civStats.mostBanned.length == 2"
              >
                <img
                  v-if="civStats.mostBanned[0] != 'None'"
                  :src="`https://aoe2techtree.net/img/Civs/${iconName(civStats.mostBanned[0])}.png`"
                  :alt="`${civStats.mostBanned[0]} emblem`"
                />{{ civStats.mostBanned[0] }} ({{ civStats.mostBanned[1] }})
              </div>
            </td>
          </tr>
          <tr>
            <td>Longest played</td>
            <td class="civ">
              <div
                class="civ-cell"
                v-if="
                  civStats.longestPlayed && civStats.longestPlayed.length == 2
                "
              >
                <img
                  v-if="civStats.longestPlayed[0] != 'None'"
                  :src="`https://aoe2techtree.net/img/Civs/${iconName(civStats.longestPlayed[0])}.png`"
                  :alt="`${civStats.longestPlayed[0]} emblem`"
                />{{ civStats.longestPlayed[0] }} ({{
                  durationToString(civStats.longestPlayed[1])
                }})
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <pre>{{ props.stats }}</pre> -->
  </div>
</template>

<style>
.finalistTables tr {
  height: 2.5rem;
}
.finalistTables table {
  margin: 0.5rem;
}
</style>
