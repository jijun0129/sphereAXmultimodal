const userController = require('../../app/controllers/user.controller');
const { validateSignup } = require('../middlewares/validators');




module.exports = function (app, UserApiRoutes) {


  app.route('/master/1').post(userController.userLogs);
  app.route('/master/2').get(userController.userInfo);
  app.route('/signup').post(userController.signup);
  app.route('/signup').post(validateSignup, userController.signup);
  app.route('/login').post(userController.login);
  app.route('/logout').get(userController.logout);


};