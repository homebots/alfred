const nodes = {
  WEB: 'web',
  BOT: 'bot',
  web: [],
  bot: [],

  nameStore: new Storage('./bot-names.json')
};

function serveFile(request, response) {
  const pwd = process.cwd();
  const filePath = Path.normalize(request.url.replace(/\.\./g, ''));
  const absPath = Path.join(pwd, 'web', filePath);

  if (FS.existsSync(absPath)) {
    FS.createReadStream(absPath).pipe(response);
    return true;
  }
}

function renameBot(request, response) {
  const botId = request.url.slice(5);
  const bot = nodes.bot.filter(x => x.id === botId)[0];
  let buffer = '';

  if (!bot) {
    response.writeHead(404);
    response.end('Not found');
  }

  request.on('data', (s) => buffer += s);
  request.on('end', () => {
    const name = buffer.slice(0, 32);
    bot.name = name;
    nodes.nameStore.setItem(botId, name);

    response.writeHead(204);
    response.end('Renamed');
  });
}

function relay(origin, connection) {
  return function (payload) {
    if (origin === nodes.BOT && String(payload).startsWith('bot::')) {
      const id = payload.slice(5).slice(0, 32);
      connection.id = id;

      if (nodes.nameStore.hasItem(id)) {
        connection.name = nodes.nameStore.getItem(id);
      }

      return;
    }

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
    connection.on('message', relay(type, connection));
  };
}

function toJSON(x) {
  return JSON.stringify(x, null, 2);
}

function getBotList(_, response) {
  const list = nodes.bot.map(x => {
    return {
      id: x.id,
      name: (x.name || '')
    };
  });

  response.writeHead(200);
  response.end(toJSON(list));
}

function getStatus(_, response) {
  const status = {
    bots: nodes.bot.length,
    clients: nodes.web.length
  };

  response.writeHead(200);
  response.end(toJSON(status));
}

function resetStats(_, response) {

}

const botSocket = new WebSocket.Server({
  server: httpServer,
  port: config.bot.port,
  path: config.bot.path
});

const webSocket = new WebSocket.Server({
  server: httpServer,
  port: config.web.port,
  path: config.web.path
});

botSocket.on('connection', handleConnection(nodes.BOT));
webSocket.on('connection', handleConnection(nodes.WEB));

httpServer.listen(config.httpPort);

console.log(`Http Server running at ${config.httpPort}`);
console.log(`Web Server running at ${config.web.port}`);
console.log(`Bot Server running at ${config.bot.port}`);