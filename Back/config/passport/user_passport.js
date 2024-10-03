var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	mongoose = require('mongoose');

module.exports = function () {
	var UserInfo = mongoose.model('UserInfo');

	passport.use(new LocalStrategy({
		usernameField: 'ID',
		passwordField: 'PASSWORD'
	},
		function (username, password, done) {
			UserInfo.findOne({ ID: username }, function (err, user) {
				if (err) { return done(err); }
				if (!user) {
					return done(null, false, { message: 'Incorrect username.' });
				}
				if (!user.authenticate(password)) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			});
		}));


	passport.serializeUser(function (userinfo, done) {
		done(null, userinfo.id);
	});

	passport.deserializeUser(function (id, done) {
		UserInfo.findOne({ _id: id }, '-PASSWORD -salt', function (err, userinfo) {
			done(err, userinfo);
		});
	});

	require('./strategies/user.js')();
};
