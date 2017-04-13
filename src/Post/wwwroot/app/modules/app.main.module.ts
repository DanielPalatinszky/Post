import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ConnectComponent } from '../components/connect/app.connect.component';
import { WebSocketService } from '../services/websocket/app.websocket.service';

@NgModule({
    imports: [ BrowserModule ],
    declarations: [ ConnectComponent ],
    bootstrap: [ ConnectComponent ],
    providers: [ WebSocketService ]
})
export class AppModule {
    
}