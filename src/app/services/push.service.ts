
import { Injectable,EventEmitter} from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private _storage: Storage | null = null;
  mensajes: OSNotificationPayload[] = [
    
      /* title: 'Titulo de la push',
      body: 'Este es el body de la push',
      date: new DataCue() */
    
  ];
  userId: string;
  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajes();
    this.init();
   }

   async getMensajes(){
     await this.cargarMensajes();
     return [...this.mensajes];
   }
   async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  configuracionInicial() {
    this.oneSignal.startInit('61e179a2-5e7a-4f36-b914-0c269917332e', '245472340585');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('Notificacion recibida', noti)
      this.notificacionRecibida(noti)
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log('Notificacion abierta', noti.notification);
      await this.notificacionRecibida(noti.notification);
    });
    //Obtener el Id del subscriptor
    this.oneSignal.getIds().then(info=> {
        this.userId = info.userId;
    });
    this.oneSignal.endInit();
  }
 async  notificacionRecibida(noti: OSNotification) {
   await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);
    if (existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);

    await this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes(){
    //this.storage.clear();
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }
  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes =[]; 
    this.guardarMensajes();
  }
}
