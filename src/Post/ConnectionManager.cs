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
        private int idCounter = 0;

        public IReadOnlyList<Tuple<CommunicationHandler, string>> Clients => connections.Values.ToList();

        public IReadOnlyList<int> Ids => connections.Keys.ToList();

        public static readonly ConnectionManager Instance = new ConnectionManager();

        private ConnectionManager()
        {
            connections = new ConcurrentDictionary<int, Tuple<CommunicationHandler, string>>();
        }

        public bool RegisterConnection(CommunicationHandler communicationHandler, string nickName)
        {
            return connections.TryAdd(idCounter++, new Tuple<CommunicationHandler, string>(communicationHandler, nickName));
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