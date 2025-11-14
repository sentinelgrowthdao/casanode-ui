<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	size: {
		type: [Number, String],
		default: undefined,
	},
	offset: {
		type: [Number, String],
		default: undefined,
	},
	noGrow: {
		type: Boolean,
		default: false,
	},
});

const classes = computed(() =>
{
	const cls = ['app-grid__col'];
	if (props.size)
	{
		cls.push(`app-grid__col--${props.size}`);
	}
	if (props.offset)
	{
		cls.push(`app-grid__col--offset-${props.offset}`);
	}
	if (props.noGrow)
	{
		cls.push('app-grid__col--no-grow');
	}
	return cls;
});
</script>

<template>
<div :class="classes">
	<slot />
</div>
</template>
