const express = require('express')
  , fileUpload = require('express-fileupload')
  , morgan = require('morgan')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , cors = require('cors')
  , path = require('path');

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:10111'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

module.exports = function () {
  const app = express();
  const server = require('http').createServer(app);
  const io = require('socket.io')(server, {
    'destroy buffer size': Infinity,
    pingTimeout: 600000,
    pingInterval: 300000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8,
    cors: {
      origin: '*',
    }
  });

  app.use(cors(corsOptions));
  app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, '../uploads')));

  // 기본 미들웨어 설정
  app.use(compress());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(methodOverride());
  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: 'tmp/',
    createParentPath: true
  }));

  // 에러 처리 미들웨어
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: "Internal server error" });
  });

  // 로깅 미들웨어
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // 타임아웃 설정
  app.use((req, res, next) => {
    res.setTimeout(60000, function () {
      console.log('Request has timed out.');
      res.status(408).send('Request has timed out.');
    });
    next();
  });

  // API 라우트 설정
  const UserApiRoutes = express.Router();
  require('../app/routes/user.api.routes')(app, UserApiRoutes);
  require('./socketio')(io);

  return server;
};