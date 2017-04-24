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
        private readonly ConcurrentDictionary<int , Tuple<CommunicationHandler, string>> connections;

        public IReadOnlyDictionary<int, Tuple<CommunicationHandler, string>> Clients => connections;

        public static readonly ConnectionManager Instance = new ConnectionManager();

        private ConnectionManager()
        {
            connections = new ConcurrentDictionary<int, Tuple<CommunicationHandler, string>>();
        }

        public int RegisterConnection(CommunicationHandler communicationHandler, string nickName)
        {
            var id = 0;
            while (true)
            {
                if (!connections.ContainsKey(id))
                {
                    break;
                }

                id++;
            }

            var successful = connections.TryAdd(id, new Tuple<CommunicationHandler, string>(communicationHandler, nickName));

            return successful ? id : -1;
        }

        public void RemoveConnection(CommunicationHandler communicationHandler)
        {
            var id = connections.Single(e => e.Value.Item1 == communicationHandler).Key;

            Tuple<CommunicationHandler, string> value;
            connections.TryRemove(id, out value);
        }

        public Tuple<CommunicationHandler, string> SearchById(int id)
        {
            return connections[id];
        }
    }
}