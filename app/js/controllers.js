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
			var i, len, t;

			// Set a flag on each trip if the current user are participating.
			if ($rootScope.user) {
				for (i = 0, len = data.trips.length; i < len; i++) {
					t = data.trips[i];

					if (_.contains(t.participants, $rootScope.user._id)) {
						t.participating = true;
					}
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

	$scope.joinedWithSuccess = function() {
		$scope.loadAll();
	}

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
function AppCtrl($scope, $rootScope, $http, $location, $route) {
	$http.get('/api/users/session').success(function(data) {
		$rootScope.user = data;
	});

	$http.get('/api/areas').success(function(data) {
		$rootScope.areas = data;
	});

	$scope.logout = function() {
		$http.delete('/api/users/session').success(function() {
			$rootScope.user = null;
			if ($location.path() === '/') {
				// Cause a reload of trips so that all "participating" markings are removed
				$route.current.scope.load();
			} else {
				$location.path('/');
			}
		});
	}
}
AppCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', '$route'];

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

	/**
	 * Route to the given trip.
	 */
	$scope.showTrip = function(trip) {		
		$location.path('/tur/' + trip._id);
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


function TripCtrl($scope, $routeParams, $http, $location) {
	if (!$routeParams.id) {
		$location.path('/');
	
	} else {
		$http.get('/api/trips/' + $routeParams.id)
			.success(function(data) {
				$scope.trip = data;
			}) 
			.error(function() {
				$location.path('#/');
			});
	}
}
TripCtrl.$inject = ['$scope', '$routeParams', '$http', '$location'];


function TripFormCtrl($scope, $http, $location, $flash) {

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
TripFormCtrl.$inject = ['$scope', '$http', '$location', '$flash'];


function ProfileCtrl() {
}

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
				$location.path('/');
			}
		});
	}
}
LoginCtrl.$inject = ['$scope', '$http', '$location', '$rootScope'];
