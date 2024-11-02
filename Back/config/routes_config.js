const { verifyToken } = require('../app/middlewares/auth.middleware');

exports.userapi = function (req, res, next) {
    // verifyToken 미들웨어로 대체
    verifyToken(req, res, next);
};