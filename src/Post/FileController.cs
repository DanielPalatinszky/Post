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
        private static readonly ConcurrentDictionary<int, FileInfo> files = new ConcurrentDictionary<int, FileInfo>();

        [HttpPost]
        public async Task<IActionResult> FileUpload(int source, int target, IFormCollection collection)
        {
            int id = 0;
            while (files.ContainsKey(id))
            {
                id++;
            }

            var downloadPath = Path.Combine(Directory.GetCurrentDirectory(), @"tmp");

            var file = collection.Files[0];

            var fileExtension = file.FileName.Substring(file.FileName.LastIndexOf('.'));
            var url = id + fileExtension;

            var filePath = Path.Combine(downloadPath, url);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            using (var stream = file.OpenReadStream())
            {
                await stream.CopyToAsync(fileStream);
            }

            files.TryAdd(id, new FileInfo(filePath));

            var targetClient = ConnectionManager.Instance.SearchById(target);
            var message = new Message(Method.File, source.ToString(), target.ToString(), $"{url}:{file.FileName}");

            await targetClient.Item1.SendMessageAsync(message);

            return Accepted();
        }
    }
}
