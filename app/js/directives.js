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

	.directive('errors', function() {

		var linker = function(scope, element, attrs) {
			var prefix = attrs.errorsModelPrefix || '',
				fieldsWithErrors,
				fieldErrors,
				ngModelName,
				span;

			scope.$watch(attrs.errors, function(errors) {
				if (errors) {
					fieldsWithErrors = {};
					// Group by param and collect errors
					_.each(errors, function(err) {
						fieldErrors = fieldsWithErrors[prefix + err.param];
						if (!fieldErrors) {
							fieldsWithErrors[prefix + err.param] = fieldErrors = []
						}

						fieldErrors.push(err.msg);
					});	

					$('input, select, textarea', element).not('[type=submit]').each(function(idx, input) {
						input = $(input).removeClass('error');
						input.parent().find('.invalid').remove();
						ngModelName = input.attr('ng-model');
						fieldErrors = fieldsWithErrors[ngModelName];
						if (fieldErrors) {
							input.addClass('error');
							span = $('<span class="invalid"><img src="/static/img/error.png" /> </span>');
							span.append(fieldErrors.join(', '));
							input.parent().append(span);
						}
					});
				}
			});
		}

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