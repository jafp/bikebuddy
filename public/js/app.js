'use strict';

angular.module('bb', ['bb.filters', 'bb.services', 'bb.directives']).

	/**
	 * Configure routing
	 */
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$routeProvider.when('/', {templateUrl: '/partials/index.html', controller: IndexCtrl});

		$routeProvider.when('/tur/ny', { templateUrl: '/partials/trip.form.html', controller: NewTripCtrl });

		$routeProvider.when('/tur/:id', { templateUrl: '/partials/trip.html', controller: TripCtrl });

	   	$routeProvider.when('/profil', { templateUrl: '/partials/profile.html', controller: ProfileCtrl });

	   	$routeProvider.when('/logind', { templateUrl: '/partials/login.html', controller: LoginCtrl }); 

	   	$routeProvider.when('/om', { templateUrl: '/partials/about.html', controller: AboutCtrl });

	    $routeProvider.otherwise({redirectTo: '/'});

	    $locationProvider.html5Mode(true);

	 }]);
