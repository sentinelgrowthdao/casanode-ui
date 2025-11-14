<template>
<!-- Router navigation when routerLink is provided -->
<RouterLink v-if="routerLink" :to="routerLink" custom>
	<template #default="{ href, navigate }">
		<a
			:href="href"
			:class="classes"
			:aria-disabled="disabled ? 'true' : undefined"
			@click="(e: MouseEvent) => onRouterClick(e, navigate)">
			<slot />
		</a>
	</template>
</RouterLink>

<!-- Plain anchor when href is provided -->
<a v-else-if="href"
	:href="href"
	:class="classes"
	:aria-disabled="disabled ? 'true' : undefined"
	@click="onClick">
	<slot />
</a>

<!-- Fallback to button -->
<button v-else
	:disabled="disabled"
	:class="classes"
	@click="onClick">
	<slot />
</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
	href: { type: String, default: undefined },
	routerLink: { type: [String, Object] as unknown as () => string | Record<string, any>, default: undefined },
	routerDirection: { type: String, default: undefined },
	fill: { type: String as () => 'clear' | 'outline' | 'solid' | 'default' | undefined, default: undefined },
	expand: { type: String as () => 'block' | undefined, default: undefined },
	size: { type: String as () => 'small' | 'default' | 'large' | undefined, default: undefined },
	color: { type: String, default: undefined },
	disabled: { type: Boolean, default: false },
});

const emit = defineEmits<{ (e: 'click', evt: MouseEvent): void }>();

const classes = computed(() => [
	'app-button',
	props.fill ? `app-fill-${props.fill}` : '',
	props.expand ? `app-expand-${props.expand}` : '',
	props.size && props.size !== 'default' ? `app-size-${props.size}` : '',
	props.color ? `app-color-${props.color}` : '',
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

function onRouterClick(evt: MouseEvent, navigate: (e: MouseEvent) => void) 
{
	if (props.disabled)
	{
		evt.preventDefault();
		evt.stopPropagation();
		return;
	}
	// Emit click for listeners, then let router navigate
	emit('click', evt);
	navigate(evt);
}
</script>
