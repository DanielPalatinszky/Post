import { Component } from '@angular/core';

import { MessageService } from '../../services/message/app.message.service';

@Component({
    selector: "app-connect",
    templateUrl: "app/components/connect/app.connect.component.html"
})
export class ConnectComponent {
    private nickName = "";

    constructor(private messageService: MessageService) { }

    sendConnectionRequest(): void {
        this.messageService.sendConnectionMessage(this.nickName);
    }
}