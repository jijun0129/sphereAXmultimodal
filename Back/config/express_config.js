const express = require('express')
  , fileUpload = require('express-fileupload')
  , morgan = require('morgan')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , passport = require('passport')
  , APIroutesConfig = require('./routes_config')
  , http = require('http')
  , socketio = require('socket.io')
  , session = require('express-session')
  , cors = require('cors')
  , path = require('path');
const corsOptions = {
  origin: 'http://localhost:10111', // 클라이언트 주소로 변경
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = function () {
  var app = express()
    , server = http.createServer(app)
    , io = socketio(server, {
      'destroy buffer size': Infinity,
      pingTimeout: 600000,
      pingInterval: 300000,
      upgradeTimeout: 30000,
      cors: {
        origin: '*',  //소켓 통신 크로스도메인 허용
      }
    })
    , UserApiRoutes = express.Router();

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(compress());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(methodOverride());
  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: 'tmp/',
    createParentPath: true
  }));
  app.use(passport.initialize());
  app.use(express.static('./public'));


  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: "Internal server error" });
  });

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use((req, res, next) => {
    res.setTimeout(60000, function () {
      console.log('Request has timed out.');
      res.status(408).send('Request has timed out.');
    });
    next();
  });

  // Passport 세션 미들웨어 추가
  app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  app.use(passport.initialize());
  app.use(passport.session());



  UserApiRoutes.use(APIroutesConfig.userapi);
  require('../app/routes/user.api.routes')(app, UserApiRoutes);
  require('./socketio')(io);

  return server;

}
