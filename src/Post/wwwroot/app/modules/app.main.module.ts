import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoaderComponent } from '../components/loader/app.loader.component';
import { ConnectComponent } from '../components/connect/app.connect.component';
import { PostComponent } from '../components/post/app.post.component';

import { WebSocketService } from '../services/websocket/app.websocket.service';
import { MessageService } from '../services/message/app.message.service';

@NgModule({
    imports: [BrowserModule, FormsModule, RouterModule.forRoot([
        { path: "", redirectTo: "/connect", pathMatch: "full" },
        { path: "connect", component: ConnectComponent },
        { path: "post", component: PostComponent }
    ])],
    declarations: [ LoaderComponent, ConnectComponent, PostComponent ],
    bootstrap: [ LoaderComponent ],
    providers: [ WebSocketService, MessageService ]
})
export class AppModule {
    
}