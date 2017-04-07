using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Post
{
    public class WebSocketHandler
    {
        public const int BufferSize = 4096;

        private WebSocket webSocket;

        private WebSocketHandler(WebSocket webSocket)
        {
            this.webSocket = webSocket;
        }

        private async Task EchoLoop()
        {
            var buffer = new byte[BufferSize];
            var seg = new ArraySegment<byte>(buffer);

            while (this.webSocket.State == WebSocketState.Open)
            {
                var incoming = await this.webSocket.ReceiveAsync(seg, CancellationToken.None);
                var outgoing = new ArraySegment<byte>(buffer, 0, incoming.Count);

                await this.webSocket.SendAsync(outgoing, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private static async Task Acceptor(HttpContext httpContext, Func<Task> func)
        {
            if (!httpContext.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var webSocket = await httpContext.WebSockets.AcceptWebSocketAsync();
            var webSocketHandler = new WebSocketHandler(webSocket);

            await webSocketHandler.EchoLoop();
        }

        public static void Map(IApplicationBuilder app)
        {
            app.UseWebSockets();
            app.Use(Acceptor);
        }
    }
}
