'use strict';

/* Controllers */

function AppCtrl() {

}

function IndexCtrl($scope, $location, $http) {

	$http.get('/api/trips')
		.success(function(data) {
			$scope.trips = data;
		})
		.error(function(data, status) {

		});

	$scope.participate = function(trip) {
	}

	$scope.leave = function(trip) {
	}

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