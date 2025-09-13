// Export only needed pieces from the ionic shim
export { IonicVue, IonTabs, IonTabBar, IonTabButton, IonLabel, IonGrid, IonRow, IonCol, IonItem, IonList, IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote, IonText, IonSpinner, IonToolbar, IonTitle, IonButtons, IonCard, IonSegment, IonSegmentButton, toastController, modalController } from '../ionic-shim/index.ts';

// Export our UI replacements and registration helper
export { registerUi, IonPage, IonHeader, IonContent, IonButton, IonCardHeader, IonCardTitle, IonCardContent } from './register';
