const http = require('http');
const FS = require('fs');
const Path = require('path');
const httpPort = process.env.HTTP_PORT || 2000;

const httpServer = http.createServer(function(request, response) {
  const url = request.url;

  if (url === '/') {
    FS.createReadStream('./web/index.html').pipe(response);
    return;
  }

  if (serveFile(request, response)) {
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

function serveFile(request, response) {
  const pwd = process.cwd();
  const filePath = Path.normalize(request.url.replace(/\.\./g, ''));
  const searchFolders = ['web', 'node_modules'];

  const absPath = searchFolders.map((p) => Path.join(pwd, p, filePath))
    .find((path) => FS.existsSync(path));

  if (absPath) {
    FS.createReadStream(absPath).pipe(response);
    return true;
  }
}

httpServer.listen(httpPort);
