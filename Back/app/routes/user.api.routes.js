const userController = require('../controllers/user.controller');
const { validateSignup } = require('../middlewares/validators');
const searchController = require('../controllers/search.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const bookmarkController = require('../controllers/bookmark.controller')
module.exports = function (app) {
  // 회원 관리 라우트
  app.post('/signup', validateSignup, userController.signup);
  app.post('/login', userController.login);
  app.post('/logout', verifyToken, userController.logout);

  // 검색 라우트
  app.post('/search', verifyToken, searchController.search);

  // 북마크 라우트
  app.post('/bookmarks', verifyToken, bookmarkController.addBookmark);
  app.delete('/bookmarks/:id', verifyToken, bookmarkController.removeBookmark);
  app.get('/bookmarks', verifyToken, bookmarkController.getBookmarks);
  app.get('/bookmarks/:id', verifyToken, bookmarkController.getBookmark);

};