import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';
import { DOCUMENT } from '@angular/platform-browser';

import { WebSocketService } from '../../services/websocket/app.websocket.service';
import { Message } from '../../models/message';

@Injectable()
export class MessageService {
    private server: Subject<Message>;

    constructor(private wsService: WebSocketService, @Inject(DOCUMENT) private document: Document) { this.init(); }

    init(): void {
        let wsPath = "ws" + this.document.baseURI.split("http")[1] + "ws";
        this.server = this.wsService.connect(wsPath);

        this.server.subscribe(message => this.messageReceived(message), error => this.errorReceived(error), () => this.completionReceived());
    }

    sendConnectionMessage(nickName: string): void {
        this.server.next({ method: "Connection", source: nickName, target: "", body: "" });
    }

    messageReceived(message: Message): void {
        console.log(message);
    }

    errorReceived(error: any): void {
        console.log(error);
    }

    completionReceived(): void {
        console.log("CONNECTION CLOSED");
    }
}