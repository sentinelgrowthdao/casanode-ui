<template>
<component
	:is="href ? 'a' : 'button'"
	:href="href"
	:disabled="!href && disabled ? true : undefined"
	:aria-disabled="href && disabled ? 'true' : undefined"
	:class="classes"
	@click="onClick">
	<slot />
</component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	href: { type: String, default: undefined },
	fill: { type: String as () => 'clear' | 'outline' | 'solid' | 'default' | undefined, default: undefined },
	expand: { type: String as () => 'block' | undefined, default: undefined },
	size: { type: String as () => 'small' | 'default' | 'large' | undefined, default: undefined },
	color: { type: String, default: undefined },
	disabled: { type: Boolean, default: false },
});

const emit = defineEmits<{ (e: 'click', evt: MouseEvent): void }>();

const classes = computed(() => [
	'ion-button',
	props.fill ? `ion-fill-${props.fill}` : '',
	props.expand ? `ion-expand-${props.expand}` : '',
	props.size && props.size !== 'default' ? `ion-size-${props.size}` : '',
	props.color ? `ion-color-${props.color}` : '',
].filter(Boolean));

function onClick(evt: MouseEvent) 
{
	if (props.disabled) 
	{
		evt.preventDefault();
		evt.stopPropagation();
		return;
	}
	emit('click', evt);
}
</script>

