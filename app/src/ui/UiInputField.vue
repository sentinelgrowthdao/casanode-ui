<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

defineOptions({ name: 'UiInputField', inheritAttrs: false });

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: '',
	},
	type: {
		type: String,
		default: 'text',
	},
	placeholder: {
		type: String,
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void;
	(e: 'blur', evt: FocusEvent): void;
	(e: 'focus', evt: FocusEvent): void;
}>();

const attrs = useAttrs();
const inputRef = ref<HTMLInputElement | null>(null);

const wrapperClasses = computed(() =>
{
	return [
		'ui-input-field',
		{
			'ui-input-field--disabled': props.disabled,
			'ui-input-field--readonly': props.readonly,
		},
		attrs.class,
	];
});

const inputAttrs = computed(() =>
{
	const { class: _class, ...rest } = attrs;
	return rest;
});

const value = computed({
	get: () =>
	{
		return props.modelValue === undefined || props.modelValue === null
			? ''
			: String(props.modelValue);
	},
	set: (val: string) =>
	{
		emit('update:modelValue', val);
	},
});

const onInput = (event: Event) =>
{
	const target = event.target as HTMLInputElement;
	value.value = target.value ?? '';
};

defineExpose({
	focus: () => inputRef.value?.focus(),
	blur: () => inputRef.value?.blur(),
	el: inputRef,
});
</script>

<template>
<div :class="wrapperClasses">
	<span v-if="$slots.start" class="ui-input-field__addon ui-input-field__addon--start">
		<slot name="start" />
	</span>
	<input
		ref="inputRef"
		class="ui-input-field__control"
		v-bind="inputAttrs"
		:type="type"
		:placeholder="placeholder"
		:value="value"
		:disabled="disabled"
		:readonly="readonly"
		@input="onInput"
		@blur="(evt) => emit('blur', evt)"
		@focus="(evt) => emit('focus', evt)" />
	<span v-if="$slots.end" class="ui-input-field__addon ui-input-field__addon--end">
		<slot name="end" />
	</span>
</div>
</template>
