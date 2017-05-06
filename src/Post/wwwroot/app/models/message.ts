export interface Message {
    method: string;
    source: string;
    target: string;
    body: string;
}

export interface Line {
    name: string;
}

export interface MessageLine extends Line {
    body: string;
}

export interface FileLine extends Line {
    url: string;
    filename: string;
}