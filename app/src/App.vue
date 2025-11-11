<template>
<div class="app-root">
	<router-view />
	<notifications position="bottom center" />
</div>
</template>

<script setup lang="ts">
import '@scss/theme/ionic-shim.scss';
import '@scss/theme/variables.scss';
</script>
