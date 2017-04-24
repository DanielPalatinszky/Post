export interface Message {
    method: string;
    source: string;
    target: string;
    body: string;
}

export interface MessageLine {
    name: string;
    body: string;
}