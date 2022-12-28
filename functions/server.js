const http = require('http');
const app = require('./app');
console.log("Danillo",process.env.PORT);
const port = process.env.PORT || 7000;
const server = http.createServer(app);
server.listen(port);
