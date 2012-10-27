
var mongoose = require('mongoose'),
	mongooseValidator = require('mongoose-validator'),
	validator = mongooseValidator.validator,
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	util = require('util');

var userSchema = new Schema({
	email: { type: String, required: true },
	name: { type: String, required: true },
	password_info: { 
		salt: String, 
		hash: String 
	},
	updatedAt: { type: Date, default: Date.now },
	createdAt: Date,
	club: String
});

userSchema.virtual('password').set(function(password) {
	this.password_info.salt = generateSalt();
	this.password_info.hash = encodePassword(password, this.password_info.salt);
});

userSchema.pre('save', function(next) {
	if (!this.createdAt) {
		this.createdAt = Date.now();
	}
	next();
});

/**
 * Utility functions
 */
var makeHash = function(str) {
	var hash = crypto.createHash('sha256');
	hash.update(str);
	return hash.digest('base64');
}

var generateSalt = function() {
	return makeHash(crypto.randomBytes(20));
}

var encodePassword = function( pass, salt ) {
	return makeHash(pass + salt);
}

/**
 * Class functions
 */
userSchema.statics.authenticate = function(email, password, success, error) {
	if (email && password) {
		mongoose.models.User.findOne({ 'email': email }, function(err, user) {
			if (user) {
				var guess = encodePassword(password, user.password_info.salt);
				if (guess === user.password_info.hash) {
					if (success) 
						success(user);
				} else {
					error();
				}
			} else {
				error();
			}
		});
	} else {
		error();
	}
}


var User = mongoose.model('User', userSchema);

module.exports = User;