/* jshint ignore:start */
'use strict';
describe('Testing local json generator', function() {
	var JsonGenerator, $rootScope;

	beforeEach(module('angular-local-json-generator'));
	beforeEach(inject(function($injector,_$rootScope_) {
		JsonGenerator = $injector.get('JsonGenerator');
		$rootScope = _$rootScope_;
	}));

	it('generate and test an array of values as well as the bool type', function() {
		var testPromise = function (data) {
			expect(data).toBeArrayOfBooleans();
			expect(data.length).toBe(3);
		};
		expect(JsonGenerator.setConfig({rows: 3})).toBe(true);
		JsonGenerator.setDataModel({ jsonType: 'bool' });
		JsonGenerator.generateData().then(testPromise);
		$rootScope.$apply();
	});

	it('generate and test an array of values as well as the text type', function() {
		var dataModel = null;
		var testTextDefault = function (data) {
			expect(data).toBeArrayOfStrings();
			expect(data.length).toBe(3);
		};
		expect(JsonGenerator.setConfig({rows: 3})).toBe(true);
		JsonGenerator.setDataModel({ jsonType: 'text' });
		JsonGenerator.generateData().then(testTextDefault);
		$rootScope.$apply();

		var testTextLength = function (data) {
			var words = data[0].split(' ');
			expect(words.length).toBe(5);
		};
		JsonGenerator.setDataModel({ jsonType: 'text', length: 5});
		JsonGenerator.generateData().then(testTextLength);
		$rootScope.$apply();
	});

	it('generate and test an array of objects as well as the number type', function() {
		var dataModel = null;

		dataModel = { property: { jsonType: 'number'}};
		var testNumberDefault = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(4);
			expect(data[0].property).toBeNumber();
			expect(data[0].property).toBeWithinRange(0, 1000);
			expect(data[1].property).toBeNumber();
			expect(data[1].property).toBeWithinRange(0, 1000);
			expect(data[2].property).toBeNumber();
			expect(data[2].property).toBeWithinRange(0, 1000);
			expect(data[3].property).toBeNumber();
			expect(data[3].property).toBeWithinRange(0, 1000);
		};
		expect(JsonGenerator.setConfig({rows: 4})).toBe(true);
		JsonGenerator.setDataModel({ property: { jsonType: 'number' }});
		JsonGenerator.generateData().then(testNumberDefault);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', range: {min: 5, max: 10}}};
		var testNumberRange = function (data) {
			expect(data[0].property).toBeWithinRange(5, 10);
			expect(data[1].property).toBeWithinRange(5, 10);
			expect(data[2].property).toBeWithinRange(5, 10);
			expect(data[3].property).toBeWithinRange(5, 10);
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberRange);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', length: 7}};
		var testNumberLength = function (data) {
			expect(data[0].property).toBeWithinRange(1000000, 9999999);
			expect(data[1].property).toBeWithinRange(1000000, 9999999);
			expect(data[2].property).toBeWithinRange(1000000, 9999999);
			expect(data[3].property).toBeWithinRange(1000000, 9999999);
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberLength);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', length: 7, range: {min: 5000000, max: 5000002}}};
		var testNumberLengthRange = function (data) {
			expect(data[0].property).toBeWithinRange(5000000, 5000002);
			expect(data[1].property).toBeWithinRange(5000000, 5000002);
			expect(data[2].property).toBeWithinRange(5000000, 5000002);
			expect(data[3].property).toBeWithinRange(5000000, 5000002);
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberLengthRange);
		$rootScope.$apply();
	});


	it('generate and test nesting of objects as well as the float type', function() {
		var dataModel = null;
	});
});
 // jshint ignore:end 