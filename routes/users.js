var express = require('express');
var users = express.Router();
const User = require('../models/user');
const passport = require('passport');
const passportConfig = require('../config/passport');

/**
 * @api {get} /users/userslist  List of user
 * @apiName List users
 * @apiDescription To list all userslist
 * @apiGroup User
 * @apiSuccess {String} message  sucess message
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 201 OK
 *    {
 * {
 * "data": [
 * {
 * "_id": "5b05a4b88148bf2d3dd37a70",
 * "email": "jose1@mail.com",
 * "firstName": "jose",
 * "lastName": "varghese",
 * "__v": 0,
 * }
 * ]
 * }
 *    }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 404 Not found
 *    HTTP/1.1 401 Unauthorized 
 */
users.get('/userslist',passportConfig.isAuthenticated, function(req, res, next) {
	User.find({},{password:0},(err,data)=>{
		if(err){
			res.json({message:'something went wrong'});
		}
		else{
			res.json({data:data});
		}
	});
});
/**
 * @api {put} /users/updateuser  Update user
 * @apiName Update User
 * @apiDescription To update first name and lastname
 * @apiGroup User
 * @apiParam {String} firstName  firstName
 * @apiParam {String} lastName  lastName
 * @apiParamExample {json} Input
 *    {
 *      "firstName": "jose",
 *		"lastName":"varghese"
 *    }
 * @apiSuccess {String} message  sucess message
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 201 OK
 *    {
 * 		message:'updated successfully'
 *    }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 404 Not found
 *    HTTP/1.1 401 Unauthorized 
 */
users.put('/updateuser',passportConfig.isAuthenticated, function(req, res, next) {
	User.updateOne({_id:req.user._id},{$set:{firstName:req.body.firstName,lastName:req.body.lastName}},(err)=>{
		if(err){
			res.json({message:'something went wrong'});
		}
		else{
			res.json({message:'updated  successfully'});
		}
	});
});
/**
 * @api {post} /users/signup  signup user
 * @apiName Sign up
 * @apiDescription To signup
 * @apiGroup User
 * @apiParam {String} email  email
 * @apiParam {String} password  password
 * @apiParam {String} firstName  firstName
 * @apiParam {String} lastName  lastName
 * @apiParamExample {json} Input
 *    {
 *		"email":"jose@mail.com"	,
 *		"password":"sdfasdfasfd",	
 *      "firstName": "jose",
 *		"lastName":"varghese"
 *    }
 * @apiSuccess {String} message  sucess message
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 201 OK
 *    {
 * 		message:'signup successfully'
 *    }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 404 Not found
 *    HTTP/1.1 401 Unauthorized 
 */
users.post('/signup', function(req, res, next) {
	User.findOne({ email: req.body.email }, (err, existingUser) => {
		let newUser = new User({
			email:req.body.email,
			password:req.body.password,
			firstName:req.body.firstName,
			lastName:req.body.lastName,
		});
		if (err) {
			res.json({message:'something went wrong'});
		}
		if (existingUser) { 
			res.json({message:'user already exists'});
		}
		else{
			newUser.save((err) => {
				if (err) {
					res.json({message:'something went wrong'});
				}
				else{
					res.json({message:'signup successfully'});
				}
			});
		}

	});
});

/**
 * @api {post} /users/signin  signin user
 * @apiName Sign in
 * @apiDescription To signin
 * @apiGroup User
 * @apiParam {String} email  email
 * @apiParam {String} password  password
 * @apiParamExample {json} Input
 *    {
 *		"email":jose@mail.com"	
 *		"password":"sdfasdfasfd",	
 *    }
 * @apiSuccess {String} message  sucess message
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 201 OK
 *    {
 * 		message:'loggedIn successfully'
 *    }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 404 Not found
 *    HTTP/1.1 401 Unauthorized 
 */
users.post('/signin', function(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) { 
			res.json({message:'something went wrong'	});
		}
		else if (!user) {
			res.json({info:info});
		}
		else{
			req.logIn(user,(err) => {
				if (err) {
					res.json({message:err});
				}
				else{

					res.json({message:'loggedIn successfully',user:req.user});
				}
			});
		}
	})(req, res, next);
});
module.exports = users;
