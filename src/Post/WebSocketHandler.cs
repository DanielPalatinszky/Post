using System;
using System.Collections.Concurrent;
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
        private static readonly ConcurrentDictionary<string, WebSocket> connections = new ConcurrentDictionary<string, WebSocket>();

        private WebSocket webSocket;

        private WebSocketHandler(WebSocket webSocket)
        {
            this.webSocket = webSocket;
        }

        private static async Task Acceptor(HttpContext httpContext, Func<Task> func)
        {
            if (!httpContext.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var webSocket = await httpContext.WebSockets.AcceptWebSocketAsync();
            /*var webSocketHandler = new WebSocketHandler(webSocket);

            await webSocketHandler.Echo(httpContext, webSocket);*/

            await CommunicationHandler.RegisterWebSocket(webSocket);
        }

        public static void Map(IApplicationBuilder app)
        {
            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120)
            };

            app.UseWebSockets(webSocketOptions);
            app.Use(Acceptor);
        }

        private async Task Echo(HttpContext context, WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            while (!result.CloseStatus.HasValue)
            {
                await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }
            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
