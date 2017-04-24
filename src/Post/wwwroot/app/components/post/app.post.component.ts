import { Component, OnInit } from '@angular/core';

import { MessageService } from '../../services/message/app.message.service';

import { Client } from '../../models/client';
import { Message, MessageLine } from '../../models/message';

@Component({
    selector: "app-post",
    templateUrl: "app/components/post/app.post.component.html"
})
export class PostComponent implements OnInit {
    private clients: Client[];
    private selectedClient: Client;

    private me: Client;

    private messages: { [id: number]: MessageLine[] } = {};

    constructor(private messageService: MessageService) { }

    ngOnInit(): void {
        this.messageService.getClients().subscribe(clients => {
            this.clients = clients;
        });

        this.messageService.getMessages().subscribe(message => {
            this.messageReceived(message);
        });

        let id = +localStorage.getItem("id");
        let name = localStorage.getItem("nickname");

        this.me = { id: id, name: name };
    }

    sendMessage(message: string): void {
        if (!this.messages[this.selectedClient.id]) {
            this.messages[this.selectedClient.id] = [];
        }

        this.messages[this.selectedClient.id].push({ name: this.me.name, body: message });

        this.messageService.sendMessage(this.me.id.toString(), this.selectedClient.id.toString(), message);
    }

    messageReceived(message: Message): void {
        if (!this.messages[+message.source]) {
            this.messages[+message.source] = [];
        }

        let name = this.clients.find(client => client.id === +message.source).name;

        this.messages[+message.source].push({ name: name, body: message.body });
    }
}