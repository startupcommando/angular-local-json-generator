# Angular service for generating json data locally 

Inspired by [FillText.com](http://www.filltext.com/)

Usually both the frontend and the backend of a web app are developed simultaneously,but there is an issue. The frontend requires data but the backend is not ready to provide it. As a workaround, multiple json generators such as [FillText.com](http://www.filltext.com/) appear.  Obviously those services come with limitations. They require constant connectivity and their availability is not guaranteed.

With angular-local-json-generator module we try to remove those limitations for all angular developers. 

## Dependencies

[Moment.js](http://momentjs.com/) and [loDash](https://lodash.com/) should be installed in the app

	bower install moment --save
	bower install lodash --save

## Install

```
bower install angular-local-json-generator
```

But i guess it makes more sense to install it as a development dependency.

```
bower install angular-local-json-generator --save-dev
```
   
## Getting Started

After installing it, make sure to inject it as a dependency in the angular app.

```javascript
	var app = angular.module('myApp', ['angular-local-json-generator']);
```

Than use it in an angular service or controller:

```javascript
	var MySvc = function(JsonGenerator) {
	}
	angular.module('myApp').factory('MySvc',['JsonGenerator',MySvc]);
```

The module can generate array of values and objects. It allows unlimited levels of nesting.

The module has only 1 method, which requres the data meta model as a parameter:

* generateData - obvious

The meta model consists of two parts configuration object and model object:

#### 1. configuration object 

Passed as an argument in the setConfig method. Here is the structure of the current configuration object:

	var config = {
		rows: 0-n, // mandatory how many rows to generate for the json array
		randomRows: true,false, // randomize the number of rows. Range 1-n
		simulateServer:  true,false // false - the delay is strict, true - the delay varies randomly in the range of 0 - 2*delay
		delay: miliseconds
	}

If there are nested array we may have nested configuration objects defining the nested array. It is optional though. If no configuration object is provided, the root configuration object is used

#### 2. model 

The model can consist of valueDescription or key,valueDescription pairs

The valueDescription is an object with the following structure:

	var metaValue = {
		type: null, // mandatory field. The supported dataTypes are: ["text", "number", "float", "date", "name", "firstName", "lastName", "addressObject", "zip", "country", "city", "address", "email", "ip", "username", "password", "letter", "enum", "bool", "phone", "index", "slugFromText"]
		value: null, // optional, can be used to customize the generate data. Ex: text field
		length: null, // optional, the behavior changes according to the defined data type. if "text", length means number of words, if string - number of chars, if numeric - number digits
		format: null, // optional, customize the outcome of the generated data. Works with dates, phones 
		range: [min, max] // numerics and dates, the date format MUST BE 'D-M-YYY'
		enums: [val1, val2, val3] // optional: array of values. Used by enum
	};

The followinf examples show different structures of the metamodel:

* Generates an array of objects:

```javascript
	var dataModel = {
		config: <configurationObject>,
		model: {
			<field1>: <valueDescription>
			......
			<fieldN>: <valueDescription>
		}
	}
```

* Generates an array of values:

```
	var dataModel = {
		config: <configurationObject>,
		model: {
			<valueDescription>
		}
	}
```

* Generates nested array of values:

```
	var dataModel = {
		config: <configurationObject>
		model: [{
			<field>: [{
				config: <configurationObject>, // optional
				model: {
					<valueDescription>
				}
			}]
		}]
	}
```

* Generates nested array of objects:

```
	var dataModel = {
		config: <configurationObject>
		model: [{
			<field>: [{
				config: <configurationObject>, // optional
				model: {
					<field1>: <valueDescription>
					......
					<fieldN>: <valueDescription>
				}
			}]
		}]
	}
```

* Generates a nested object:

```
	var dataModel = {
		<field>: {
			model: {
				field: <valueDescription>
			}
		}
	}
```



## Examples

### Example of a dataModel using all supported data types

	var dataModel = {
		camelCase: {type: 'camelCasefromText',value: 'this t"e"xt is fo\'r buil_ding a. slug!'},
		slug: {type: 'slugFromText',value: 'this t"e"xt is fo\'r buil_ding a. slug!'},
		id: {type: 'index', value: 4}, // generating indexes with initial value 4
		phone: {type: 'phone',format: '(code) number',}, // code is replaced by a dummy country code, number by the actual number
		flag: { type: 'bool'},
		types: {type: 'enum',enums: ['book','paper','article']},
		randomString: {type: 'letter', length: 15, format: 'luns'}, // l -lowercase, u -uppercase, n -numeric, s - special char
		fullAddress: {type: 'addressObject'}, // Inspired by filltext combines zip, country, city, address in one object, Maybe redundant, because we support nesting
		zip: { type: 'zip' },
		country: {type: 'country'},
		address: {type: 'address'},
		email: {type: 'email'},
		ip: {type: 'ip'}, // generates an ip address of a type x.x.x.x, TODO ipv6 addresses as well as different representations such as hex,ocatal, binary
		username: {type: 'username'},
		txt: {type: 'text', length: 1}, // generate one random word from lorem ipsum, value can be given similar to slug, so it cane outpu a random word fom a given text, 
		number: {type: 'number',length: 5 range: [2*Math.pow(10,5),5*Math.pow(10,5)]},
		floatVal1: {type: 'number',range: [20,50]},
		floatVal2: {type: 'number',length: 2}, // length sets the number of digits after the fraction point
		pass: {	type: 'password', length: 8 },
		date: {	type: 'date',format: 'YYYY-MM-DD',range: ['1-1-2015', '10-2-2015']}, // the given range of dates in the following format D-M-YYY
		firstName: { type: 'firstName' },
		lastName: { type: 'lastName' },
		name: { type: 'name' }, // combines random first and last name
	}

### A real life example 1: Demonstrates nested array of values

		var input = {
			config: {rows:15},
			model: {
				slug: {type: 'slugFromText',length: 3},
				// completed will have one date
				completed: {jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' },
				// scheduled be an array of dates
				scheduled: [{jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' }}]
			}
		}
		JsonGeneratorSvc.generateData(input).then(function (data) {
			console.log(data);
		}, function(err) {
			console.log('Error:', err);
		});


### A real life example 2: Demonstrates nested array of objects

	var input = {
		config: {rows:15},
		model: {
			patientId: {type: 'number',length: 7},
			visits: [{
				config: {rows:4, randomRows: true}, // generates random amount of vists in the range of 0 and 4
				model: {
					index: {type: 'index',value: 1},
					date: {type: 'date'},
					passed: {type: 'bool'},
					paid: {type: 'bool'}
				}
			}]
		}
	}
	JsonGeneratorSvc.generateData(input).then(function (patients) {
		console.log(data);
	}, function(err) {
		console.log('Error:', err);
	});

### A real life example 3: Demonstrate chain of promises

	var loadPrices = function() {
		var input = {
			config: {rows:20,delay: 1000, simulateServer: true},  // the delay will be generated randomly in the range 0-2*delay
			model: {type:'number'}  // just a simple array of values
		}
		return JsonGeneratorSvc.generateData(input).then(function (prices) {
			$scope.prices = prices;
		}, function(err) {
			console.log('Error:', err);
		});
	};

	var loadDates = function () {
		var input = {
			config: {rows:20,delay: 1000, simulateServer: true},  // the delay will be generated randomly in the range 0-2*delay
			model: {date: {type: 'date'}}  // just a simple array of values
		};
		return JsonGeneratorSvc.generateData(input).then(function (dates) {
			$scope.dates = dates;
		}, function(err) {
			console.log('Error:', err);
		});			
	};

	var loaded = function() {
		// after everything is loaded, do something
	}

	loadPrices().then(loadDates).then(loaded);