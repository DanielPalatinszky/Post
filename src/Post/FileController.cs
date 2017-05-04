using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.Kestrel;

namespace Post
{
    public class FileController : Controller
    {
        private static readonly ConcurrentDictionary<int, Tuple<byte[], string, string>> files = new ConcurrentDictionary<int, Tuple<byte[], string, string>>();

        [HttpPost]
        public async Task<IActionResult> FileUpload(int source, int target, IFormCollection collection)
        {
            byte[] data;

            var file = collection.Files[0];
            using (var memoryStream = new MemoryStream())
            using (var stream = file.OpenReadStream())
            {
                await stream.CopyToAsync(memoryStream);

                data = memoryStream.ToArray();
            }

            int id = 0;
            while (files.ContainsKey(id))
            {
                id++;
            }

            files.TryAdd(id, new Tuple<byte[], string, string>(data, file.ContentType, file.FileName));

            var targetClient = ConnectionManager.Instance.SearchById(target);
            var message = new Message(Method.File, source.ToString(), target.ToString(), id.ToString());

            await targetClient.Item1.SendMessageAsync(message);

            return Accepted();
        }

        [HttpGet]
        public IActionResult FileDownload(int fileId)
        {
            Tuple<byte[], string, string> file = null;
            files.TryRemove(fileId, out file);

            return File(file.Item1, file.Item2, file.Item3);
        }
    }
}
