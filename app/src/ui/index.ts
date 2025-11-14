// Export only needed pieces from the ionic shim
export { IonicVue, IonTabs, IonTabBar, IonTabButton, IonLabel, IonItem, IonList, IonNote, IonText, IonSpinner, IonToolbar, IonTitle, IonButtons, IonCard, IonSegment, IonSegmentButton, toastController, modalController } from '../ionic-shim/index.ts';

// Export our UI replacements and registration helper
export { registerUi, IonPage, IonHeader, IonContent, IonButton, IonCardHeader, IonCardTitle, IonCardContent } from './register';

// Export custom grid and field components
export { default as AppGrid } from './AppGrid.vue';
export { default as AppGridRow } from './AppGridRow.vue';
export { default as AppGridCol } from './AppGridCol.vue';
export { default as UiInputField } from './UiInputField.vue';
