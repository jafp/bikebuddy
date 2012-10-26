'use strict';

/* Services */

var services = angular.module('bb.services', [])
	.value('version', '0.1')

	.factory('User', ['$http', function($http) {
		var baseUrl = '/api/users';

		return {
			create: function(user) {
				return $http.put(baseUrl, user);
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
