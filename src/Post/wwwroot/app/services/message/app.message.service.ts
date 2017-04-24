import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';
import { DOCUMENT } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { WebSocketService } from '../../services/websocket/app.websocket.service';
import { Message } from '../../models/message';
import { Client } from '../../models/client';

@Injectable()
export class MessageService {
    private server: Subject<Message>;

    private clients: Client[];

    private clientObserver: Observer<Client[]>;
    private clientObservable: Observable<Client[]>;

    private messageObserver: Observer<Message>;
    private messageObservable: Observable<Message>;

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

        this.clientObservable = new Observable(observer => {
            this.clientObserver = observer;
        });

        this.messageObservable = new Observable(observer => {
            this.messageObserver = observer;
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
            localStorage.setItem("id", message.target);

            this.router.navigate(["post"]);
        }
        else if (message.method === "Refresh") {
            this.loadClients(message);
        }
        else if (message.method === "Message") {
            this.messageObserver.next(message);
        }
    }

    private loadClients(message: Message): void {
        let clients = message.body.split("\n");

        this.clients = [];

        if (clients.length >= 1 && clients[0] !== "") {
            for (let client of clients) {
                let id = client.split(" ")[0];
                let name = client.split(" ")[1];

                this.clients.push({id: +id, name: name});
            }
        }

        this.clientObserver.next(this.clients);
    }

    public getClients(): Observable<Client[]> {
        return this.clientObservable;
    }

    public getMessages(): Observable<Message> {
        return this.messageObservable;
    }

    public sendMessage(source: string, target: string, message: string): void {
        this.server.next({ method: "Message", source: source, target: target, body: message });
    }
}