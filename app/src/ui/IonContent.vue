<template>
<main :class="['app-content', fullscreen ? 'app-fullscreen' : '']">
	<slot />
</main>
</template>

<script setup lang="ts">
defineProps<{ fullscreen?: boolean }>();
</script>
