'use strict';

/* Services */

var services = angular.module('bb.services', [])
	.value('version', '0.1')

	.factory('$auth', ['$rootScope', '$location', '$http', '$q', function($rootScope, $location, $http, $q) {
	
		return {
			getCurrent: function() {
				var defer = $q.defer();
				if ($rootScope.user) {
					defer.resolve($rootScope.user);
				} else {
					$http.get('/api/users/session').success(function(data) {
						$rootScope.user = data;
						defer.resolve($rootScope.user);
					});
				}
				return defer.promise;
			},

			userRequired: function() {
				if (!$rootScope.user) {
					$location.path('/logind');
				}
			}
		}

	}])

	.factory('$flash', ['$cacheFactory', function($cacheFactory) {
		var cache = {};

		return {
			/**
			 * Put a value and key, or multiple keys into the flash
			 */
			put: function(key, value) {
				if (typeof key === 'object') {
					for (var k in key) {
						if (key.hasOwnProperty(k)) {
							this.put(k, key[k]);
						}
					}
				}
				cache[key] = value;
			},

			/**
			 * Read the value identified by the given key from the cache.
			 * The key-value pair is removed from the cache after the read.
			 */
			get: function(key) {
				var value = cache[key];
				delete cache[key];
				return value;
			},

			peek: function(key) {
				return cache[key];
			}
		}
	}]);
