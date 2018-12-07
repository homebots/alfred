const http = require('http');
const FS = require('fs');
const Path = require('path');
const WebSocket = require('ws');
const config = require('./config.json');

const nodes = {
  WEB: 'web',
  BOT: 'bot',
  web: [],
  bot: []
};

const httpServer = http.createServer(function(request, response) {
  if (request.url === '/') {
    FS.createReadStream('./web/index.html').pipe(response);
    return;
  }

  const pwd = process.cwd();
  const filePath = Path.normalize(request.url.replace(/\.\./g, ''));
  const absPath = Path.join(pwd, 'web', filePath);

  if (FS.existsSync(absPath)) {
    FS.createReadStream(absPath).pipe(response);
    return;
  }

  if (request.url === '/status') {
    response.writeHead(200);
    response.end(getStatus());
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

const botSocket = new WebSocket.Server({
  httpServer,
  port: config.bot.port,
  path: config.bot.path
});

const webSocket = new WebSocket.Server({
  httpServer,
  port: config.web.port,
  path: config.web.path
});

function relay(origin) {
  return function (payload) {
    const target = origin === nodes.WEB ? nodes.bot : nodes.web;
    target.forEach(node => node.send(payload));
  }
}

function disconnect(type, node) {
  return function () {
    if (type === nodes.WEB) {
      nodes.web = nodes.web.filter(x => x !== node);
    } else {
      nodes.bot = nodes.bot.filter(x => x !== node);
    }
  }
}

function handleConnection(type) {
  return function (connection) {
    const target = type === nodes.WEB ? nodes.web : nodes.bot;
    target.push(connection);
    connection.on('close', disconnect(type, connection));
    connection.on('message', relay(type));
  };
}

function getStatus() {
  return `
  Bots (${nodes.bot.length})
  Web Clients (${nodes.web.length})`;
}

botSocket.on('connection', handleConnection(nodes.BOT));
webSocket.on('connection', handleConnection(nodes.WEB));

httpServer.listen(config.httpPort);

console.log(`Http Server running at ${config.httpPort}`);
console.log(`Web Server running at ${config.web.port}`);
console.log(`Bot Server running at ${config.bot.port}`);
