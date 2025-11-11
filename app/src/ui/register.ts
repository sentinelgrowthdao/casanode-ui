import type { App } from 'vue';
import IonButton from './IonButton.vue';
import IonCardContent from './IonCardContent.vue';
import IonCardHeader from './IonCardHeader.vue';
import IonCardTitle from './IonCardTitle.vue';
import IonContent from './IonContent.vue';
import IonHeader from './IonHeader.vue';
import IonPage from './IonPage.vue';

export function registerUi(app: App) 
{
	app.component('ion-page', IonPage);
	app.component('ion-header', IonHeader);
	app.component('ion-content', IonContent);
	app.component('ion-button', IonButton);
	app.component('ion-card-header', IonCardHeader);
	app.component('ion-card-title', IonCardTitle);
	app.component('ion-card-content', IonCardContent);
}

export { IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage };
