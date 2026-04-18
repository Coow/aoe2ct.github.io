---
title: "%TOURNAMENT%"
lastUpdated: true
footer: true
layout: home
---

<script setup>
import Tournament from "../../src/components/Tournament.vue";
import { parseJSON, format } from "date-fns";
</script>

<Tournament page="overview" :code="$params.tournament" :preset-map-names="$params.presetMapChoices" />
Last updated: {{ format(parseJSON($params.lastUpdated), "PP HH:mm:ss O") }}
