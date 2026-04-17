const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Eh bah alors, on marche ou bien ?');
});

server.listen(process.env.PORT || 3000);