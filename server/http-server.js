const httpServer = http.createServer(function(request, response) {
  const url = request.url;
  const method = request.method;

  if (url === '/') {
    FS.createReadStream('./web/index.html').pipe(response);
    return;
  }

  if (serveFile(request, response)) {
    return;
  }

  if (url === '/status') {
    getStatus(request, response);
    return;
  }

  if (url === '/reset') {
    resetStats(request, response);
    return;
  }

  if (url === '/bots') {
    getBotList(request, response);
    return;
  }

  if (url.startsWith('/bot/') && method === 'POST') {
    return renameBot(request, response);
  }

  response.writeHead(404);
  response.end('Not found');
});

class Server {
  constructor() {
    this.httpServer = http.createServer((request, response) => this.onRequest(request, response));
    this.routes = [];
  }

  onRequest(request, response) {
    const url = request.url;
    const method = request.method;

    if (serveFile(request, response)) {
      return;
    }

    const found = this.routes.find((route) => route.method === method && (route.url === url || route.matcher.test(url)));

    if (!found) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    found.route(request, response);
  }

  listen(port) {
    this.httpServer.listen(port);
  }

  on(method, matcher) {
    this.routes.push({
      method,
      matcher,
      url: typeof matcher === 'string' ? matcher : '',
    });
  }
}
