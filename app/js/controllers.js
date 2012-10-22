'use strict';

/* Controllers */

function AppCtrl($rootScope, $http) {
	$http.get('/api/areas').success(function(data) {
		$rootScope.areas = data;
	});
}
AppCtrl.$inject = ['$rootScope', '$http'];

function IndexCtrl($rootScope, $scope, $location, $http) {
	$scope.filter = { area: '', type: '' };

	$http.get('/api/trips').success(function(data) {
		$scope.trips = $scope.filteredTrips = data;
	});

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
	$scope.participate = function(trip) {
	}

	/**
	 * Leave the trip. 
	 */
	$scope.leave = function(trip) {
	}

	/**
	 * Route to the given trip.
	 */
	$scope.showTrip = function(trip) {		
		$location.path('/tur/' + trip._id);
	}
}
IndexCtrl.$inject = ['$rootScope', '$scope', '$location', '$http'];


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


function LoginCtrl() {
}

function ProfileCtrl() {
}

function AboutCtrl() {
}

function UserFormCtrl() {
}
