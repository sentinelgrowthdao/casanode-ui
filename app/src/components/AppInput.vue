<script lang="ts" setup>
import { IonInput } from '@/ui';
import { onMounted, type Ref, ref, watch } from 'vue';

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
});

const emits = defineEmits(['update:modelValue']);

const inputRef: Ref<InstanceType<typeof IonInput> | null> = ref(null);
const inputValue: Ref<string> = ref(props.modelValue || '');
const inputType: Ref<string> = ref('text');

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
		inputRef.value?.$el.classList.remove('ion-valid');
		inputRef.value?.$el.classList.remove('ion-invalid');
		inputValue.value = '';
		emits('update:modelValue', '');
		return;
	}
   
	if (validate(value))
	{
		inputRef.value?.$el.classList.add('ion-valid');
		inputRef.value?.$el.classList.remove('ion-invalid');
	}
	else
	{
		inputRef.value?.$el.classList.add('ion-invalid');
		inputRef.value?.$el.classList.remove('ion-valid');
	}

	inputValue.value = value;
	emits('update:modelValue', value);
};

const markTouched = (/*event: Event*/) =>
{
	inputRef.value?.$el.classList.add('ion-touched');
};

watch(() => props.modelValue, (newValue) =>
{
	inputValue.value = (newValue ?? '') as string;
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
</script>

<template>
<ion-input
	ref="inputRef"
	:type="inputType"
	:placeholder="placeholder"
	:aria-label="ariaLabel"
	:modelValue="inputValue"
	:error-text="props.errorMessage"
	@update:modelValue="handleInput"
	@ionBlur="markTouched"
	lines="none"/>
</template>
