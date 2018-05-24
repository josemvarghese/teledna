const Throttle = require('../models/throttle');
const boom = require('boom');
const log = require('../utils/logger');

module.exports = function(options) {
	return function(req, res, next) {
		var hitLimit;
		if (req.body.action == 'image') {
			options.type=parseInt(process.env.CHANGE_PROFILE_THROTTILE) ;
			hitLimit=parseInt(process.env.CHANGE_PROFILE_LIMIT);
		}
		else if (req.body.action == 'username') {
			options.type=parseInt(process.env.EDIT_USERNAME_THROTTILE) ;
			hitLimit=parseInt(process.env.EDIT_USERNAME_LIMIT);
		}
		else if (req.body.action == 'info') {
			options.type=parseInt(process.env.USER_UPDATE_INFO_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'lineup') {
			options.type=parseInt(process.env.POST_LINEUP_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'browse' || req.query.action == 'winner') {
			options.type=parseInt(process.env.POST_BROWSE_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'feed') {
			options.type=parseInt(process.env.USER_FEED_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'info') {
			options.type=parseInt(process.env.USER_INFO_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'stats') {
			options.type=parseInt(process.env.USER_STATS_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'vote') {
			options.type=parseInt(process.env.USER_VOTE_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if (req.query.action == 'boop') {
			options.type=parseInt(process.env.USER_BOOP_THROTTILE) ;
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		else if(options.type==process.env.POST_THROTTILE){
			hitLimit=parseInt(process.env.POST_LIMIT);
		}
		else if(options.type==process.env.FEEDBACK_THROTTILE){
			hitLimit=parseInt(process.env.FEEDBACK_LIMIT);
		}
		else if(options.type==process.env.RESET_PWD_THROTTILE){
			hitLimit=parseInt(process.env.RESET_PWD_LIMIT);
		}
		else if(options.type==process.env.REPORT_POST_THROTTILE){
			hitLimit=parseInt(process.env.REPORT_POST_LIMIT);
		}
		else if(options.type==process.env.SEND_VERIFICATION_THROTTILE){
			hitLimit=parseInt(process.env.SEND_VERIFICATION_LIMIT);
		}
		else if(parseInt(options.type)>7){
			hitLimit=parseInt(process.env.DEFAULT_LIMIT);
		}
		Throttle.find({apiType:options.type,userId:req.user._id},(err,info)=>{
			if(err){
				return next(boom.internal('Mongo error - rate limit',err));
			}
			else if(info.length>0){
				if(info[0].hits>=hitLimit){
					return next(boom.tooManyRequests('You have exceeded your request limit'));
				}
				else{
					info[0].hits=info[0].hits+1;
					info[0].save();
					next();
				} 
			}
			else{
				let saveInfo = new Throttle({
					userId:req.user._id,
					apiType:options.type,
					hits:1,
					createdAt:Date.now()
				});
				saveInfo.save((err,data)=>{
					if(err){
						return next(boom.internal('Mongo error - rate limit',err));
					}
					else{
						next();
					}
				});
			}
		});
	};
};