
var Area = require('../models/area.js'),
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
		// Only for testing on my local laptop
		/*
		User.authenticate('j@p.dk', '1234', function(user) {
			res.send(user);
		});
		*/
		res.send(req.session && req.session.user);
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
		Trip.findById(req.params.id).populate('participants.user').populate('creator').exec( function(err, trip) {
			res.send(trip);
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
				console.log(trip);
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
	},

	/**
	 * API call for generating some random test data.
	 */
	testData: function(req, res) {
		var created = [],
			areas = Area.list(),
			names = ['Skovbrynet', 'Holte', 'Tisvilde', 'Roskilde', 'Møns Klint'],
			intensities = ['EASY', 'MEDIUM', 'HARD', 'PRO'],
			types = ['MTB', 'ROAD'],
			trip;

		Trip.remove({}, function() {});

		for (var i = 0; i < 10; i++) {
			var t = new Trip({
				where: randomItem(names),
				area: randomItem(areas, 'id'),
				when: new Date(2012, 10, 22, 10, 23, 00),
				type: randomItem(types),
				intensity: randomItem(intensities)
			});

			t.save(function(err) {
				if (err) {
					console.log(err);
				}
			});
		}

		res.send('OK');
		res.send([]);
	}
}
