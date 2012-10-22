'use strict';

/* Filters */

angular.module('bb.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])

  .filter('tripType', function() {

  	return function(text) {
  		text = text || '';

  		switch (text.toLowerCase()) {
  			case 'mtb': return 'MTB';
  			case 'road': return 'Landevej';
  		}
  		return 'Ukendt type';
  	}
  })

  .filter('areaName', function($rootScope) {
    return function(areaKey) {
      var area = _.find($rootScope.areas, function(area) {
        return area.id === areaKey;
      });

      return area.name;
    }
  });
