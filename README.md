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

The module can generate array of values and objects. It allows unlimited levels of nesting.

The module has 3 methods:

* setConfig - sets a configuration object
* setDataModel - defines the data structure: the required fields and their data types
* generateData - obvious

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

The service requires two things:

#### 1. configuration object 

Passed as an argument in the setConfig method. Here is the structure of the current configuration object:

	var config = {
		rows: 0-n,
		randomRows: true,false, // randomize the number of rows. Range 1-n
		simulateServer:  true,false // false - the delay is strict, true - the delay varies randomly in the range of 0 - 2*delay
		delay: miliseconds
	}

NOTE: Currently the rows define the number of elements generated in an array and will be used for the nested arrays as well. 

#### 2. dataModel 

Passed as an argument in setDataModel. It describes the structure of the data, as well as the value types(valueDescription) which are going to be transfomed into json format. Here are some possible dataModel structures:

* Generates an array of objects:

```javascript
	var dataModel = {
		<field>: <valueDescription>
	}
```

* Generates an array of values:

```
	var dataModel = {
		<valueDescription>
	}
```

* Generates nested array of values:

```
	var dataModel = {
		<field>: [<valueDescription>]
	}
```

* Generates nested array of objects:

```
	var dataModel = {
		<field>: [{
			field: <valueDescription>
		}]
	}
```

* Generates a nested object:

```
	var dataModel = {
		<field>: {
			field: <valueDescription>
		}
	}
```

The valueDescription is an object with the following structure:

	var metaValue = {
		jsonType: null, // mandatory field. The supported dataTypes are: ["text", "number", "float", "date", "name", "firstName", "lastName", "addressObject", "zip", "country", "city", "address", "email", "ip", "username", "password", "letter", "enum", "bool", "phone", "index", "slugFromText"]
		value: null, // optional, can be used to customize the generate data. Ex: text field
		length: null, // optional, the behavior changes according to the defined data type. if "text", length means number of words, if string - number of chars, if numeric - number digits
		format: null, // optional, customize the outcome of the generated data. Works with dates, phones 
		range: [min, max] // numerics and dates, the date format MUST BE 'D-M-YYY'
		enums: [val1, val2, val3] // optional: array of values. Used by enum
	};

## Examples

### Example of a dataModel using all supported data types

	var dataModel = {
		slug: {jsonType: 'slugFromText',value: 'this t"e"xt is fo\'r buil_ding a. slug!'},
		id: {jsonType: 'index', value: 4}, // generating indexes with initial value 4
		phone: {jsonType: 'phone',format: '(code) number',}, // code is replaced by a dummy country code, number by the actual number
		flag: { jsonType: 'bool'},
		types: {jsonType: 'enum',enums: ['book','paper','article']},
		randomString: {jsonType: 'letter', length: 15, format: 'luns'}, // l -lowercase, u -uppercase, n -numeric, s - special char
		fullAddress: {jsonType: 'addressObject'}, // Inspired by filltext combines zip, country, city, address in one object, Maybe redundant, because we support nesting
		zip: { jsonType: 'zip' },
		country: {jsonType: 'country'},
		address: {jsonType: 'address'},
		email: {jsonType: 'email'},
		ip: {jsonType: 'ip'}, // generates an ip address of a type x.x.x.x, TODO ipv6 addresses as well as different representations such as hex,ocatal, binary
		username: {jsonType: 'username'},
		txt: {jsonType: 'text', length: 1}, // generate one random word from lorem ipsum, value can be given similar to slug, so it cane outpu a random word fom a given text, 
		number: {jsonType: 'number',length: 5 range: [2*Math.pow(10,5),5*Math.pow(10,5)]},
		floatVal1: {jsonType: 'number',range: [20,50]},
		floatVal2: {jsonType: 'number',length: 2}, // length sets the number of digits after the fraction point
		pass: {	jsonType: 'password', length: 8 },
		date: {	jsonType: 'date',format: 'YYYY-MM-DD',range: ['1-1-2015', '10-2-2015']}, // the given range of dates in the following format D-M-YYY
		firstName: { jsonType: 'firstName' },
		lastName: { jsonType: 'lastName' },
		name: { jsonType: 'name' }, // combines random first and last name
	}

### A real life example 1: Demonstrates nested array of values

		JsonGeneratorSvc.setConfig({rows:15});
		JsonGeneratorSvc.setDataModel({
			slug: {jsonType: 'slugFromText',length: 3},
			// completed will have one date
			completed: {jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' },
			// scheduled be an array of dates
			scheduled: [{jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' }}]
		});
		JsonGeneratorSvc.generateData().then(function (data) {
			console.log(data);
		}, function(err) {
			console.log('Error:', err);
		});


### A real life example 2: Demonstrates nested array of objects

	JsonGeneratorSvc.setConfig({rows:15, randomRows: true}); // the number of rows will be generaed randomly in the range 1-15
	JsonGeneratorSvc.setDataModel({
		patientId: {jsonType: 'number',length: 7},
		visits: [{
			index: {jsonType: 'index',value: 1},
			date: {jsonType: 'date'},
			passed: {jsonType: 'bool'},
			paid: {jsonType: 'bool'}
		}]
	});
	JsonGeneratorSvc.generateData().then(function (patients) {
		console.log(data);
	}, function(err) {
		console.log('Error:', err);
	});

### A real life example 3: Demonstrate chain of promises

	var loadPrices = function() {
		JsonGeneratorSvc.setConfig({rows:20,delay: 1000, simulateServer: true}); // the delay will be generated randomly in the range 0-2*delay
		JsonGeneratorSvc.setDataModel({jsonType:'number'}); // just a simple array of values
		return JsonGeneratorSvc.generateData().then(function (prices) {
			$scope.prices = prices;
		}, function(err) {
			console.log('Error:', err);
		});
	};

	var loadDates = function () {
		JsonGeneratorSvc.setConfig({rows:15});
		JsonGeneratorSvc.setDataModel({
			date: {jsonType: 'date'},
		});
		return JsonGeneratorSvc.generateData().then(function (dates) {
			$scope.dates = dates;
		}, function(err) {
			console.log('Error:', err);
		});			
	};

	var loaded = function() {
		// after everything is loaded, do something
	}

	loadPrices().then(loadDates).then(loaded);