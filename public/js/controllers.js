'use strict';

/* Controllers */

function AppCtrl() {

}

function IndexCtrl($scope, $location, $http) {
	// Initial filter
	$scope.filter = { type: 'all', region: 'Hovedstadsområdet' };

	$http.get('/api/trips')
		.success(function(data) {
			$scope.trips = data;
		})
		.error(function(data, status) {

		});

	/**
	 * Filter function to filter each item in the list
	 * of trips. Two conditions can be filtered on:
	 * Type  (mtb/road) and region/location.
	 */
	$scope.listFilter = function(trip) {
		if (!_.isUndefined($scope.filter.type)) {
			var type = $scope.filter.type;

			if (type !== 'all' && trip.type.toLowerCase() !== type) {
				return false;
			}
		}

		return true;
	}

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

function TripCtrl($scope, $routeParams, $http, $location) {
	$http.get('/api/trips/' + $routeParams.id)
		.success(function(data) {
			$scope.trip = data;
		}) 
		.error(function() {
			$location.path('/');
		});
}

function NewTripCtrl() {
}

function LoginCtrl() {
}

function ProfileCtrl() {
}

function AboutCtrl() {
}