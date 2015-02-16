# Angular service for generating json data locally 

An angular service, which generates data in json format. 

Inspired by [FillText.com](http://www.filltext.com/)
It is common the development of both(the frontend and the backend) parts of a web app to start and progress simultaneously. This creates an issue. The frontend part requires data and the backend server/service is not ready/implemnted to provide it. As a workaround, multiple json generators such as [FillText.com](http://www.filltext.com/) appear.

Most of those services are external and require connectivity. In order a frontend developer to work, he/she should be connected and the service should be available. This is obviously a limitation. 

With this module we try to remove this limitation for all angular developers. 

The modules can generate both array of values and array of objects. It allows unlimited levels of nested objects as well as nested arrays

## Install

```
bower install git@bitbucket.org:startupcommando/angular-local-json-generator.git
```

But i guess it makes more sense to install it as a development dependency 

```
bower install git@bitbucket.org:startupcommando/angular-local-json-generator.git --save-dev
```
   
## Getting Started

After installing it, make sure to register it in the angular app.
```javascript
	var app = angular.module('myApp', ['angular-local-json-generator']);
``` 
Than use it in an angular service or controller:
```
	var MySvc = function(JsonGenerator) {
	}
	angular.module('myApp').factory('MySvc',['JsonGenerator',MySvc]);

```

The service requires two things:
* configuration object

Here is the structure of the current configuration object:

	var config = {
		rows: 0-n,
		simulateServer:  true,false // false - the delay is strict, true - the delay varies randomly in the range of 0 - 2*delay
		delay: miliseconds
	}

NOTE: Currently the rows define the number of elements generated in an array and will be used for the nested arrays as well. 

* dataModel, which describes the structure of the json data, which is going to be genberated. 

Possible data structures: 

Array of objects:

	var dataMode = {
		<field>: <valueDescription>
	}

or

Array of values:

	var dataMode = {
		<valueDescription>
	}

or

Nested Array of values:

	var dataMode = {
		<field>: [<valueDescription>]
	}

or 

Nested Array of objects:

	var dataMode = {
		<field>: [{
			field: <valueDescription>
		}]
	}

or 

Nested object:

	var dataMode = {
		<field>: {
			field: <valueDescription>
		}
	}


The valueDescription is of a 

	var metaValue = {
		jsonType: null, // mandatory field. The supported dataTypes are: ["text", "number", "float", "date", "name", "firstName", "lastName", "addressObject", "zip", "country", "city", "address", "email", "ip", "username", "password", "letter", "enum", "bool", "phone", "index", "slugFromText"]

		value: null, // optional, can be used to customize the generate data. Ex: text field
		
		length: null, // optional, the behavuiur changes according to which data type is generated. if text, the filld represents the number of words, if string - the number of chars, if numeric - the number digits in the number

		format:null, // optional, customize the outcome of the generated data. Works with dates, phones 

		range: {
			values: null, // optional: array of values. Used by enum
			min: null, // optional: used by numeric datatypes as well as dates
			max: null, // optional: used by numeric datatypes as well as dates
		}
	};

## Examples

*Example of a dataModel using all supported data types

	var dataModel = {
		slug: {jsonType: 'slugFromText',value: 'this t"e"xt is fo\'r buil_ding a. slug!'},
		id: {jsonType: 'index', value: 4}, // generating indexes with initial value 4
		phone: {jsonType: 'phone',format: '(code) number',}, // code is replaced by a dummy country code, number by the actual number
		flag: { jsonType: 'bool'},
		types: {jsonType: 'enum',range: {values: ['book','paper','shit']}},
		randomString: {jsonType: 'letter', length: 15, format: 'luns'}, // l -lowercase, u -uppercase, n -numeric, s - special char
		fullAddress: {jsonType: 'addressObject'}, // Inspied by filltext combines zip, country, city, address in one object, Maybe redundant, because we support nesting
		zip: { jsonType: 'zip' },
		country: {jsonType: 'country'},
		address: {jsonType: 'address'},
		email: {jsonType: 'email'},
		ip: {jsonType: 'ip'}, // generates an ip address of a type x.x.x.x, TODO ipv6 addresses as well as different representations such as hex,ocatal, binary
		username: {jsonType: 'username'},
		txt: {jsonType: 'text', length: 1}, // generate one random word from lorem ipsum, value can be given similar to slug, so it cane outpu a random word fom a given text, 
		number: {jsonType: 'number',length: 5 range: {min: 2*Math.pow(10,5),max:5*Math.pow(10,5)}},
		float: {jsonType: 'number',range: {min: 20,max: 50}},
		pass: {	jsonType: 'password', length: 8 },
		date: {	jsonType: 'date',format: 'YYYY-MM-DD',	range: {min: '1-1-2015',// max: '10-2-2015'}},
		firstName: { jsonType: 'firstName' },
		lastName: { jsonType: 'lastName' },
		name: { jsonType: 'name' }, // combines random first and last name
	}


A real life example: Demonstrates nested array of values

		JsonGeneratorSvc.setConfig({rows:15});
		JsonGeneratorSvc.setDataModel({
			slug: {jsonType: 'slugFromText',length: 3},
			completed: {jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' }, // the field has one date
			scheduled: [{jsonType: 'date',format: 'YYYY-MM-DD',range: { min: '23-5-2005', max: '15-12-2014' }}] // the field is an array of dates
		});
		JsonGeneratorSvc.generateData().then(function (data) {
			console.log(data);
		}, function(err) {
			console.log('Error:', err);
		});


Example 2: Demonstrates nested array of objects

	JsonGeneratorSvc.setConfig({rows:15});
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

Example 3: Demonstrates promise chains

	var loadPrices = function() {
		JsonGeneratorSvc.setConfig({rows:20,delay: 1000, simulateServer: true});
		JsonGeneratorSvc.setDataModel({jsonType:'number'}); // just a simple array of values
		return JsonGeneratorSvc.generateData().then(function (prices) {
			$scope.prices = prices;
		}, function(err) {
			console.log('Error:', err);
		});
	};

	var loadPatients = function () {
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