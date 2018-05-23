'use strict';
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;


const User = require('../models/user');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});
/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { msg: `Email ${email} not found.` });
		}
		if(user.password){
			user.comparePassword(password, (err, isMatch) => {
				if (err) { return done(err); }
				if (isMatch) {
					console.log(user)
					return done(null, user);
				}
				return done(null, false, { msg: 'Unauthorized User.' });
			});
		}
		else{
			return done(null,false,{msg:'Please check your username or password' });

		}
	});
}));




/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	else {
		res.status(401).json({ message: 'Unauthorized user' });
	}
};
