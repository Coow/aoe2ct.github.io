---
title: '%TOURNAMENT%'
lastUpdated: true
footer: true
---
<script setup>
import Tournament from "../../src/components/Tournament.vue";
</script>

<Tournament :code="$params.tournament" :preset-map-names="$params.presetMapChoices" />
