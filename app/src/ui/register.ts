import type { App } from 'vue';
import IonPage from './IonPage.vue';
import IonHeader from './IonHeader.vue';
import IonContent from './IonContent.vue';
import IonButton from './IonButton.vue';
import IonCardHeader from './IonCardHeader.vue';
import IonCardTitle from './IonCardTitle.vue';
import IonCardContent from './IonCardContent.vue';

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

export { IonPage, IonHeader, IonContent, IonButton, IonCardHeader, IonCardTitle, IonCardContent };
