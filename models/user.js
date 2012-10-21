
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	util = require('util');

var userSchema = new Schema({
	email: { type: String },
	name: { 
		first: String, 
		last: String 
	},
	password_info: { 
		salt: String, 
		hash: String 
	},
	updatedAt: { type: Date, default: Date.now },
	createdAt: Date
});

userSchema.virtual('password').set(function(password) {
	this.password_info.salt = generateSalt();
	this.password_info.hash = encodePassword(password, this.password_info.salt);
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
 * Validation functions
 */

 var uniqueField = function( field ) {
 	return function(value, respond) {
 		if (value && value.length) {
			if (this.isNew) {
		 		mongoose.models.User.where(field, new RegExp('^'+value+'$', 'i')).count(function(err, n) {
		 			respond( n < 1 );
		 		});
		 	} else {
		 		respond( true );
		 	}
		} else {
			respond( false );
		}
 	};
 }

var emailFormat = function( val ){
	return (/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i).test( val )
}


/**
 * Apply validations
 */

userSchema.path('email').validate( uniqueField('email'), 'email-already-in-use');
userSchema.path('email').validate( emailFormat , 'email-wrong-format');

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
						success();
				} else {
					if (error) 
						error();
				}
			} else {
				if (error)
					error();
			}
		});
	}
}


var User = mongoose.model('User', userSchema);

module.exports = User;