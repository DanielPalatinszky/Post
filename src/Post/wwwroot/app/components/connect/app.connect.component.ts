import { Component, OnInit } from '@angular/core';

import { WebSocketService } from "../../services/websocket/app.websocket.service";

@Component({
    selector: "post-app",
    templateUrl: "app/components/connect/app.connect.component.html"
})
export class ConnectComponent implements OnInit {
    constructor(private wsService: WebSocketService) { }

    ngOnInit(): void {
        this.wsService.connect("ws://localhost:5000/ws");
    }
}