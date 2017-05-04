import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs/Rx';

import { MessageService } from '../../services/message/app.message.service';
import { FileManagerService } from '../../services/filemanager/app.filemanager.service';

import { Client } from '../../models/client';
import { Message, MessageLine, FileLine } from '../../models/message';

@Component({
    selector: "app-post",
    templateUrl: "app/components/post/app.post.component.html",
    styleUrls: ["app/components/post/simple-sidebar.css"]
})
export class PostComponent implements OnInit {
    private clients: Client[];
    private selectedClient: Client;

    private me: Client;

    private messages: { [id: number]: MessageLine[] } = {};
    private files: { [id: number]: FileLine[] } = {};

    private menuToggled = false;

    constructor(private messageService: MessageService, private fileManager: FileManagerService, private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.messageService.getClients().subscribe(clients => {
            this.clients = clients;

            if (this.clients.find(client => client === this.selectedClient) === undefined && this.selectedClient) {
                this.messages[this.selectedClient.id] = undefined;
                this.selectedClient = undefined;
            }
        });

        this.messageService.getMessages().subscribe(message => {
            this.messageReceived(message);
        });

        let id = +localStorage.getItem("id");
        let name = localStorage.getItem("nickname");

        this.me = { id: id, name: name, messageReceived: false };
    }

    private sendMessage(message: string): void {
        if (!this.messages[this.selectedClient.id]) {
            this.messages[this.selectedClient.id] = [];
        }

        this.messages[this.selectedClient.id].push({ name: this.me.name, body: message });

        this.messageService.sendMessage(this.me.id.toString(), this.selectedClient.id.toString(), message);
    }

    private sendFile(file: File): void {
        if (!this.messages[this.selectedClient.id]) {
            this.messages[this.selectedClient.id] = [];
        }

        this.messages[this.selectedClient.id].push({ name: this.me.name, body: file.name });

        this.fileManager.sendFile(file, this.me.id, this.selectedClient.id);
    }

    private messageReceived(message: Message): void {
        let targetClient = this.clients.find(client => client.id === +message.source);
        if (targetClient !== this.selectedClient) {
            targetClient.messageReceived = true;
        }

        if (message.method === "Message") {
            this.postMessage(message);
        } else {
            this.postFile(message);
        }
    }

    private postMessage(message: Message): void {
        if (!this.messages[+message.source]) {
            this.messages[+message.source] = [];
        }

        let name = this.clients.find(client => client.id === +message.source).name;

        this.messages[+message.source].push({ name: name, body: message.body });
    }

    private postFile(message: Message): void {
        this.fileManager.downloadFile(+message.body).subscribe(response => {
            if (!this.files[+message.source]) {
                this.files[+message.source] = [];
            }

            let name = this.clients.find(client => client.id === +message.source).name;

            let bytes: string[] = [];
            let text = response.text();
            for (let i = 0; i < text.length; i++) {
                bytes.push(text.charAt(i));
            }
            let data = new Blob([bytes], { type: response.headers.get("content-type") });
            let fileURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data));

            this.files[+message.source].push({ name: name, url: <any>fileURL, filename: response.headers.get("content-disposition") });
        });
    }

    private clientSelected(client: Client): void {
        this.selectedClient = client;
        this.selectedClient.messageReceived = false;
    }

    private toggleMenu(): void {
        this.menuToggled = !this.menuToggled;
    }
}