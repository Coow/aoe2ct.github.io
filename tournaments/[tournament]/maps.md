---
layout: false
---

<script setup>
import MapStatsTables from '../../src/components/MapStatsTables.vue';
</script>

<style>
@import url("../../src/styles/warlords.css");
</style>

<section class="warlords">
<MapStatsTables :code="$params.tournament" :preset-map-names="$params.presetMapChoices" />
</section>
