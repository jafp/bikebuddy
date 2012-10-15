'use strict';

/* Controllers */

function AppCtrl() {

}

function IndexCtrl($scope, $location) {

	$scope.trips = [
		{ id: 1, where: 'Skowbrynet', type: 'MTB', intensity: 'EASY', when: 'Two hours', comments: [], participants: [ {}, {} ] },
		{ id: 2, where: 'Bagsværd', type: 'ROAD', intensity: 'EASY', when: 'Four hours', comments: [ {} ], participants: [{}] }
	];

	$scope.participate = function(trip) {
		console.log('asdasd');
		return false;
	}

	$scope.leave = function(trip) {
	}

	$scope.showTrip = function(trip) {		
		console.log('sssss');
		$location.path('/tur/' + trip.id);
	}
}

function TripCtrl() {
}

function NewTripCtrl() {
}

function LoginCtrl() {
}

function ProfileCtrl() {
}

function AboutCtrl() {
}