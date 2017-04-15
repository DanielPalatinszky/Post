import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';

import { Message } from '../../models/message';

@Injectable()
export class WebSocketService {
    private socket: Subject<Message>;

    connect(url: string): Subject<Message> {
        if (!this.socket) {
            this.socket = this.create(url);
        }

        return this.socket;
    }

    private create(url: string): Subject<Message> {
        let ws = new WebSocket(url);

        let observable = Observable.create((obs: Observer<Message>) => {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);

            return ws.close.bind(ws);
        });

        let observer = {
            next: (data: Message) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            }
        }

        return Subject.create(observer, observable);
    }
}