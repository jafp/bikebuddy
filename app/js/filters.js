'use strict';

/* Filters */

angular.module('bb.filters', [])
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

  .filter('areaName', ['$rootScope', function($rootScope) {
    return function(areaKey) {
      var area = _.find($rootScope.areas, function(area) {
        return area.id === areaKey;
      });

      return area.name;
    }
  }])

  .filter('humanize', function() {
    return function(date) {
      return moment(new Date(date)).fromNow();
    }
  });
