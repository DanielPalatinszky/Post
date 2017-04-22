import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';
import { DOCUMENT } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { WebSocketService } from '../../services/websocket/app.websocket.service';
import { Message } from '../../models/message';

@Injectable()
export class MessageService {
    private server: Subject<Message>;

    private clients: string[];

    private observer: Observer<string[]>;
    private observable: Observable<string[]>;

    constructor(private wsService: WebSocketService, @Inject(DOCUMENT) private document: Document, private router: Router) { this.init(); }

    private init(): void {
        let wsPath = "ws" + this.document.baseURI.split("http")[1] + "ws";
        this.server = <Subject<Message>>this.wsService.connect(wsPath).map((response: MessageEvent): Message => {
            let data = JSON.parse(response.data);
            return {
                method: data.method,
                source: data.source,
                target: data.target,
                body: data.body
        }
        });

        this.server.subscribe(message => this.messageReceived(message), error => this.errorReceived(error), () => this.completionReceived());

        this.observable = new Observable(observer => {
            this.observer = observer;
        });
    }

    public sendConnectionMessage(nickName: string): void {
        this.server.next({ method: "Connection", source: nickName, target: "", body: "" });
    }

    private messageReceived(message: Message): void {
        this.processMessage(message);
    }

    private errorReceived(error: ErrorEvent): void {
        console.log(error);
    }

    private completionReceived(): void {
        console.log("CONNECTION CLOSED");
    }

    private processMessage(message: Message): void {
        if (message.method === "Approved") {
            this.router.navigate(["post"]);
        }
        else if (message.method === "Refresh") {
            this.loadClients(message);
        }
    }

    private loadClients(message: Message): void {
        let clients = message.body.split("\n");

        if (clients.length >= 1 && clients[0] !== "") {
            this.clients = clients;
        }

        this.observer.next(this.clients);
    }

    public getClients(): Observable<string[]> {
        return this.observable;
    }
}