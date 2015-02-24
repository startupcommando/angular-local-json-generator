/*global inject, moment*/
'use strict';
describe('Testing local json generator', function() {
	var JsonGenerator, $rootScope;

	beforeEach(module('angular-local-json-generator'));
	beforeEach(inject(function($injector,_$rootScope_) {
		JsonGenerator = $injector.get('JsonGenerator');
		$rootScope = _$rootScope_;
	}));

	var promiseErrorHandler = function(err) {
		expect(err).toBeUndefined();
	};

	it('generate and test an array of values as well as the bool type', function() {
		var testBools = function (data) {
			expect(data).toBeArrayOfBooleans();
			expect(data.length).toBe(3);
		};
		var input = {
			config: {rows: 3},
			model: { type: 'bool' }
		};
		JsonGenerator.generateData(input).then(testBools,promiseErrorHandler);
		$rootScope.$apply();

		// Test the structure of the inputed meta model. It should contain config with field rows and a model objects
		var testIfNotRowsModel = function (data) {
			expect(true).toBe(false); // This should never be evaluated
		};
		input = {model: { type: 'bool' }};
		JsonGenerator.generateData(input).then(testIfNotRowsModel,function(err){
			expect(err).toBe('Error: Provide both the correct configuration and model.');
		});
		$rootScope.$apply();
		input = {config: {rows: 3}};
		JsonGenerator.generateData(input).then(testIfNotRowsModel,function(err){
			expect(err).toBe('Error: Provide both the correct configuration and model.');
		});
		$rootScope.$apply();
		input = {config: {}, model: { type: 'bool' }};
		JsonGenerator.generateData(input).then(testIfNotRowsModel,function(err){
			expect(err).toBe('Error: Provide both the correct configuration and model.');
		});
		$rootScope.$apply();
	});

	it('generate and test an array of values as well as the text type', function() {
		var dataModel = null;
		var testTextDefault = function (data) {
			expect(data).toBeArrayOfStrings();
			expect(data.length).toBe(3);
		};
		var input = {config: {rows: 3}}; // the config is common for all the test in this group

		input.model = 	{ type: 'text' };
		JsonGenerator.generateData(input).then(testTextDefault,promiseErrorHandler);
		$rootScope.$apply();

		var testTextLength = function (data) {
			var words = data[0].split(' ');
			expect(words.length).toBe(5);
		};
		input.model = 	{ type: 'text', length: 5 };
		JsonGenerator.generateData(input).then(testTextLength,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generate and test an array of objects as well as the number type', function() {
		var dataModel = null,rows = 15;
		var input = { config: {rows: rows} };

		var testNumberDefault = function (data) {
			var idx;
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			for(idx in data) {
				expect(data[idx].property).toBeNumber();
				expect(data[idx].property).toBeWithinRange(0, 1000);
			}
		};
		input.model = { property: { type: 'number' }};
		JsonGenerator.generateData(input).then(testNumberDefault,promiseErrorHandler);
		$rootScope.$apply();

		var testNumberRange = function (data) {
			var idx;
			expect(data).toBeArrayOfObjects();
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(5, 10);
			}
		};
		input.model = { property: { type: 'number', range: [5,10]}};
		JsonGenerator.generateData(input).then(testNumberRange,promiseErrorHandler);
		$rootScope.$apply();

		var testNumberLength = function (data) {
			var idx;
			expect(data).toBeArrayOfObjects();
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(1000000, 9999999);
			}
		};
		input.model = { property: { type: 'number', length: 7 }};
		JsonGenerator.generateData(input).then(testNumberLength,promiseErrorHandler);
		$rootScope.$apply();

		var testNumberLengthRange = function (data) {
			var idx;
			expect(data).toBeArrayOfObjects();
			for(idx in data) {
				expect(data[idx].property).toBeWithinRange(5000000, 5000002);
			}
		};
		input.model = { property: { type: 'number', length: 7, range: [5000000, 5000002] }};
		JsonGenerator.generateData(input).then(testNumberLengthRange,promiseErrorHandler);
		$rootScope.$apply();

		input.model = { property: { type: 'number', length: 7, range: [5,50] }};
		var testNumberLengthOutOfRange = testNumberLength; // in this case the test are the same as testNumberLength
		JsonGenerator.generateData(input).then(testNumberLengthOutOfRange,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generate and test nesting of objects as well as the float type', function() {
		var dataModel = null,rows = 50;
		var input = { config: {rows: rows} };

		var testFloatNumberDefault = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			expect(data[0].propertyL1).toBeObject();
			expect(data[0].propertyL1.propertyL2).toBeNumber();
			for(var idx in data) {
				expect(data[idx].propertyL1.propertyL2).toBeWithinRange(0,1000);
			}
		};
		input.model = { propertyL1: { propertyL2: { type: 'float' }}};
		JsonGenerator.generateData(input).then(testFloatNumberDefault,promiseErrorHandler);
		$rootScope.$apply();

		var testFloatNumberRange = function (data) {
			for(var idx in data) {
				expect(data[idx].propertyL1.propertyL2).toBeWithinRange(1.5,2);
			}
		};
		input.model = { propertyL1: { propertyL2: { type: 'float', range:[1.5,2]}}};
		JsonGenerator.generateData(input).then(testFloatNumberRange,promiseErrorHandler);
		$rootScope.$apply();

		var farctionDigits = 5;
		var testFloatNumberLength = function (data) {
			for(var idx in data) {
				var val = (data[idx].propertyL1.propertyL2+'').split('.');
				var fractionPartLength = val[1].length;

				// sometimes when we cut the franction the last digits may be 0s, which are naturally cut
				// so we don't check for the exact number of dijits
				expect(fractionPartLength).toBeWithinRange(0,farctionDigits); 
			}
		};
		input.model = { propertyL1: { propertyL2: { type: 'float',length:farctionDigits}}};
		JsonGenerator.generateData(input).then(testFloatNumberLength,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generates and test nesting of array of values as well as the date type', function() {
		var dataModel = null,dateMin,dateMax,rangeMin,rangeMax,rows = 2;
		var input = { config: {rows: rows} };

		var testDateDefaultGlobalConfig = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			expect(data[0].propertyL1).toBeArrayOfStrings();
			expect(data[0].propertyL1.length).toBe(rows);
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					expect(moment(data[i].propertyL1[j]).isValid()).toBe(true);
				}
			}
		};
		input.model = { propertyL1: [{
				model: { type: 'date' }
			}]
		};
		JsonGenerator.generateData(input).then(testDateDefaultGlobalConfig,promiseErrorHandler);
		$rootScope.$apply();

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
		input.model = { propertyL1: [{
				model: { type: 'date', format: 'YYYY/MM/DD' }
			}]
		};
		JsonGenerator.generateData(input).then(testDateFormat,promiseErrorHandler);
		$rootScope.$apply();

		dateMin = '15-2-2015';dateMax = '17-2-2015';
		rangeMin = moment(dateMin,'D-M-YYYY').unix();
		rangeMax = moment(dateMax,'D-M-YYYY').unix();
		var testDateRange = function (data) {
			var val = null;
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					val = moment(data[i].propertyL1[j]).unix();
					expect(val).toBeWithinRange(rangeMin,rangeMax);
				}
			}
		};
		input.model = { propertyL1: [{
				model: { type: 'date', range: [dateMin,dateMax] }
			}]
		};
		JsonGenerator.generateData(input).then(testDateRange,promiseErrorHandler);
		$rootScope.$apply();

		var testDateDefaultNestedConfig = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			expect(data[0].propertyL1).toBeArrayOfStrings();
			expect(data[0].propertyL1.length).toBe(5);
		};
		input.model = { propertyL1: [{
				config: {rows: 5},
				model: { type: 'date' }
			}]
		};
		JsonGenerator.generateData(input).then(testDateDefaultNestedConfig,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generate and test nesting of array of object as well as the slugFromText type as well as proving that type keyword is usable as a field', function() {
		var rows = 2,nestedRows = 3;
		var input = { config: {rows: rows} };

		var testSlugFromTextDefault = function (data) {
			expect(data).toBeArrayOfObjects();
			expect(data.length).toBe(rows);
			for (var i in data) {
				expect(data[i].propertyL1).toBeArrayOfObjects();
				expect(data[i].propertyL1.length).toBe(nestedRows);
				for(var j in data[i].propertyL1) {
					expect(data[i].propertyL1[j].type).toBeString();
				}				
			}
		};
		input.model = { propertyL1: [{
				config: { rows: nestedRows },
				model: { type: { type: 'slugFromText' } }
			}]
		};
		JsonGenerator.generateData(input).then(testSlugFromTextDefault,promiseErrorHandler);
		$rootScope.$apply();

		var testSlugFromTextLength = function (data) {
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					expect(data[i].propertyL1[j].type.split('_').length).toBe(5);
				}				
			}
		};
		input.model = { propertyL1: [{
				config: { rows: nestedRows },
				model: { type: { type: 'slugFromText', length: 5 } }
			}]
		};
		JsonGenerator.generateData(input).then(testSlugFromTextLength,promiseErrorHandler);
		$rootScope.$apply();

		var testSlugFromTextValue = function (data) {
			var valArr = [];
			for (var i in data) {
				for(var j in data[i].propertyL1) {
					expect(data[i].propertyL1[j].type.indexOf('!')).toBe(-1);
					expect(data[i].propertyL1[j].type.indexOf(',')).toBe(-1);
					expect(data[i].propertyL1[j].type.indexOf(':')).toBe(-1);
					expect(data[i].propertyL1[j].type.indexOf('%')).toBe(-1);
					expect(data[i].propertyL1[j].type.indexOf('$')).toBe(-1);
					expect(data[i].propertyL1[j].type.indexOf('@')).toBe(-1);
					expect(data[i].propertyL1[j].type).toContain('_');
					valArr = data[i].propertyL1[j].type.split('_');
					expect(valArr).toBeArray();
					expect(valArr.length).toBe(8);
				}				
			}
		};
		input.model = { propertyL1: [{
				config: { rows: nestedRows },
				model: { type: { type: 'slugFromText', value: '!Tova_ e, nqkakuv text: az@ok.com, (15% ot $1).' } }
			}]
		};
		JsonGenerator.generateData(input).then(testSlugFromTextValue,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generates and tests camelCasefromText and proving that we can use the model keyword as a common field', function() {
		var rows = 2;
		var input = { config: {rows: rows} };
		var testCamelCaseValues = function(data) {
			var valArr = [];
			for (var i in data) {
				expect(data[i].model).toBeString();
				expect(data[i].model.indexOf('!')).toBe(-1);
				expect(data[i].model.indexOf(',')).toBe(-1);
				expect(data[i].model.indexOf(':')).toBe(-1);
				expect(data[i].model.indexOf('%')).toBe(-1);
				expect(data[i].model.indexOf('$')).toBe(-1);
				expect(data[i].model.indexOf('_')).toBe(-1);
				expect(data[i].model.indexOf('@')).toBe(-1);
				// split the camelCase word into words and check the count 
				valArr = data[i].model.split(/(?=[A-Z])/);
				expect(valArr.length).toBe(4);
			}
		};
		input.model = {
			 model: { type: 'camelCasefromText', length: 4, value: '!Tova_ e, nqkakuv text: az@ok.com, (15% ot $1).' }
		};
		JsonGenerator.generateData(input).then(testCamelCaseValues,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generates and tests indexes', function() {
		var rows =7, counter = 0;
		var input = { config: {rows: rows} };
		var testIndexValue = function(data) {
			for(var idx in data) {
				expect(data[idx].id).toBeNumber();
				expect(data[idx].id).toBe(counter);
				counter += 1;
			}
		};
		input.model = {
			 id: { type: 'index'}
		};
		JsonGenerator.generateData(input).then(testIndexValue,promiseErrorHandler);
		$rootScope.$apply();

		// start again and make sure the index follows the counter
		JsonGenerator.generateData(input).then(testIndexValue,promiseErrorHandler);
		$rootScope.$apply();

		counter = 5;
		var testIndexInitValue = function(data) {
			for(var idx in data) {
				expect(data[idx].id).toBeNumber();
				expect(data[idx].id).toBe(counter);
				counter += 1;
			}
		};
		input.model = {
			 id: { type: 'index', value: 5}
		};
		JsonGenerator.generateData(input).then(testIndexInitValue,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generates and tests phones', function() {
		var rows =7;
		var input = { config: {rows: rows} };
		var testPhonesDefault = function(data) {
			// the default phone format is +XXX YYYYYYY			
			var phoneParts = [];
			for(var idx in data) {
				phoneParts = data[idx].phone.split(' ');
				expect(phoneParts.length).toBe(2);
				expect(phoneParts[0].indexOf('+')).toBe(0);
				expect(parseInt(phoneParts[1])).toBeNumber();
				expect(parseInt(phoneParts[1])).toBeWithinRange(1000000,999999999);
			}
		};
		input.model = {
			 phone: { type: 'phone'}
		};
		JsonGenerator.generateData(input).then(testPhonesDefault,promiseErrorHandler);
		$rootScope.$apply();
	});

	it('generates and tests credit card numbers', function() {
		var rows =7;
		var input = { config: {rows: rows} };
		var testCCDefault = function(data) {
			for(var idx in data) {
				var val = data[idx].cc+'';
				var sum = 0;
				for (var i = 0; i < val.length; i++) {
					var intVal = parseInt(val.substr(i, 1));
					if (i % 2 === 0) {
						intVal *= 2;
						if (intVal > 9) {
							intVal = 1 + (intVal % 10);
						}
					}
					sum += intVal;
				}
				expect((sum % 10)).toBe(0);
			}
		};
		input.model = {
			 cc: { type: 'ccNumber'}
		};
		JsonGenerator.generateData(input).then(testCCDefault,promiseErrorHandler);
		$rootScope.$apply();
	});
});