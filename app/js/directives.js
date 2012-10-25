'use strict';

/* 
 * Directives 
 */

angular.module('bb.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}])

	.directive('datepicker', function() {
		return {
			require: '?ngModel',
			link: function(scope, element, attrs, ngModel) {
				if (!ngModel) return;

				element = $(element);
				
				element.datepicker({
					format: 'dd/mm/yyyy'
				});

				element.on('changeDate', function() {
					scope.$apply(update);
				});

				function update() {
					ngModel.$setViewValue(element.val());
				}
			}
	};
	})

	/**
	 * Directive for generating options for the 
	 * time select input.
	 */
	.directive('timeOptions', function() {
		var linker = function(scope, element, attrs) {
			var val = scope.$eval(attrs.timeOptions);

			for (var i = 6; i < 24; i++) {
				var hour = ((i < 10) ? '0' : '') + i,
					first = hour + ':00',
					second = hour + ':30';

				element.append( $('<option />').val(first).text(first) );
				element.append( $('<option />').val(second).text(second) );
			}
		};

		return {
			link: linker
		}
	})

	.directive('fieldError', function() {

		var getInput = function(path) {
			return $('[ng-model="' + path + '"]');
		}

		var getFieldName = function(input) {
			var label = input.parent().find('label');
			return label.clone().children().remove().end().text();
		}

		var getTypeTranslation = function(type) {
			if (type === 'required') {
				return 'Påkrævet';
			}
			if (type === 'invalid-email') {
				return 'Ugyldig email';
			}
			if (type === 'password-not-confirmed') {
				return 'Passwords er ikke ens'
			}
			return type;
		}

		var linker = function(scope, element, attrs) {
			var error = scope.$eval(attrs.fieldError),
				prefix = attrs.pathPrefix || '',
				input,
				label,
				fieldName;

			input = getInput(prefix + error.param);
			fieldName = getFieldName(input);

			element.text(fieldName.trim() + ': ' + getTypeTranslation(error.msg));
		}

		return {
			link: linker
		}
	});