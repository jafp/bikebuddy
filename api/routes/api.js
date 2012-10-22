
var Area = require('../models/area.js');
var User = require('../models/user.js');
var Trip = require('../models/trip.js');

var randomItem = function(list, key) {
	var idx = Math.floor(Math.random() * list.length);
	var i = list[idx];

	if (key) {
		return i[key];
	}

	return i;
}

exports.users = {
	create: function(req, res) {
		var user = new User(req.body);

		user.save(function(err, user) {
			res.send( !!err ? err : user );
		});
	}
}

exports.areas = {
	list: function(req, res) {
		res.send(Area.list());
	}
}

exports.trips = {
	create: function(req, res) {
		var trip = new Trip(req.body);

		trip.save(function(err, trip) {
			if (err) {
				res.send(err);
			} else {
				res.send(trip);
			}
		});
	},

	get: function(req, res) {
		Trip.findById(req.params.id, function(err, trip) {
			res.send(trip);
		});
	},

	list: function(req, res) {
		Trip.find().sort('when').exec(function(err, trips) {
			res.send(trips);
		});
	},

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
