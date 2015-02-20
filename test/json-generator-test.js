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
		var dataModel = null,rows = 15;

		dataModel = { property: { jsonType: 'number'}};
		var testNumberDefault = function (data) {
			var idx;
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			for(idx in data) {
				expect(data[idx].property).toBeNumber();
				expect(data[idx].property).toBeWithinRange(0, 1000);
			}
		};
		expect(JsonGenerator.setConfig({rows: rows})).toBe(true);
		JsonGenerator.setDataModel({ property: { jsonType: 'number' }});
		JsonGenerator.generateData().then(testNumberDefault);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', range: [5,10]}};
		var testNumberRange = function (data) {
			var idx;
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(5, 10);
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberRange);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', length: 7}};
		var testNumberLength = function (data) {
			var idx;
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(1000000, 9999999);
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberLength);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', length: 7, range: [5000000, 5000002]}};
		var testNumberLengthRange = function (data) {
			var idx;
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(5000000, 5000002);
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberLengthRange);
		$rootScope.$apply();

		dataModel = { property: { jsonType: 'number', length: 7, range: [5,50]}};
		var testNumberLengthOutOfRange = testNumberLength; // in this case the test are the same as testNumberLength
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testNumberLengthOutOfRange);
		$rootScope.$apply();
	});


	it('generate and test nesting of objects as well as the float type', function() {
		var dataModel = null,elNumber = 50;

		dataModel = { propertyL1: { propertyL2: { jsonType: 'float' }}};
		var testFloatNumberDefault = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(elNumber);
			expect(data[0].propertyL1).toBeObject();
			expect(data[0].propertyL1.propertyL2).toBeNumber();
			for(var idx in data) {
				expect(data[idx].propertyL1.propertyL2).toBeWithinRange(0,1000);
			}
		};
		expect(JsonGenerator.setConfig({rows: elNumber})).toBe(true);
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testFloatNumberDefault);
		$rootScope.$apply();

		dataModel = { propertyL1: { propertyL2: { jsonType: 'float', range:[1.5,2]}}};
		var testFloatNumberRange = function (data) {
			for(var idx in data) {
				expect(data[idx].propertyL1.propertyL2).toBeWithinRange(1.5,2);
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testFloatNumberRange);
		$rootScope.$apply();

		var farctionDigits = 5;
		dataModel = { propertyL1: { propertyL2: { jsonType: 'float', length:farctionDigits}}};
		var testFloatNumberLength = function (data) {
			for(var idx in data) {
				var val = (data[idx].propertyL1.propertyL2+'').split('.');
				var fractionPartLength = val[1].length;

				// sometimes when we cut the franction the last digits may be 0s, which are naturally cut
				// so we don't check for the exact number of dijits
				expect(fractionPartLength).toBeWithinRange(0,farctionDigits); 
			}

		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testFloatNumberLength);
		$rootScope.$apply();
	});


	it('generate and test nesting of array of values as well as the date type', function() {
		var dataModel = null,dateMin,dateMax,rangeMin,rangeMax;

		dataModel = { propertyL1: [{ jsonType: 'date' }]};
		var testDateDefault = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(2);
			expect(data[0].propertyL1).toBeArrayOfStrings();
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					expect(moment(data[i].propertyL1[j]).isValid()).toBe(true);
				}
			}
		};
		expect(JsonGenerator.setConfig({rows: 2})).toBe(true);
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testDateDefault);
		$rootScope.$apply();

		dataModel = { propertyL1: [{ jsonType: 'date', format: 'YYYY/MM/DD'}]};
		var testDateFormat = function (data) {
			var val = null;
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					val = data[i].propertyL1[j].split('/');
					expect(val).toBeArray();
					expect(val.length).toBe(3);
				}
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testDateFormat);
		$rootScope.$apply();

		dateMin = '15-2-2015';dateMax = '17-2-2015';
		rangeMin = moment(dateMin,'D-M-YYYY').unix();
		rangeMax = moment(dateMax,'D-M-YYYY').unix();
		dataModel = { propertyL1: [{ jsonType: 'date', range: [dateMin,dateMax]}]};
		var testDateRange = function (data) {
			var val = null;
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					val = moment(data[i].propertyL1[j]).unix();
					expect(val).toBeWithinRange(rangeMin,rangeMax);
				}
			}
		};
		JsonGenerator.setDataModel(dataModel);
		JsonGenerator.generateData().then(testDateRange);
		$rootScope.$apply();
	});

});
 // jshint ignore:end 