using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Post
{
    public enum Method { Connection, Approved, Refresh, Message, Unknown }

    public static class MessageProcessor
    {
        public static Message ProcessMessage(string message)
        {
            return Message.CreateMessage(JObject.Parse(message));
        }
    }

    public class Message
    {
        public Method Method { get; private set; }
        public string Source { get; private set; }
        public string Target { get; private set; }
        public string Body { get; private set; }

        public Message(Method method, string source, string target, string body)
        {
            Method = method;
            Source = source;
            Target = target;
            Body = body;
        }

        protected Message()
        {
            Method = Method.Unknown;
            Source = "";
            Target = "";
            Body = "";
        }

        public static Message CreateMessage(JObject jObject)
        {
            Method method;
            if (!Enum.TryParse(jObject["method"].ToString(), out method))
            {
                return new NullMessage();
            }

            var source = jObject["source"].ToString();
            var target = jObject["target"].ToString();
            var body = jObject["body"].ToString();

            return new Message(method, source, target, body);
        }
    }

    public class NullMessage : Message
    {
        public NullMessage() : base()
        {
        }
    }
}
