---
layout: false
---

<script setup>
import CivStatsTables from '../../src/components/CivStatsTables.vue';
</script>

<style>
@import url("../../src/styles/warlords.css");
</style>

<section class="warlords">
<CivStatsTables :code="$params.tournament" />
</section>
