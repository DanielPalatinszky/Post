﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Post
{
    public class CommunicationHandler
    {
        public const int BufferSize = 4096;

        private WebSocket webSocket;

        private CommunicationHandler(WebSocket webSocket)
        {
            this.webSocket = webSocket;
        }

        public static async Task RegisterWebSocket(WebSocket webSocket)
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            if (webSocket.State == WebSocketState.Open)
            {
                var incoming = await webSocket.ReceiveAsync(seg, CancellationToken.None);

                var message = MessageProcessor.ProcessMessage(Encoding.UTF8.GetString(buffer, 0, incoming.Count));

                if (message.Method == Method.Connection)
                {
                    var communicationHandler = new CommunicationHandler(webSocket);

                    var successful = ConnectionManager.Instance.RegisterConnection(communicationHandler, message.Source);
                    if (successful)
                    {
                        var response = new Message(Method.Approved, "", message.Source, "");

                        await communicationHandler.SendMessageAsync(response);

                        await RefreshClients();

                        await communicationHandler.ListenForMessages();
                    }
                }
            }
        }

        private async Task SendMessageAsync(Message message)
        {
            var jObject = new JObject();
            jObject.Add("method", message.Method.ToString());
            jObject.Add("source", message.Source);
            jObject.Add("target", message.Target);
            jObject.Add("body", message.Body);

            var buffer = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(jObject));
            var outgoing = new ArraySegment<byte>(buffer);

            await webSocket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task ListenForMessages()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            WebSocketReceiveResult incoming;

            do
            {
                incoming = await webSocket.ReceiveAsync(seg, CancellationToken.None);

                if (incoming.CloseStatus == WebSocketCloseStatus.EndpointUnavailable)
                {
                    ConnectionManager.Instance.RemoveConnection(this);
                    await RefreshClients();
                    break;
                }

                var message = MessageProcessor.ProcessMessage(Encoding.UTF8.GetString(buffer, 0, incoming.Count));

                await SendMessageAsync(message);
            } while (!incoming.CloseStatus.HasValue);
        }

        private static async Task RefreshClients()
        {
            foreach (var communicationHandler in ConnectionManager.Instance.CommunicationHandlers)
            {
                var current = ConnectionManager.Instance.SearchByHandler(communicationHandler);

                var clients = new StringBuilder();
                var clientList = ConnectionManager.Instance.Clients;

                foreach (var client in clientList)
                {
                    if (client == current) continue;

                    clients.Append(client + "\n");
                }

                if (clients.Length > 1)
                {
                    clients.Remove(clients.Length - 1, 1);
                }

                var refreshMessage = new Message(Method.Refresh, "", current, clients.ToString());

                await communicationHandler.SendMessageAsync(refreshMessage);
            }
        }
    }
}
