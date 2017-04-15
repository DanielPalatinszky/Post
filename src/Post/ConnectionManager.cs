using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Post
{
    public class ConnectionManager
    {
        private readonly ConcurrentDictionary<string, CommunicationHandler> connections;

        public static readonly ConnectionManager Instance = new ConnectionManager();

        private ConnectionManager()
        {
            connections = new ConcurrentDictionary<string, CommunicationHandler>();
        }

        public bool RegisterConnection(CommunicationHandler communicationHandler, string nickName)
        {
            return connections.TryAdd(nickName, communicationHandler);
        }
    }
}
