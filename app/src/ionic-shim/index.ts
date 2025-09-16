import { App, Plugin, defineComponent, h, PropType } from 'vue';
import { RouterLink } from 'vue-router';

// Basic structural wrappers
const IonApp = defineComponent({ name: 'IonApp', setup(_, { slots }) { return () => h('div', { class: 'ion-app' }, slots.default && slots.default()); } });
const IonPage = defineComponent({ name: 'IonPage', setup(_, { slots }) { return () => h('div', { class: 'ion-page' }, slots.default && slots.default()); } });
const IonHeader = defineComponent({ name: 'IonHeader', setup(_, { slots }) { return () => h('header', { class: 'ion-header' }, slots.default && slots.default()); } });
const IonToolbar = defineComponent({ name: 'IonToolbar', setup(_, { slots }) { return () => h('div', { class: 'ion-toolbar' }, slots.default && slots.default()); } });
const IonTitle = defineComponent({ name: 'IonTitle', setup(_, { slots }) { return () => h('div', { class: 'ion-title' }, slots.default && slots.default()); } });
const IonButtons = defineComponent({ name: 'IonButtons', setup(_, { slots }) { return () => h('div', { class: 'ion-buttons' }, slots.default && slots.default()); } });
const IonLabel = defineComponent({ name: 'IonLabel', setup(_, { slots }) { return () => h('span', { class: 'ion-label' }, slots.default && slots.default()); } });

const IonContent = defineComponent({
	name: 'IonContent',
	props: { fullscreen: { type: Boolean, default: false } },
	setup(props, { slots }) 
	{
		return () => h('main', { class: ['ion-content', props.fullscreen ? 'ion-fullscreen' : ''] }, slots.default && slots.default());
	}
});

// Router outlet -> <router-view />
const IonRouterOutlet = defineComponent({ name: 'IonRouterOutlet', setup() { return () => h('router-view'); } });

// Cards
const IonCard = defineComponent({ name: 'IonCard', setup(_, { slots }) { return () => h('div', { class: 'ion-card' }, slots.default && slots.default()); } });
const IonCardHeader = defineComponent({ name: 'IonCardHeader', setup(_, { slots }) { return () => h('div', { class: 'ion-card-header' }, slots.default && slots.default()); } });
const IonCardTitle = defineComponent({ name: 'IonCardTitle', setup(_, { slots }) { return () => h('div', { class: 'ion-card-title' }, slots.default && slots.default()); } });
const IonCardContent = defineComponent({ name: 'IonCardContent', setup(_, { slots }) { return () => h('div', { class: 'ion-card-content' }, slots.default && slots.default()); } });

// Grid
const IonGrid = defineComponent({ name: 'IonGrid', setup(_, { slots }) { return () => h('div', { class: 'ion-grid' }, slots.default && slots.default()); } });
const IonRow = defineComponent({ name: 'IonRow', setup(_, { slots }) { return () => h('div', { class: 'ion-row' }, slots.default && slots.default()); } });
const IonCol = defineComponent({
	name: 'IonCol',
	props: { size: { type: String, default: undefined } },
	setup(props, { slots }) 
	{
		const cls = ['ion-col'];
		if (props.size) cls.push(`ion-col-${props.size}`);
		return () => h('div', { class: cls }, slots.default && slots.default());
	}
});

// Form controls
const IonList = defineComponent({ name: 'IonList', setup(_, { slots }) { return () => h('div', { class: 'ion-list' }, slots.default && slots.default()); } });
const IonItem = defineComponent({ name: 'IonItem', setup(_, { slots }) { return () => h('div', { class: 'ion-item' }, slots.default && slots.default()); } });
const IonInput = defineComponent({
	name: 'IonInput',
	props: {
		modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
		type: { type: String as PropType<string>, default: 'text' },
		placeholder: { type: String as PropType<string>, default: '' },
	},
	emits: ['update:modelValue', 'ionBlur', 'ionInput'],
	setup(props, { emit, attrs }) 
	{
		const userClass = (attrs as any)?.class;
		const rest: any = { ...(attrs as any) };
		if ('class' in rest) delete rest.class;
		return () => h('input', {
			...rest,
			class: ['ion-input', userClass].filter(Boolean),
			type: props.type,
			placeholder: props.placeholder,
			value: props.modelValue as any,
			onInput: (e: any) => { emit('update:modelValue', e?.target?.value ?? ''); emit('ionInput', e); },
			onBlur: (e: any) => emit('ionBlur', e),
		});
	}
});

const IonTextarea = defineComponent({
	name: 'IonTextarea',
	props: { modelValue: { type: String, default: '' }, placeholder: { type: String, default: '' } },
	emits: ['update:modelValue'],
	setup(props, { emit, attrs }) 
	{
		const userClass = (attrs as any)?.class;
		const rest: any = { ...(attrs as any) };
		if ('class' in rest) delete rest.class;
		return () => h('textarea', {
			...rest,
			class: ['ion-textarea', userClass].filter(Boolean),
			placeholder: props.placeholder,
			value: props.modelValue,
			onInput: (e: any) => emit('update:modelValue', e?.target?.value ?? ''),
		});
	}
});

const IonSelect = defineComponent({
	name: 'IonSelect',
	props: { modelValue: { type: [String, Number, Boolean] as PropType<any>, default: undefined } },
	emits: ['update:modelValue'],
	setup(props, { emit, slots, attrs }) 
	{
		const userClass = (attrs as any)?.class;
		const rest: any = { ...(attrs as any) };
		if ('class' in rest) delete rest.class;
		return () => h('select', {
			...rest,
			class: ['ion-select', userClass].filter(Boolean),
			value: props.modelValue as any,
			onChange: (e: any) => emit('update:modelValue', e?.target?.value),
		}, slots.default && slots.default());
	}
});
const IonSelectOption = defineComponent({ name: 'IonSelectOption', props: { value: { type: [String, Number, Boolean, Object] as PropType<any>, default: undefined } }, setup(props, { slots }) { return () => h('option', { value: props.value }, slots.default && slots.default()); } });
const IonNote = defineComponent({ name: 'IonNote', setup(_, { slots }) { return () => h('small', { class: 'ion-note' }, slots.default && slots.default()); } });
const IonText = defineComponent({ name: 'IonText', setup(_, { slots }) { return () => h('span', { class: 'ion-text' }, slots.default && slots.default()); } });

// Buttons
const IonButton = defineComponent({
	name: 'IonButton',
	props: {
		href: { type: String as PropType<string | undefined>, default: undefined },
		routerLink: { type: [String, Object] as PropType<any>, default: undefined },
		routerDirection: { type: String as PropType<string | undefined>, default: undefined },
		fill: { type: String as PropType<'clear' | 'outline' | 'solid' | 'default' | undefined>, default: undefined },
		expand: { type: String as PropType<'block' | undefined>, default: undefined },
		size: { type: String as PropType<'small' | 'default' | undefined>, default: undefined },
		disabled: { type: Boolean, default: false },
		color: { type: String as PropType<string | undefined>, default: undefined },
	},
	setup(props, { slots })
	{
		const classes = () => [
			'ion-button',
			props.fill ? `ion-fill-${props.fill}` : '',
			props.expand ? `ion-expand-${props.expand}` : '',
			props.size ? `ion-size-${props.size}` : '',
			props.color ? `ion-color-${props.color}` : '',
		].filter(Boolean);
		return () =>
		{
			const content = slots.default && slots.default();
			// Prefer routerLink when provided
			if (props.routerLink)
			{
				return h(
					RouterLink as any,
					{ to: props.routerLink, custom: true },
					{
						default: ({ href, navigate }: any) => h(
							'a',
							{ class: classes(), href, 'aria-disabled': props.disabled || undefined, onClick: (e: MouseEvent) => { e.preventDefault(); if (!props.disabled) navigate(e); } },
							content
						)
					}
				);
			}
			if (props.href)
			{
				return h('a', { class: classes(), href: props.href, 'aria-disabled': props.disabled || undefined }, content);
			}
			return h('button', { class: classes(), disabled: props.disabled }, content);
		};
	}
});

// Simplified Icon placeholder; renders a span for layout consistency
const IonIcon = defineComponent({ name: 'IonIcon', props: { icon: { type: [String, Object] as PropType<any>, default: undefined } }, setup() { return () => h('span', { class: 'ion-icon' }); } });

// Spinner
const IonSpinner = defineComponent({ name: 'IonSpinner', props: { name: { type: String, default: 'crescent' } }, setup() { return () => h('span', { class: 'ion-spinner' }); } });

// Segments
const IonSegment = defineComponent({
	name: 'IonSegment',
	props: { value: { type: String, default: '' } },
	emits: ['ionChange'],
	setup(props, { slots, emit }) 
	{
		const onClick = (e: MouseEvent) => 
		{
			const target = (e.target as HTMLElement).closest('.ion-segment-button') as HTMLElement | null;
			if (target) 
			{
				const val = target.dataset.value || '';
				emit('ionChange', { detail: { value: val } });
			}
		};
		return () => h('div', { class: 'ion-segment', onClick }, slots.default && slots.default());
	}
});

const IonSegmentButton = defineComponent({
	name: 'IonSegmentButton',
	props: { value: { type: String, required: true } },
	setup(props, { slots }) 
	{
		return () => h('button', { class: 'ion-segment-button', 'data-value': props.value }, slots.default && slots.default());
	}
});

// Tabs
const IonTabs = defineComponent({ name: 'IonTabs', setup(_, { slots }) { return () => h('div', { class: 'ion-tabs' }, slots.default && slots.default()); } });
const IonTabBar = defineComponent({ name: 'IonTabBar', setup(_, { slots }) { return () => h('nav', { class: 'ion-tab-bar' }, slots.default && slots.default()); } });
const IonTabButton = defineComponent({
	name: 'IonTabButton',
	props: { tab: { type: String, default: '' }, href: { type: String, default: '#' } },
	setup(props, { slots })
	{
		return () => h(
			RouterLink as any,
			{ to: props.href, custom: true },
			{
				default: ({ href, navigate, isActive }: any) => h(
					'a',
					{
						class: ['ion-tab-button', isActive ? 'active' : ''],
						href,
						onClick: (e: MouseEvent) => { e.preventDefault(); navigate(e); }
					},
					slots.default ? slots.default() : []
				)
			}
		);
	}
});

// Controller stubs
export const toastController = {
	async create(options: { message: string; duration?: number; position?: string }) 
	{
		return {
			async present() 
			{
				if (import.meta.env.DEV) console.info('[toast]', options.message);
			}
		};
	}
};

export const modalController = {
	async create(/* options: { component: any; componentProps?: Record<string, any> } */) 
	{
		return {
			async present() { /* no-op in shim */ },
			dismiss() { /* no-op in shim */ },
		};
	},
	dismiss() { /* no-op in shim */ },
};

// Plugin to register kebab-case tags used in templates
export const IonicVue: Plugin = {
	install(app: App) 
	{
		const register = (name: string, comp: any) => app.component(name, comp);
		register('ion-app', IonApp);
		register('ion-router-outlet', IonRouterOutlet);
		register('ion-page', IonPage);
		register('ion-content', IonContent);
		register('ion-header', IonHeader);
		register('ion-toolbar', IonToolbar);
		register('ion-title', IonTitle);
		register('ion-buttons', IonButtons);

		register('ion-label', IonLabel);
		register('ion-card', IonCard);
		register('ion-card-header', IonCardHeader);
		register('ion-card-title', IonCardTitle);
		register('ion-card-content', IonCardContent);

		register('ion-grid', IonGrid);
		register('ion-row', IonRow);
		register('ion-col', IonCol);

		register('ion-item', IonItem);
		register('ion-list', IonList);
		register('ion-input', IonInput);
		register('ion-textarea', IonTextarea);
		register('ion-select', IonSelect);
		register('ion-select-option', IonSelectOption);
		register('ion-note', IonNote);
		register('ion-text', IonText);

		register('ion-button', IonButton);
		register('ion-icon', IonIcon);
		register('ion-spinner', IonSpinner);

		register('ion-segment', IonSegment);
		register('ion-segment-button', IonSegmentButton);

		register('ion-tabs', IonTabs);
		register('ion-tab-bar', IonTabBar);
		register('ion-tab-button', IonTabButton);
	}
};

export {
	IonApp, IonRouterOutlet, IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonGrid, IonRow, IonCol,
	IonItem, IonList, IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote, IonText, IonLabel,
	IonButton, IonIcon, IonSpinner,
	IonSegment, IonSegmentButton,
	IonTabs, IonTabBar, IonTabButton,
};
