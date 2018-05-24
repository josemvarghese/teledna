'use strict';
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;


const User = require('../models/user');
const Throttle = require('../models/throttle');


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
				if (err) { 
					updateThrottle(user,done);
					return done(err);
				}
				if (isMatch) {
					return done(null, user);
				}
				updateThrottle(user,done);
				return done(null, false, { msg: 'Unauthorized User.' });
			});
		}
		else{
			return done(null,false,{msg:'Please check your username or password' });

		}
	});
}));
function updateThrottle(user,callback) {
Throttle.find({userId:user._id},(err,throttleData)=>{
						if(err){
							console.log("error",err)
						}
						if(throttleData==null){
							let newThrottleData = new Throttle({
								userId:user._id,
								hits:1
							})
							newThrottleData.save((err,success)=>{
								if(!err){
									console.log("saved successfully")
								}
							})
						}
						else{
							if(throttleData.hits==3){
								return callback(null, false, { msg: 'Try after sometime' })
							}
							else{
								throttleData.hits++;
								throttleData.save();
							}
						}
						
					})
}


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
