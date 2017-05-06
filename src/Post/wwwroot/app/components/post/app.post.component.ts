import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Observable } from 'rxjs/Rx';

import { MessageService } from '../../services/message/app.message.service';
import { FileManagerService } from '../../services/filemanager/app.filemanager.service';

import { Client } from '../../models/client';
import { Message, Line, MessageLine, FileLine } from '../../models/message';

@Component({
    selector: "app-post",
    templateUrl: "app/components/post/app.post.component.html",
    styleUrls: ["app/components/post/simple-sidebar.css", "app/components/post/app.post.component.css"]
})
export class PostComponent implements OnInit {
    private clients: Client[];
    private selectedClient: Client;

    private me: Client;

    private messages: { [id: number]: Line[] } = {};

    private menuToggled = false;

    @ViewChild("messengerInput") messengerInput: ElementRef;

    constructor(private messageService: MessageService, private fileManager: FileManagerService, @Inject(DOCUMENT) private document: Document) { }

    ngOnInit(): void {
        this.messageService.getClients().subscribe(clients => {
            this.clients = clients;
        });

        this.messageService.getMessages().subscribe(message => {
            this.messageReceived(message);
        });

        let id = +localStorage.getItem("id");
        let name = localStorage.getItem("nickname");

        this.me = { id: id, name: name, messageReceived: false };
    }

    private sendMessage(message: string): void {
        if (this.selectedClientDisconnected()) {
            return;
        }

        if (!this.messages[this.selectedClient.id]) {
            this.messages[this.selectedClient.id] = [];
        }

        this.messages[this.selectedClient.id].push(<MessageLine>{ name: this.me.name, body: message });
        this.messengerInput.nativeElement.value = "";

        this.messageService.sendMessage(this.me.id.toString(), this.selectedClient.id.toString(), message);
    }

    private sendFile(file: File): void {
        if (this.selectedClientDisconnected()) {
            return;
        }

        if (!this.messages[this.selectedClient.id]) {
            this.messages[this.selectedClient.id] = [];
        }

        this.messages[this.selectedClient.id].push(<MessageLine>{ name: this.me.name, body: file.name });

        this.fileManager.sendFile(file, this.me.id, this.selectedClient.id);
    }

    private messageReceived(message: Message): void {
        let targetClient = this.clients.find(client => client.id === +message.source);
        if (targetClient !== this.selectedClient) {
            targetClient.messageReceived = true;
        }

        if (!this.messages[+message.source]) {
            this.messages[+message.source] = [];
        }

        if (message.method === "Message") {
            this.postMessage(message);
        } else {
            this.postFile(message);
        }
    }

    private postMessage(message: Message): void {
        let name = this.clients.find(client => client.id === +message.source).name;

        this.messages[+message.source].push(<MessageLine>{ name: name, body: message.body });
    }

    private postFile(message: Message): void {
        let name = this.clients.find(client => client.id === +message.source).name;

        let url = message.body.split(":")[0];
        let fileName = message.body.split(":")[1];

        this.messages[+message.source].push(<FileLine>{ name: name, url: "Files/" + url, filename: fileName });
    }

    private clientSelected(client: Client): void {
        if (this.selectedClientDisconnected()) {
            this.messages[this.selectedClient.id] = undefined;
        }

        this.selectedClient = client;
        this.selectedClient.messageReceived = false;
    }

    private selectedClientDisconnected(): boolean {
        if (this.clients.filter(client => client === this.selectedClient) === undefined) {
            return true;
        }

        return false;
    }

    private toggleMenu(): void {
        this.menuToggled = !this.menuToggled;
    }

    private scroll(): void {
        document.body.scrollTop = document.body.scrollHeight;
    }
}