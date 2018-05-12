'use strict';
/* jshint node: true */

const http = require('http');
const defaultPort = 97700;
const port = process.env.PORT || defaultPort;

const routes = [{
  match: '/pull',
  exec: gitPull
}];

const server = http.createServer(function(req, res) {

  const url = req.url;
  const valid = routes.some(function (route) {
    if (url === route.match || route.test(url)) {
      route.exec(req, res);
      return true;
    }
  });

  if (!valid) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{ "error": "Not found" }');
  }

});

function gitPull(req, res) {
  const spawn = require('child_process').execSync;

  try {
    spawn('git pull --rebase');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{ "result": "OK" }');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('{ "error": "" }');
  }

}

server.listen(port);
console.log('Listening on %d', port);

