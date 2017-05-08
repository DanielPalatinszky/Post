import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs/Rx';

import { Message } from '../../models/message';

/**
 * Service which handles websocket server connection.
 */
@Injectable()
export class WebSocketService {
    private socket: Subject<MessageEvent>;

    /**
     * Creates and returns with the RxJs server subject.
     * @param url
     */
    connect(url: string): Subject<MessageEvent> {
        if (!this.socket) {
            this.socket = this.create(url);
        }

        return this.socket;
    }

    /**
     * Creates an RxJs subject for websocket handling.
     * @param url
     */
    private create(url: string): Subject<MessageEvent> {
        let ws = new WebSocket(url);

        let observable = Observable.create((obs: Observer<MessageEvent>) => {
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