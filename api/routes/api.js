
var fs = require('fs'),
	gm = require('gm'),
	Area = require('../models/area.js'),
	User = require('../models/user.js'),
	Trip = require('../models/trip.js'),
	util = require('util');

var randomItem = function(list, key) {
	var idx = Math.floor(Math.random() * list.length);
	var i = list[idx];

	if (key) {
		return i[key];
	}

	return i;
}

exports.users = {
	get: function(req, res) {
		User.find().exec(function(err, trips) {
			res.send(trips);
		});
	},
	trips: function(req, res) {
		var userId = req.session.user._id;

		Trip.find({ 'participants.user': userId, 'when': { $gt: Date.now() } }, function(err, trips) {
			if (err) {
				res.send({ error: err });
			} else {
				res.send({ trips: trips });
			}
		});
	},
	previousTrips: function(req, res) {
		var userId = req.session.user._id;

		Trip.find({ 'participants.user': userId, 'when': { $lt: Date.now() } }, function(err, trips) {
			if (err) {
				res.send({ error: err });
			} else {
				res.send({ trips: trips });
			}
		});
	},
	create: function(req, res) {
		var errors;

		req.assert('name', 'required').notEmpty();
		req.assert('email', 'invalid-email').isEmail();
		req.assert('email', 'required').notEmpty();
		req.assert('password', 'required').notEmpty();
		req.assert('password_confirmation', 'password-not-confirmed').equals(req.body.password);

		User.findOne({email: req.body.email}, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				if (user) {
					req.assert('email').error('email-already-in-use');
				}

				errors = req.validationErrors();
				if (errors) {
					res.send({ errors: errors });

				} else {
					var user = new User(req.body);
					user.save(function(err) {
						if (err) {
							res.send(err);
						} else {
							req.session.user = user;
							res.send(user);
						}
					});
				}
			}
		});
	},
	login: function(req, res) {
		User.authenticate(req.body.email, req.body.password, function(user) {
			req.session.user = user;

			res.send({ user: user });
		}, function(error) {
			res.send({ invalidCredentials: true });
		});
	},
	logout: function(req, res) {
		delete req.session.user;
		res.send({ loggedOut: true });
	},
	currentUser: function(req, res) {
		res.send(req.session && req.session.user);
	},
	/**
	 * Action for uploading profile pictures.
	 * The original picture is upload together with a thumbnail of size 60x60 px.
	 */
	picture: function(req, res) {
		var image = req.files.image,
			acceptedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
			dirPath = __dirname + '/../../app/users/' + req.session.user._id + '/',
			filename, original, thumb,
			extension,
			i;

		var urlForImage = function(image) {
			return '/static/users/' + req.session.user._id + '/' + image;
		}

		if (acceptedTypes.indexOf(image.type) !== -1) {
			if (image.size > 4000000) {
				res.send({ error: 'too-big' });
			} else {
				// The path
				
				i = image.name.lastIndexOf('.');
				extension = image.name.substring(i);

				original = dirPath + 'original' + extension;
				thumb = dirPath + 'thumb' + extension;

				if (!fs.existsSync(dirPath)) {
					fs.mkdirSync(dirPath);
				}

				// Move from temp. dir
				fs.renameSync(image.path, original);

				// Generate thumbnail
				gm(original).thumb(60, 60, thumb, 100, function(err, stdout, stderr, command) {
					if (err) {
						res.send({ error: 'thumb' });
					} else {

						// Save the image in the users profile
						User.findById(req.session.user._id, function(err, user) {
							if (err) {
								res.send({error: 'load-user'});
							} else {

								user.imageUrl = urlForImage('original' + extension);
								user.imageThumbUrl = urlForImage('thumb' + extension);

								user.save(function(err, user) {
									if (err) {
										res.send({ error: 'user-save', msg: err });
									} else {
										// Update session user
										req.session.user = user;
										res.send({ user: user });
									}
								});
							}
						});
					}
				});

			}
		} else {
			res.send({ error: 'wrong-format'});
		}
	}
}


exports.areas = {
	list: function(req, res) {
		res.send(Area.list());
	}
}

exports.trips = {
	create: function(req, res) {
		var errors;

		req.check('trip.city', 'required').notEmpty();
		req.check('trip.where', 'required').notEmpty();
		req.check('trip.when', 'required').notEmpty();
		req.check('trip.description', 'required').notEmpty();
		errors = req.validationErrors();

		if (errors) {
			res.send({ errors: errors });

		} else {

			var trip = new Trip(req.body.trip);

			trip.creator = req.session.user._id;
			trip.participants.push({ user: req.session.user._id });

			trip.save(function(err, trip) {
				if (err) {
					res.send(err);
				} else {
					res.send(trip);
				}
			});

		}
	},

	get: function(req, res) {
		Trip.findById(req.params.id)
			.populate('participants.user')
			.populate('creator')
			.populate('comments.author')
			.exec( function(err, trip) {
			res.send({ trip: trip });
		});
	},

	comment: function(req, res) {
		var id = req.param('id'),
			comment = req.body.comment;

		Trip.findById(id, function(err, trip) {
			if (err) {
				res.send({ error: true});
			} else {

				comment.author = req.session.user._id;
				trip.comments.push(comment);

				trip.save(function(err, trip) {
					if (err) {
						res.send({ error: true });
					} else {
						res.send({trip: trip});
					}
				});
			}
		});
	},

	list: function(req, res) {
		var query = Trip.find(),
			limit = req.param('limit'),
			sort = req.param('sort') || 'when';

		if (limit) {
			query.limit(limit);
		}

		if (sort) {
			query.sort(sort);
		}

		query.where('when').gt(Date.now());

		query.sort('_id').populate('participants.user').populate('creator').exec(function(err, trips) {
			res.send({ trips: trips });
		});
	},

	join: function(req, res) {
		Trip.findById(req.params.id, function(err, trip) {
			if (err) {
				res.send({error: 'trip-not-found'});
			} else {
				User.findById(req.body.user, function(err, user) {
					if (err) {
						res.send({error: 'user-not-found'});
					} else {
						trip.participants.push({ user: user._id });
						trip.save(function(err, trip) {
							res.send(trip);
						});
					}
				});
			}
		});
	},

	leave: function(req, res) {
		var idx;

		Trip.findById(req.params.id).exec(function(err, trip) {
			if (err) {
				res.send({error: 'trip-not-found'});
			} else {
				trip.participants.forEach( function(participant, index) {
					if (participant.user == req.body.user) {
						idx = index;
					}
				});

				if (idx) {
					trip.participants.splice(idx, 1);
				}

				trip.save(function(err, trip) {
					res.send(trip);
				});
			}
		});
	}
}
