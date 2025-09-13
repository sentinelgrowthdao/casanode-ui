<template>
<main :class="['ion-content', fullscreen ? 'ion-fullscreen' : '']">
	<slot />
</main>
</template>

<script setup lang="ts">
defineProps<{ fullscreen?: boolean }>();
</script>

