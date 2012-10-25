'use strict';

/* Controllers */

function AppCtrl($scope, $rootScope, $http, $location) {
	$http.get('/api/users/session').success(function(data) {
		$rootScope.user = data;
	});

	$http.get('/api/areas').success(function(data) {
		$rootScope.areas = data;
	});

	$scope.logout = function() {
		$http.delete('/api/users/session').success(function() {
			$rootScope.user = null;
			$location.path('/longrandomurl');
		});
	}
}
AppCtrl.$inject = ['$scope', '$rootScope', '$http', '$location'];

function IndexCtrl($rootScope, $scope, $location, $http, $flash) {
	$scope.filter = { area: '', type: '' };

	var load = function() {
		$http.get('/api/trips').success(function(data) {
			var i, len, t;
			// The trips are sorted server side on 'when' and '_id'.
			// TODO: Should we do it client side instead?

			// Set a flag on each trip if the current user are participating.
			if ($rootScope.user) {
				for (i = 0, len = data.length; i < len; i++) {
					t = data[i];

					if (_.find(t.participants, function(p) { return p._id === $rootScope.user._id; })) {
						t.participating = true;
					}
				}
			}	

			$scope.trips = $scope.filteredTrips = _.filter(data, listFilter);
		});
	}	

	load();

	/**
	 * Filter function to filter each item in the list
	 * of trips. Two conditions can be filtered on:
	 * Type  (mtb/road) and region/location.
	 */
	var listFilter = function(trip) {
		var filter = $scope.filter;

		if (filter.area) {
			if (!trip.area || trip.area !== filter.area) {
				return false;
			}
		}

		if (filter.type) {
			if (!trip.type || trip.type.toLowerCase() !== filter.type.toLowerCase()) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Filter the list of trips
	 */
	$scope.$watch('filter', function() {
		if ($scope.trips) {
			$scope.filteredTrips = _.filter($scope.trips, listFilter);
		}	
	}, true);
	
	/**
	 * Acknowledge that you participate in the given
	 * trip.
	 */
	$scope.join = function(trip) {
		if (!$scope.user) {
			$location.path('/ny-profil');
			$flash.put('reason', 'not-logged-in');
		} else {
			$http.post('/api/trips/' + trip._id + '/join', { user: $scope.user._id }).success(function(data) {
				if (data.error) {
					alert('Du kunne ikke tilmeldes turen :-(');
				} else {
					load();
				}
			});
		}
	}

	/**
	 * Leave the trip. 
	 */
	$scope.leave = function(trip) {
		$http.delete('/api/trips/' + trip._id + '/leave', { user: $scope.user._id }).success(function(data) {
			if (data.error) {
				alert('Du kunne ikke afmeldes turen :-(');
			} else {
				load();
			}
		});
	}

	/**
	 * Route to the given trip.
	 */
	$scope.showTrip = function(trip) {		
		$location.path('/tur/' + trip._id);
	}
}
IndexCtrl.$inject = ['$rootScope', '$scope', '$location', '$http', '$flash'];


function TripCtrl($scope, $routeParams, $http, $location) {
	if (!$routeParams.id) {
		$location.path('/');
	
	} else {
		$http.get('/api/trips/' + $routeParams.id)
			.success(function(data) {
				$scope.trip = data;
			}) 
			.error(function() {
				$location.path('/');
			});
	}
}
TripCtrl.$inject = ['$scope', '$routeParams', '$http', '$location'];


function TripFormCtrl($scope, $http) {

	var reset = function() {
		$scope.trip = { type: 'MTB', area: 'nordsjaelland-og-koebenhavn', time: '08:00' };
	}

	reset();

	$scope.submit = function() {
		var date, trip;

		if ($scope.trip._submit) {
			return;
		}
		$scope.trip._submit = true;

		trip = angular.copy($scope.trip);
		date = moment(trip.when + ' ' + trip.time, 'DD/MM/YYYY HH:mm');

		if (!date.isValid()) {
			// Fallback to this time plus one day
			// if the inputted date is invalid
			date = moment().add('days', 1).fromNow();
		}

		trip.when = (typeof date.toDate === 'function') ? date.toDate() : new Date();

		$http.put('/api/trips', trip).success(function(data, status) {
			$scope.trip._submit = false;

			if (data.errors) {
				$scope.trip._errors = data.errors;
			} else {
				reset();
				$scope.savedTrip = data;
				$scope.tripSaved = true;

				// AARG!! DOM STUFF!!!
				$('body').animate({
					scrollTop: 0
				}, 200);
			}
		});
	}
}
TripFormCtrl.$inject = ['$scope', '$http'];


function ProfileCtrl() {
}

function AboutCtrl() {
}

function UserFormCtrl($scope, $http, $flash) {
	$scope.user = {};
	$scope.reason = $flash.get('reason');

	$scope.submit = function() {
		var copy = angular.copy($scope.user);
		$http.put('/api/users', copy).success(function( data ) {
			if (data.errors) {
				$scope.user.errors = data.errors;
			} else {
				$scope.user.saved = true;
			}
		});
	};
}

function LoginCtrl($scope, $http, $location, $rootScope) {
	$scope.user = {};

	$scope.submit = function() {
		$http.post('/api/users/session', $scope.user).success(function( data ) {
			if (data.invalidCredentials) {
				
			} else {
				$rootScope.user = data.user;
				$location.path('/');
			}
		});
	}
}



