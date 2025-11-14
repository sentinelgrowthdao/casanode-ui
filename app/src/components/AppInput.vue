<script lang="ts" setup>
import { IonSpinner, UiInputField } from '@/ui';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
	placeholder: String,
	errorMessage: String,
	type: {
		type: String as () => 'text' | 'number' | 'ipv4' | 'ipv6',
		required: true,
	},
	minLength: Number,
	maxLength: Number,
	modelValue: String,
	ariaLabel: String,
	loading: {
		type: Boolean,
		default: false,
	},
});

const emits = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue || '');
const inputType = ref('text');
const touched = ref(false);
const validity = ref<'default' | 'valid' | 'invalid'>('default');

const validateIp = (value: string, type: 'ipv4' | 'ipv6'): boolean =>
{
	if (type === 'ipv4')
	{
		return !!value.match(
			/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
		);
	}
	else if (type === 'ipv6')
	{
		return !!value.match(
			/([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)/
		);
	}
	return false;
};

const validate = (value: string) =>
{
	let isValid = true;
	
	switch (props.type)
	{
		case 'text':
			isValid = value.length >= (props.minLength || 0) && value.length <= (props.maxLength || Infinity);
			break;
		case 'number':
			isValid = !isNaN(Number(value));
			break;
		case 'ipv4':
		case 'ipv6':
			isValid = validateIp(value, props.type);
			break;
	}
	
	return isValid;
};

const handleInput = (rawValue: string) =>
{
	let value = (rawValue ?? '').trim();

	if (props.type === 'number')
	{
		value = value.replace(/[^0-9]/g, '');
	}

	if (value === '')
	{
		validity.value = 'default';
		inputValue.value = '';
		emits('update:modelValue', '');
		return;
	}

	if (validate(value))
	{
		validity.value = 'valid';
	}
	else
	{
		validity.value = 'invalid';
	}

	inputValue.value = value;
	emits('update:modelValue', value);
};

const markTouched = () =>
{
	touched.value = true;
};

watch(() => props.modelValue, (newValue) =>
{
	inputValue.value = (newValue ?? '') as string;
	if (!newValue)
	{
		validity.value = 'default';
		touched.value = false;
	}
});


onMounted(() =>
{
	if(props.type === 'ipv4' || props.type === 'ipv6')
	{
		inputType.value = 'text';
	}
	else
	{
		inputType.value = props.type;
	}
});

const inputClasses = computed(() =>
{
	return {
		'ui-input-field--valid': validity.value === 'valid',
		'ui-input-field--invalid': validity.value === 'invalid',
		'ui-input-field--touched': touched.value,
	};
});
</script>

<template>
<ui-input-field
	:type="inputType"
	:placeholder="placeholder"
	:aria-label="ariaLabel"
	:modelValue="inputValue"
	:error-text="props.errorMessage"
	:class="inputClasses"
	@update:modelValue="handleInput"
	@blur="markTouched">
	<template #end>
		<ion-spinner v-if="loading" name="crescent" />
	</template>
</ui-input-field>
</template>
