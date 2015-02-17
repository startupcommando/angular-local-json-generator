(function() {
	'use strict';
	describe('Testing local json generator', function() {

		var JsonGenerator;

		beforeEach(module('angular-local-json-generator'));

/* jshint ignore:start */
		beforeEach(inject(function($injector) {
			JsonGenerator = $injector.get('JsonGenerator');
		}));
/* jshint ignore:end */

		it('Should output correct', function(done) {
			var testPromise = function (data) {
				expect(0).toBe(1);
				expect(data.length).toBe(4);
			};
			var failTest = function(error) {
				expect(error).toBeUndefined();
			};
	    		expect(JsonGenerator.setConfig({rows: 3})).toBe(true);
			JsonGenerator.setDataModel({ jsonType: 'bool' });
			JsonGenerator.generateData().then(testPromise).catch(failTest).finally(done);
			expect(0).toBe(0);
		});
	});
})();
