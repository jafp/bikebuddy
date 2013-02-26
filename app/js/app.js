'use strict';

angular.module('bb', ['bb.filters', 'bb.services', 'bb.directives']).

	/**
	 * Configure routing
	 */
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$routeProvider
			.when('/', {templateUrl: '/partials/index.html', controller: IndexCtrl})
			.when('/tur/ny', { templateUrl: '/partials/trip.form.html', controller: TripFormCtrl })
			.when('/tur/:id', { templateUrl: '/partials/trip.html', controller: TripCtrl })
			.when('/ture', { templateUrl: '/partials/trips.html', controller: TripsCtrl })
	   		.when('/profil', { templateUrl: '/partials/profile.html', controller: ProfileCtrl })
	   		.when('/logind', { templateUrl: '/partials/login.html', controller: LoginCtrl })
	   		.when('/om', { templateUrl: '/partials/about.html', controller: AboutCtrl })
	   		.when('/ny-profil', { templateUrl: '/partials/user.form.html', controller: UserFormCtrl })
			.otherwise({redirectTo: '/'})

	    //$locationProvider.html5Mode(true);
	 }])

	.run(['$rootScope', function($rootScope) {
		var ngView;

		// Simple way of doing transitions betweens views
		ngView = $('[ng-view]');
		$rootScope.$on('$routeChangeStart', function() {
			ngView.hide()
		});
		
		$rootScope.$on('$routeChangeSuccess', function() {
			ngView.fadeIn(200);
		});

	}]);
