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
				}
				if (isMatch) {
					return done(null, user);
				}
				updateThrottle(user,done);
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
			console.log('error',err);
		}
		if(throttleData.length==0){
			let newThrottleData = new Throttle({
				userId:user._id,
				hits:1
			});
			newThrottleData.save((err)=>{
				if(!err){
					console.log('saved successfully');
					callback('err');
				}
			});
		}
		else{
			console.log(throttleData[0]);
			if(throttleData[0].hits==3){
				callback(null, false, { msg: 'try after some time.' });
			}
			else{
				Throttle.updateOne({_id:throttleData[0]._id},{$inc:{hits:1}},(err)=>{
					if(err){
						console.log('err');
					}
					else{
						console.log('success');
						callback('err');

					}
				});
			}
							
		}
						
	});
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
