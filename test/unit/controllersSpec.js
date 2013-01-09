'use strict';


/* jasmine specs for controllers go here */

describe('User form controller', function() {
 	var ctrl,
		scope,
		$httpBackend,
		errors;

	errors = {
		"email": { type: 'required' },
		"name.first": { type: 'required' },
		"name.last": { type: 'required' }
	};

	beforeEach(function(){
	    this.addMatchers({
		    toEqualData: function(expected) {
		    	return angular.equals(this.actual, expected);
		    }
	    });
	  });

	beforeEach(module('bb.services'));

	beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
		$httpBackend = _$httpBackend_;

		$httpBackend.expectPUT('/api/users', { name: 'Joe', email: 'joe@biden.com' }).respond({ name: 'Joe' });
		$httpBackend.expectPUT('/api/users', {}).respond({ errors: errors });

		scope = $rootScope.$new();
		ctrl = $controller(UserFormCtrl, {$scope: scope});
	}));

  	it('should create an empty user', function() {
  		expect(scope.user).toEqualData({});
  	});

  	it('should set errors on empty user submit', function() {
  		scope.submit();
  		$httpBackend.flush();

  		expect(scope.user.errors).toEqualData(errors);
  	});

  	it('should return user and set as saved', function() {
  		scope.user = { name: 'Joe', email: 'joe@biden.com' };
  		scope.submit();

  		$httpBackend.flush();
  		expect(scope.user.saved).toBe(true);
  	});
});

/*
describe('MyCtrl1', function(){
  var myCtrl1;

  beforeEach(function(){
	myCtrl1 = new MyCtrl1();
  });


  it('should ....', function() {
	//spec body
  });
});
*/
