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
        private static async Task Acceptor(HttpContext httpContext, Func<Task> func)
        {
            if (!httpContext.WebSockets.IsWebSocketRequest)
            {
                return;
            }

            var webSocket = await httpContext.WebSockets.AcceptWebSocketAsync();

            await CommunicationHandler.RegisterWebSocket(webSocket);
        }

        public static void Map(IApplicationBuilder app)
        {
            app.UseWebSockets();
            app.Use(Acceptor);
        }
    }
}
