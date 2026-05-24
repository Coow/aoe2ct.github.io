---
layout: false
---

<script setup>
import ComparePlayers from '../../src/components/ComparePlayers.vue';

const isWarlords = new URL(globalThis.location.toString()).searchParams.has('warlords');

</script>

<style>
@import url("../../src/styles/warlords.css");
</style>

<section :class="{warlords: isWarlords, pico: !isWarlords}">
<ComparePlayers :code="$params.tournament" :preset-map-names="$params.presetMapChoices" />
</section>
