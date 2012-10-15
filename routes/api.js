
var Trip = require('../models/trip.js');

var randomItem = function(list) {
	var idx = Math.floor(Math.random() * list.length);
	var i = list[idx];

	console.log(list.length, idx, i);

	return i;
}

exports.trips = {
	get: function(req, res) {
		Trip.findById(req.params.id, function(err, trip) {
			res.send(trip);
		});
	},

	list: function(req, res) {
		Trip.find(function(err, trips) {
			res.send(trips);
		});
	},

	addPseudo: function(req, res) {
		var created = [],
			names = ['Skovbrynet', 'Holte', 'Tisvilde', 'Roskilde', 'Møns Klint'],
			intensities = ['EASY', 'MEDIUM', 'HARD', 'PRO'],
			types = ['MTB', 'ROAD'],
			trip;

		Trip.remove({}, function() {});

		for (var i = 0; i < 10; i++) {
			var t = new Trip({
				where: randomItem(names),
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

		//var t = new Trip({ where: 'Skovbrynet', when: new Date(2012, 10, 22, 10, 30, 00, 00), type: 'ROAD', intensity: 'EASY' });
		//t.save(function(err) {
		//	if (err) {
		//			console.log("failed!");
		//	}
		//	res.send(t);
		//});

		res.send([]);
	}
}
