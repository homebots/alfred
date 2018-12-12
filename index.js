const http = require('http');
const FS = require('fs');
const Path = require('path');
const WebSocket = require('ws');
const config = require('./config.json');

const Server = require('./server/index.js').Server;

const server = new Server();
server.listen(config.httpPort);