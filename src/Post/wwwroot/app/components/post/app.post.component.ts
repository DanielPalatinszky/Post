import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message/app.message.service';

@Component({
    selector: "app-post",
    templateUrl: "app/components/post/app.post.component.html"
})
export class PostComponent implements OnInit {
    private clients: string[];
    private selectedClient: string;

    constructor(private messageService: MessageService) { }

    ngOnInit(): void {
        this.messageService.getClients().subscribe(clients => {
            this.clients = clients;
        });
    }

    sendMessage(message: string): void {
        console.log(message);
    }
}