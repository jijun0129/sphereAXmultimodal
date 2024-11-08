

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const { Server } = require('socket.io');
var express = require('./config/express_config')
  , mongoose = require('./config/mongoose_config')
  , user_passport = require('./config/passport/user_passport');

mongoose();

var app = express()
  , user_passport = user_passport()
  , port = process.env.PORT || 10111;


global.socketSalt = '';
// global.socketCli = require('socket.io-client')('http://localhost:' + port, {secure: true, rejectUnauthorized: false})
global.socketCli = require('socket.io-client')('http://localhost:' + port)

app.on('request', (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Connected');
    next();
  }
});


app.listen(port, function (err) {
  if (!err) {
    console.log("server start");
    socketCli.on('connect', function (err) {
      if (err) {
        console.log("server open err");
      } else {
        console.log("Server running at http://localhost:" + port);
      }
    })
  } else {
    console.log("server open err");
  }
});



