import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class FileManagerService {
    constructor(private http: Http) { }

    public sendFile(file: File, source: number, target: number) {
        let formData = new FormData();
        formData.append(file.name, file);

        this.http.post("/File/FileUpload/" + source + "/" + target, formData).subscribe();
    }
}