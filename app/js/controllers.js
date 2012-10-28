'use strict';

/**
 *
 * Base controller with functions for joining and leaving trips.
 *
 */
function BaseCtrl($scope, $rootScope, $http, $location, $flash) {
	//var $http = $injector.get('$http'),
	//	$rootScope = $injector.get('');

	$scope.loadAll = function(params) {
		$http.get('/api/trips', { params: params || {} }).success(function(data) {
			var i, len, t, p, user;

			user = $rootScope.user;

			// Set a flag on each trip if the current user are participating.
			if (user) {
				for (i = 0, len = data.trips.length; i < len; i++) {
					t = data.trips[i];

					p = _.find(t.participants, function(p) {
						return p.user._id === user._id;
					});

					t.participating = !!p;
				}
			}	

			$scope.trips = data.trips;
		});
	}	

	/**
	 * Filter function to filter each item in the list
	 * of trips. Two conditions can be filtered on:
	 * Type  (mtb/road) and region/location.
	 */
	$scope.listFilter = function(trip) {
		var filter = $scope.filter;

		if (filter) {
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
		}

		return true;
	}

	/**
	 * Acknowledge that you participate in the given
	 * trip.
	 */
	$scope.join = function(trip) {
		if (!$scope.user) {
			$location.path('/ny-profil');
			$flash.put('reason', 'not-logged-in');
		} else {
			$http.post('/api/trips/' + trip._id + '/join', { user: $rootScope.user._id }).success(function(data) {
				if (data.error) {
					alert('Du kunne ikke tilmeldes turen :-(');
				} else {
					$scope.joinedWithSuccess();
				}
			});
		}
	}

	/**
	 * Leave the trip. 
	 */
	$scope.leave = function(trip) {
		$http.post('/api/trips/' + trip._id + '/leave', { user: $scope.user._id }).success(function(data) {
			if (data.error) {
				alert('Du kunne ikke afmeldes turen :-(');
			} else {
				$scope.leavedWithSuccess();
			}
		});
	}


	/**
	 * Route to the given trip.
	 */
	$scope.showTrip = function(trip) {		
		$location.path('/tur/' + trip._id);
	}

	/**
	 * Callback when a user has joined a trip
	 */
	$scope.joinedWithSuccess = function() {
		$scope.loadAll();
	}

	/**
	 * Callback when a user has leaved a trip.
	 */
	$scope.leavedWithSuccess = function() {
		$scope.loadAll();
	}
}
BaseCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', '$flash'];

/**
 *
 * Application wide controller
 *
 */
function AppCtrl($scope, $rootScope, $http, $location, $route, $auth) {
	$auth.getCurrent();

	$http.get('/api/areas').success(function(data) {
		$rootScope.areas = data;
	});

	$scope.logout = function() {
		$http.delete('/api/users/session').success(function() {
			$rootScope.user = null;
			if ($location.path() === '/') {
				// Cause a reload of trips so that all "participating" markings are removed
				$route.current.scope.loadAll();
			} else {
				$location.path('/');
			}
		});
	}
}
AppCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', '$route', '$auth'];

/**
 *
 * Index controller.
 *
 */
function IndexCtrl($scope, $rootScope, $location, $http, $flash, $controller) {
	// Inherit to get the join/leave functionality
	$controller(BaseCtrl, { $scope: $scope });
	
	$scope.loadAll({limit:3});

	$scope.joinedWithSuccess = $scope.leavedWithSuccess = function() {
		$scope.loadAll({limit:3});
	}
}
IndexCtrl.$inject = ['$scope', '$rootScope', '$location', '$http', '$flash', '$controller'];

/**
 *
 * Trips controller.
 * 
 */
function TripsCtrl($scope, $controller) {
	var trips;

	$controller(BaseCtrl, { $scope: $scope });
	$scope.loadAll();

	/**
	 * Filter the list of trips
	 */
	$scope.$watch('filter', function() {
		if ($scope.trips) {
			if (!trips) {
				trips = $scope.trips;
			}

			$scope.trips = _.filter(trips, $scope.listFilter);
		}	
	}, true);
	
}
TripsCtrl.$inject = ['$scope', '$controller'];


function TripCtrl($scope, $rootScope, $routeParams, $http, $location, $controller) {
	var id = $routeParams.id;

	$controller(BaseCtrl, { $scope: $scope });
	$scope.comment = {};

	$scope.leavedWithSuccess = $scope.joinedWithSuccess = function() {
		if (!$rootScope.user) {
			$location.path('/ny-profil');
		} else {
			$scope.load();
		}
	}

	$scope.load = function() {
		$http.get('/api/trips/' + id).success(function(data) {
			if (data.trip) {
				$scope.trip = data.trip;
				$scope.trip.myTrip = $scope.trip.creator._id === $rootScope.user._id;
				$scope.comments = data.trip.comments;



				if (_.find($scope.trip.participants, function(p) { return p.user._id === $rootScope.user._id; })) {
					$scope.trip.participating = true;
				}
			} else {
				$location.path('/');
			}
		});
	}

	$scope.sendComment = function() {
		$http.post('/api/trips/' + id + '/comment', { comment: $scope.comment }).success(function(data) {
			if (data.trip) {
				$scope.comment = {};
				$scope.load();
			} else {
				// error, handle it
			}
		});
	}

	if (!id) {
		$location.path('/');
	} else {
		$scope.load();
	}
}
TripCtrl.$inject = ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$controller'];


function TripFormCtrl($scope, $http, $location, $flash, $auth) {
	$auth.userRequired();

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

		// If we actually got some input, when try to convert it
		// to a format that the server understands.
		if (trip.when && trip.when !== '') {
			trip.when = moment(trip.when + ' ' + trip.time, 'DD/MM/YYYY HH:mm').toDate();
		}

		$http.put('/api/trips', { trip: trip }).success(function(data, status) {
			$scope.trip._submit = false;

			if (data.errors) {
				$scope.trip.errors = data.errors;
			} else {
				$flash.put('notice', 'trip-created');
				$location.path('#/tur/' + data._id);
			}
		});
	}
}
TripFormCtrl.$inject = ['$scope', '$http', '$location', '$flash', '$auth'];


function ProfileCtrl($scope, $rootScope, $http, $auth) {
	$auth.userRequired();
	$scope.user = angular.copy($rootScope.user);

	$http.get('/api/users/session/trips').success(function(data) {
		if (data.error) {
			// TODO: Handle error
		} else {
			$scope.trips = data.trips;
		}
	});
}
ProfileCtrl.$inject = ['$scope','$rootScope','$http','$auth'];

function AboutCtrl() {
}

function UserFormCtrl($scope, $http, $flash, $rootScope, $location) {
	$scope.user = {};
	$scope.reason = $flash.get('reason');	

	$scope.submit = function() {
		var copy = angular.copy($scope.user);
		$http.put('/api/users', copy).success(function( data ) {
			if (data.errors) {
				$scope.user.errors = data.errors;
			} else {
				$rootScope.user = data;
				$flash.put('user-created', true);
				$location.path('/');
			}
		});
	};
}
UserFormCtrl.$inject = ['$scope', '$http', '$flash', '$rootScope', '$location'];

function LoginCtrl($scope, $http, $location, $rootScope) {
	$scope.user = {};

	$scope.submit = function() {
		$http.post('/api/users/session', $scope.user).success(function( data ) {
			if (data.invalidCredentials) {
				$scope.user.errors = [{param: 'user.email', msg: 'invalid-login'}, 
					{param: 'user.password', msg: ''}];
			} else {
				$rootScope.user = data.user;
				$location.path('/profil');
			}
		});
	}
}
LoginCtrl.$inject = ['$scope', '$http', '$location', '$rootScope'];
