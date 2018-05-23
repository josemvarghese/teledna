var express = require('express');
var users = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const passport = require('passport');
const passportConfig = require('../config/passport');

/* GET users listing. */
users.get('/userslist',passportConfig.isAuthenticated, function(req, res, next) {
 User.find({},(err,data)=>{
 	if(err){
 		res.json({message:"something went wrong"});
 	}
 	else{
		res.json({data:data});
 	}
 })
});


users.post('/signup', function(req, res, next) {
  User.findOne({ email: req.body.email }, (err, existingUser) => {
  		let newUser = new User({
			email:req.body.email,
			password:req.body.password,
			Name:req.body.name
		})
		if (err) {
			res.json({message:"something went wrong"});
		}
		if (existingUser) { 
			res.json({message:"user already exists"});
		}
		else{
			newUser.save((err) => {
				if (err) {
					res.json({message:"something went wrong"});
				}
				else{
					res.json({message:"signup successfully"});
				}
			});
		}

	});
});

users.post('/signin', function(req, res, next) {
  	passport.authenticate('local', (err, user, info) => {
		if (err) { 
			res.json({message:"something went wrong"});
		}
		if (!user) {
			res.json({message:"something went wrong"});
		}
		req.logIn(user, (err) => {
			if (err) {
			res.json({message:"something went wrong"});
			}
			else{

				res.json({message:"loggedIn successfully",user:req.user});
			}

		});
	})(req, res, next);
});
module.exports = users;
