'use strict';

/* 
 * Directives 
 */

angular.module('bb.directives', [])

	/** 
	 * Datepicker directive. Opens when the input
	 * field (or element it is applied to) is clicked.
	 */
	.directive('datepicker', function() {
		var linker = function(scope, element, attrs, ngModel) {
			if (!ngModel) return;

			element = $(element);
			element.attr('readonly', 'readonly').css('background', 'white');
			
			element.datepicker({
				minDate: 0,
				dateFormat: 'dd/mm/yy',
				onSelect: function() {
					scope.$apply(update);
				}
			});

			function update() {
				ngModel.$setViewValue(element.val());
			}
		}

		return {
			require: '?ngModel',
			link: linker
		}
	})

	.directive('tooltip', function() {
		var linker = function(scope, element, attrs) {
			element.tooltip({ placement: attrs.tooltipPlacement || 'top' });
		}

		return {
			link: linker	
		}
	})

	.directive('profilePicture', function() {
		return {
			link: function(scope, element, attrs) {
				var user = scope.$eval(attrs.profilePicture),
					src = '/static/img/userplaceholder.png';

				if (user && user.imageThumbUrl) {
					src = user.imageThumbUrl;
				}

				element.attr('src', src);
			}
		}
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

	/**
	 * Directive for handling error on forms.
	 * TODO: Better documentation
	 */
	.directive('errors', function() {

		var dict = {
			'required': 'Udfyld venligst',
			'invalid-email': 'Ugyldig e-mailadresse',
			'email-already-in-use': 'Der findes allerede en bruger med den e-mail',
			'invalid-login': 'Ugyldigt logind, prøv igen',
			'password-not-confirmed': 'Password ikke gentaget rigtigt'
		};

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

						fieldErrors.push(dict[err.msg] || err.msg);
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

	});