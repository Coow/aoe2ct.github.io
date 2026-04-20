---
title: "%TOURNAMENT% Player Stats"
lastUpdated: true
footer: true
layout: home
---

<script setup>
import Tournament from "../../src/components/Tournament.vue";
import { parseJSON, format } from "date-fns";
</script>

<Tournament :code="$params.tournament" :preset-map-names="$params.presetMapChoices" page="players" />
Last updated: {{ format(parseJSON($params.lastUpdated), "PP HH:mm:ss O") }}
