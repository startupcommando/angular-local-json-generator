/* Example modelValue which should be passed to setDataModel
	{
		slug: {jsonType: 'slugFromText',value: 'this t"e"xt is fo\'r buil_ding a. slug!'},
		id: {jsonType: 'index', value: 4},
		phone: {jsonType: 'phone',format: '(code) number',}, // code is replaced by a dummy country code, number by the actual number
		flag: { jsonType: 'bool'},
		types: {jsonType: 'enum',range: {values: ['book','paper','shit']}},
		randomString: {jsonType: 'letter', length: 15, format: 'luns'}, // l -lowercase, u -uppercase, n -numeric, s - special char
		fullAddress: {jsonType: 'addressObject'}, // combines zip, country, city, address in one object, Mabe not needed after we create nesting
		zip: { jsonType: 'zip' },
		country: {jsonType: 'country'},
		address: {jsonType: 'address'},
		email: {jsonType: 'email'},
		ip: {jsonType: 'ip'},
		username: {jsonType: 'username'},
		txt: {jsonType: 'text',length: 1},
		number: {jsonType: 'number',length: 5 range: {min: 2*Math.pow(10,5),max:5*Math.pow(10,5)}},
		float: {jsonType: 'number',range: {min: 20,max: 50}},
		pass: {	jsonType: 'password', length: 8 },
		date: {	jsonType: 'date',format: 'YYYY-MM-DD',	range: {min: '1-1-2015',// max: '10-2-2015'}},
		firstName: { jsonType: 'firstName' },
		lastName: { jsonType: 'lastName' },
		name: { jsonType: 'name' }, // combines random first and last name
	}
*/

(function(window, angular, moment , _){
	'use strict';

	if(!angular) {
		console.log('angularjs is required');
		return;		
	} else if(!moment) {
		console.log('momentjs is required');
		return;		
	} else if (!_) {
		console.log('lodash is required');
		return;		
	}

	angular.module('angular-local-json-generator',[]).factory('JsonGenerator',['$q',function($q) {
		var dataModel = null, generatedData = [];
		var errMsg = 'Error: ';
		var config = null;
/* 
Example for the config object
		config = {
			rows: 1-n,
			randomRows: true,false, // randomize the number of rows. Range 1-n
			simulateServer:  true,false // false - the delay is strict, true - the delay varies randomly in the range of 0 - 2*delay
			delay: miliseconds
		}

Example of dataModel values. different generators support different fields. All of them require type
		var metaValue = {
			jsonType: null,
			value: null,
			length: null, // for strings
			format:null, // this is a text indicating a patter, used with dates
			// regexFormat:null, // if the string should pass a specific regular expression
			range: {
				values: null, // if exact number of values are given
				min: null, 
				max: null,
			}
		};
*/
		var specials = '!@#$%^&*()_+{}:"<>?\|[];\',./`~';
		var lowercase = 'abcdefghijklmnopqrstuvwxyz';
		var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var numbers = '0123456789';

		//NOTE: globalTemp this is used by all typeProcessing methods to preserve data while an 
		// external(outside of the service) iteration is in progress. Example for such method is index. 
		// A way to use it: 
		// If a method requires for some reason global variablr, it should create its own attribute in 
		// globalTemp. The method then can assign anything to that attribute. 
		var globalTemp = {}; 

		var typeProcessing = {
			text: function(modelValue) {
				var text = null, length=null;
				if(typeof modelValue.value === 'string') {
					text = modelValue.value;
				} else {
					text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
				}
				var txtArr = text.toLowerCase().split(' ');

				length = parseInt(modelValue.length);
				if(isNaN(length) || length <= 0 || length > txtArr.length) {
					length = txtArr.length;
				}
				
				text = '';
				for(var i=0; i<length; i+=1) {
					text += ' '+txtArr[Math.floor(Math.random()*txtArr.length)];
				}

				return text.substr(1); // remove the leading space
			},
			number: function(modelValue) {
				var min = null, max = null, i = 0;
				var baseMin = 1, baseMax = '9';
				if(modelValue.range && !isNaN(parseInt(modelValue.range.min))) {
					min = parseInt(modelValue.range.min);
				} else {
					min = 0;
				}
				if(modelValue.range && !isNaN(parseInt(modelValue.range.max))) {
					max = parseInt(modelValue.range.max);
				} else {
					max = 1000;
				}
				if(modelValue.length) {
					baseMin = Math.pow(10,modelValue.length-1);
					for(i;i<modelValue.length-1;i += 1) {
						baseMax += '9';
					}
					baseMax = parseInt(baseMax);
					// console.log(baseMin,baseMax);
					if(min < baseMin) { min = baseMin; }
					if(max < baseMin || max > baseMax) { max = baseMax; }
					// console.log(min,max);
				}

				return Math.floor(Math.random() * (max - min)) + min;
			},
			float: function(modelValue) {
				var min = null, max = null;
				if(modelValue.range && !isNaN(parseInt(modelValue.range.min))) {
					min = parseInt(modelValue.range.min);
				} else {
					min = 0;
				}
				if(modelValue.range && !isNaN(parseInt(modelValue.range.max))) {
					max = parseInt(modelValue.range.max);
				} else {
					max = 1000;
				}
				return Math.random() * (max - min) + min;
			},
			date: function(modelValue) {				
				var min = 1, max = 0;
				var fmt = '';
				if(typeof modelValue.format === 'string') {
					fmt = modelValue.format;
				}
				if(modelValue.range && modelValue.range.min && typeof modelValue.range.min === 'string') {
					min = moment(modelValue.range.min,'D-M-YYYY').isValid?moment(modelValue.range.min,'D-M-YYYY').unix():0;
					if(!min) {
						return 'Invalid date. range.min. The format should be D-M-YYYY';
					}
				} else {
					min = 1;
				}
				if(modelValue.range && modelValue.range.max && typeof modelValue.range.max === 'string') {
					max = moment(modelValue.range.max,'D-M-YYYY').isValid?moment(modelValue.range.max,'D-M-YYYY').unix():moment().unix();
					if(!max) {
						return 'Invalid date. range.max. The format should be D-M-YYYY';
					}
				} else {
					max = moment().unix(); // get now as max
				}
				// substitude if max is less then min and use only max
				if(max < min) {
					max = min; min = 1;
				}

				return moment.unix(min + Math.floor(Math.random() * (max - min))).format(fmt);
			},
			name: function() {
				var fname = this.firstName(), lname = this.lastName();
				if(!fname || !lname) {
					return; // return undefined
				}
				return fname+' '+lname;
			},
			firstName: function() {
				var names = [
					'Grover','Tommy','Kris','Wes','Walker','Mckinley','Truman','Carol','Darron','Tristan','Otha','Wesley','Jordan','Ted',
					'Hector','Trinidad','Christian','Lanny','Israel','Roland','Wilber','Shelton','Tuan','Bennett','Keven','Sang','Hosea','Arnold',
					'Basil','Garland','Wilbur','Kendrick','Santiago','Sammie','Humberto','Darrel','Russel','Freddie','Elvin','Samual',
					'Lindsay','Rigoberto','Quintin','Harold','Bennie','Bert','Lamar','Benito','Leonardo','Dean','Kallie','Shonda','Scarlet',
					'Ute','Alida','Karla','Clementina','Alicia','Jane','Angie','Dorene','Damaris','Trinity','Laverna','Jaimie','Athena','Sylvia',
					'Berta','Contessa','Delaine','Launa','Katherin','Krystal','Chia','Maida','Bettina','Mitsue','Krista','Eilene','Mamie','Karren',
					'Tuyet','Julie','Loreen','Irmgard','Cherlyn','Lisbeth','Miriam','Fern','Farah','Marcene','Natacha','Carman','Laure',
					'Laronda','Penny','Isabelle','Aleta','Corinne','Hui'];
				return names[Math.floor(Math.random()*names.length)];
			},
			lastName: function() {
				var names = [ 'Abraham','Allan','Alsop','Anderson','Arnold','Avery','Bailey','Baker','Ball','Bell','Berry','Black','Blake','Bond','Bower',
					'Brown','Buckland','Burgess','Butler','Cameron','Campbell','Carr','Chapman','Churchill','Clark','Clarkson','Coleman','Cornish',
					'Davidson','Davies','Dickens','Dowd','Duncan','Dyer','Edmunds','Ellison','Ferguson','Fisher','Forsyth','Fraser','Gibson','Gill','Glover',
					'Graham','Grant','Gray','Greene','Hamilton','Hardacre','Harris','Hart','Hemmings','Henderson','Hill','Hodges','Howard','Hudson',
					'Hughes','Hunter','Ince','Jackson','James','Johnston','Jones','Kelly','Kerr','King','Knox','Lambert','Langdon','Lawrence','Lee','Lewis',
					'Lyman','MacDonald','Mackay','Mackenzie','MacLeod','Manning','Marshall','Martin','Mathis','May','McDonald','McLean','McGrath','Metcalfe',
					'Miller','Mills','Mitchell','Morgan','Morrison','Murray','Nash','Newman','Nolan','North','Ogden','Oliver','Paige','Parr','Parsons','Paterson',
					'Payne','Peake','Peters','Piper','Poole','Powell','Pullman','Quinn','Rampling','Randall','Rees','Reid','Roberts','Robertson','Ross','Russell',
					'Rutherford','Sanderson','Scott','Sharp','Short','Simpson','Skinner','Slater','Smith','Springer','Stewart','Sutherland','Taylor','Terry',
					'Thomson','Tucker','Turner','Underwood','Vance','Vaughan','Walker','Wallace','Walsh','Watson','Welch','White','Wilkins','Wilson','Wright','Young'];
				return names[Math.floor(Math.random()*names.length)];
			},
			addressObject: function () {
				// inspired by filltext
				var result = {
					country: this.country(),
					city: this.city(),
					address: this.address(),
					zip: this.zip()
				};

				return result;
			},
			zip: function() {
				return Math.floor(1000 + Math.random()*(9999-1000));
			},
			country: function () {
				var countries = ['AF|Afghanistan','AL|Albania','DZ|Algeria','AS|American Samoa','AD|Andorra','AO|Angola','AI|Anguilla','AQ|Antarctica',
					'AG|Antigua And Barbuda','AR|Argentina','AM|Armenia','AW|Aruba','AU|Australia','AT|Austria','AZ|Azerbaijan','BS|Bahamas','BH|Bahrain',
					'BD|Bangladesh','BB|Barbados','BY|Belarus','BE|Belgium','BZ|Belize','BJ|Benin','BM|Bermuda','BT|Bhutan','BO|Bolivia','BA|Bosnia And Herzegovina',
					'BW|Botswana','BV|Bouvet Island','BR|Brazil','IO|British Indian Ocean Territory','BN|Brunei Darussalam','BG|Bulgaria','BF|Burkina Faso','BI|Burundi',
					'KH|Cambodia','CM|Cameroon','CA|Canada','CV|Cape Verde','KY|Cayman Islands','CF|Central African Republic','TD|Chad','CL|Chile','CN|China',
					'CX|Christmas Island','CC|Cocos (keeling) Islands','CO|Colombia','KM|Comoros','CG|Congo','CD|Congo, The Democratic Republic Of The',
					'CK|Cook Islands','CR|Costa Rica','CI|Cote D\'ivoire','HR|Croatia','CU|Cuba','CY|Cyprus','CZ|Czech Republic','DK|Denmark','DJ|Djibouti','DM|Dominica',
					'DO|Dominican Republic','TP|East Timor','EC|Ecuador','EG|Egypt','SV|El Salvador','GQ|Equatorial Guinea','ER|Eritrea','EE|Estonia','ET|Ethiopia',
					'FK|Falkland Islands (malvinas)','FO|Faroe Islands','FJ|Fiji','FI|Finland','FR|France','GF|French Guiana','PF|French Polynesia','TF|French Southern Territories',
					'GA|Gabon','GM|Gambia','GE|Georgia','DE|Germany','GH|Ghana','GI|Gibraltar','GR|Greece','GL|Greenland','GD|Grenada','GP|Guadeloupe','GU|Guam',
					'GT|Guatemala','GN|Guinea','GW|Guinea-bissau','GY|Guyana','HT|Haiti','HM|Heard Island And Mcdonald Islands','VA|Holy See (vatican City State)',
					'HN|Honduras','HK|Hong Kong','HU|Hungary','IS|Iceland','IN|India','ID|Indonesia','IR|Iran, Islamic Republic Of','IQ|Iraq','IE|Ireland','IL|Israel','IT|Italy',
					'JM|Jamaica','JP|Japan','JO|Jordan','KZ|Kazakstan','KE|Kenya','KI|Kiribati','KP|Korea, Democratic People\'s Republic Of','KR|Korea, Republic Of',
					'KV|Kosovo','KW|Kuwait','KG|Kyrgyzstan','LA|Lao People\'s Democratic Republic','LV|Latvia','LB|Lebanon','LS|Lesotho','LR|Liberia',
					'LY|Libyan Arab Jamahiriya','LI|Liechtenstein','LT|Lithuania','LU|Luxembourg','MO|Macau','MK|Macedonia, The Former Yugoslav Republic Of',
					'MG|Madagascar','MW|Malawi','MY|Malaysia','MV|Maldives','ML|Mali','MT|Malta','MH|Marshall Islands','MQ|Martinique','MR|Mauritania','MU|Mauritius',
					'YT|Mayotte','MX|Mexico','FM|Micronesia, Federated States Of','MD|Moldova, Republic Of','MC|Monaco','MN|Mongolia','MS|Montserrat','ME|Montenegro',
					'MA|Morocco','MZ|Mozambique','MM|Myanmar','NA|Namibia','NR|Nauru','NP|Nepal','NL|Netherlands','AN|Netherlands Antilles','NC|New Caledonia',
					'NZ|New Zealand','NI|Nicaragua','NE|Niger','NG|Nigeria','NU|Niue','NF|Norfolk Island','MP|Northern Mariana Islands','NO|Norway','OM|Oman','PK|Pakistan',
					'PW|Palau','PS|Palestinian Territory, Occupied','PA|Panama','PG|Papua New Guinea','PY|Paraguay','PE|Peru','PH|Philippines','PN|Pitcairn','PL|Poland',
					'PT|Portugal','PR|Puerto Rico','QA|Qatar','RE|Reunion','RO|Romania','RU|Russian Federation','RW|Rwanda','SH|Saint Helena','KN|Saint Kitts And Nevis',
					'LC|Saint Lucia','PM|Saint Pierre And Miquelon','VC|Saint Vincent And The Grenadines','WS|Samoa','SM|San Marino','ST|Sao Tome And Principe',
					'SA|Saudi Arabia','SN|Senegal','RS|Serbia','SC|Seychelles','SL|Sierra Leone','SG|Singapore','SK|Slovakia','SI|Slovenia','SB|Solomon Islands','SO|Somalia',
					'ZA|South Africa','GS|South Georgia And The South Sandwich Islands','ES|Spain','LK|Sri Lanka','SD|Sudan','SR|Suriname','SJ|Svalbard And Jan Mayen',
					'SZ|Swaziland','SE|Sweden','CH|Switzerland','SY|Syrian Arab Republic','TW|Taiwan, Province Of China','TJ|Tajikistan','TZ|Tanzania, United Republic Of',
					'TH|Thailand','TG|Togo','TK|Tokelau','TO|Tonga','TT|Trinidad And Tobago','TN|Tunisia','TR|Turkey','TM|Turkmenistan','TC|Turks And Caicos Islands',
					'TV|Tuvalu','UG|Uganda','UA|Ukraine','AE|United Arab Emirates','GB|United Kingdom','US|United States','UM|United States Minor Outlying Islands',
					'UY|Uruguay','UZ|Uzbekistan','VU|Vanuatu','VE|Venezuela','VN|Viet Nam','VG|Virgin Islands, British','VI|Virgin Islands, U.s.','WF|Wallis And Futuna',
					'EH|Western Sahara','YE|Yemen','ZM|Zambia','ZW|Zimbabwe'];
				return countries[Math.floor(Math.random()*countries.length)].substr(3);
			},
			city: function () {
				// TODO according to the country
				var cities = ['Hargeisa','King Edward Point','Port-aux-Français','Jerusalem','Mariehamn','Yaren','Marigot','Atafu',
					'El-Aaiún','Kabul','Tirana','Algiers','Pago Pago','Andorra la Vella','Luanda','The Valley','Saint John\'s','Buenos Aires',
					'Yerevan','Oranjestad','Canberra','Vienna','Baku','Nassau','Manama','Dhaka','Bridgetown','Minsk','Brussels','Belmopan',
					'Porto-Novo','Hamilton','Thimphu','La Paz','Sarajevo','Gaborone','Brasilia','Road Town','Bandar Seri Begawan','Sofia',
					'Ouagadougou','Rangoon','Bujumbura','Phnom Penh','Yaounde','Ottawa','Praia','George Town','Bangui','N\'Djamena',
					'Santiago','Beijing','West Island','Bogota','Moroni','Kinshasa','Brazzaville','Avarua','San Jose','Yamoussoukro','Zagreb',
					'Havana','Willemstad','Nicosia','Prague','Copenhagen','Djibouti','Roseau','Santo Domingo','Quito','Cairo','San Salvador',
					'Malabo','Asmara','Tallinn','Addis Ababa','Stanley','Torshavn','Suva','Helsinki','Paris','Papeete','Libreville','Banjul','Tbilisi',
					'Berlin','Accra','Gibraltar','Athens','Nuuk','Saint George\'s','Hagatna','Guatemala City','Saint Peter Port','Conakry','Bissau',
					'Georgetown','Port-au-Prince','Vatican City','Tegucigalpa','Budapest','Reykjavik','New Delhi','Jakarta','Tehran','Baghdad',
					'Dublin','Douglas','Jerusalem','Rome','Kingston','Tokyo','Saint Helier','Amman','Astana','Nairobi','Tarawa','Pyongyang',
					'Seoul','Pristina','Kuwait City','Bishkek','Vientiane','Riga','Beirut','Maseru','Monrovia','Tripoli','Vaduz','Vilnius','Luxembourg',
					'Skopje','Antananarivo','Lilongwe','Kuala Lumpur','Male','Bamako','Valletta','Majuro','Nouakchott','Port Louis','Mexico City',
					'Palikir','Chisinau','Monaco','Ulaanbaatar','Podgorica','Plymouth','Rabat','Maputo','Windhoek','Kathmandu','Amsterdam',
					'Noumea','Wellington','Managua','Niamey','Abuja','Alofi','Kingston','Saipan','Oslo','Muscat','Islamabad','Melekeok',
					'Panama City','Port Moresby','Asuncion','Lima','Manila','Adamstown','Warsaw','Lisbon','San Juan','Doha','Bucharest','Moscow',
					'Kigali','Gustavia','Jamestown','Basseterre','Castries','Kingstown','Apia','San Marino','Sao Tome','Riyadh','Dakar','Belgrade',
					'Victoria','Freetown','Singapore','Philipsburg','Bratislava','Ljubljana','Honiara','Mogadishu','Pretoria','Juba','Madrid','Colombo',
					'Khartoum','Paramaribo','Longyearbyen','Mbabane','Stockholm','Bern','Damascus','Taipei','Dushanbe','Dar es Salaam',
					'Bangkok','Dili','Lome','Nuku\'alofa','Tunis','Ankara','Ashgabat','Grand Turk','Funafuti','Kampala','Kyiv','Abu Dhabi','London',
					'Washington','Montevideo','Tashkent','Port-Vila','Caracas','Hanoi','Charlotte Amalie','Mata-Utu','Sanaa','Lusaka','Harare',
					'Washington','North Nicosia','Diego Garcia'];
				return cities[Math.floor(Math.random()*cities.length)];
			},
			address: function() {
				var lname = this.lastName();
				return lname+' str. '+Math.floor(Math.random()*299);
			},
			email: function() {
				var domains = ['dummy.com','dummy1.com','dummy2.com','dummy3.com','dummy4.com','dummy5.com'];
				var username = this.username();
				return username+'@'+domains[Math.floor(Math.random()*domains.length)];
			},
			ip:function(modelValue) {
				// TODO validate generated ip
				// TODO format return in binary, octal, hex , digits
				var fmt = 'd', result;
				if(modelValue.format) {
					fmt = modelValue.format;
				}
				switch(fmt) {
					case 'd':
						result = Math.floor(Math.random() * (255))+'.'+
							Math.floor(Math.random() * (255))+'.'+
							Math.floor(Math.random() * (255))+'.'+
							Math.floor(Math.random() * (255));
						break;
					case 'x':
					case 'o':
					case 'b':
					break;
				}

				return result;
			},
			username:function() {
				var fname = this.firstName(), lname = this.lastName();
				if(!fname || !lname) {
					return;
				}
				return (fname.charAt(0) + lname).toLowerCase();
			},
			password: function (modelValue) {
				var length = 10; 
				if(!modelValue.length || isNaN(parseInt(modelValue.length))) {
					modelValue.length = length;
				}
				modelValue.format  = null; // this makes sure we use all symbols that are: lower, upper case, numeric and special
				return this.letter(modelValue); 
			},
			letter: function(modelValue) {
				var length = 100,fmt = 'luns'; // all symbols that are: lower, upper case, numeric and special
				var result;
				if(modelValue.length && !isNaN(parseInt(modelValue.length))) {
					length = modelValue.format (modelValue.length);
				}
				var charTypes = [];
				if(modelValue.format && typeof modelValue.format === 'string') {
					fmt = modelValue.format.toLowerCase();
				}

				if(fmt.indexOf('l') > -1) { // uppercase chars included
					charTypes.push(lowercase);
				}
				if(fmt.indexOf('u') > -1) { // uppercase chars included
					charTypes.push(uppercase);
				}
				if(fmt.indexOf('n') > -1) { // numbers included
					charTypes.push(numbers);
				}
				if(fmt.indexOf('s') > -1) { // symbols included
					charTypes.push(specials);
				}

				if(charTypes.length > 0) {
					result = '';
				}
				for(var i = 0; i < length; i += 1) {
					var randomType = charTypes[Math.floor(Math.random()*(charTypes.length))];
					result = result += randomType.charAt(Math.floor(Math.random()*(randomType.length)));
				}
				return result;
			},
			enum: function (modelValue) {
				if(!modelValue.range || !modelValue.range.values || !(modelValue.range.values instanceof Array)) {
					return;
				}
				var enumArr = modelValue.range.values.slice(); // copy the values to be picked from
				return enumArr[Math.floor(Math.random()*(enumArr.length))];
			},
			bool: function() {
				return Math.random()<0.5;
			},
			phone: function (modelValue) {
				var i;
				var phone,codeDigits,base,max,code,number; // undefined intenionally
				var fmt = '+code number';
				if(modelValue.format && typeof modelValue.format === 'string') {
					fmt = modelValue.format;
				}

				//  calculate the country code
				codeDigits = Math.floor(Math.random()*3); // randomly get the number of code digists
				base = Math.pow(10,codeDigits);
				max = '9';
				for (i = 0; i<codeDigits; i += 1) {
					max += '9';
				}
				max = parseInt(max);
				code = base+Math.floor(Math.random()*(max - base));

				// calculate the phoneitself 
				codeDigits = 6 + Math.floor(Math.random()*(9-6));
				base = Math.pow(10,codeDigits);
				max = '9';
				for (i = 0; i<codeDigits; i += 1) {
					max += '9';
				}
				max = parseInt(max);
				number = base+Math.floor(Math.random()*(max - base));

				// build the phone from the format patter
				phone = fmt;
				phone = phone.replace('code',code+'');
				phone = phone.replace('number',number);

				return phone;
			},
			index: function(modelValue) {
				if(globalTemp.index || globalTemp.index >= 0) {
					globalTemp.index += 1;
				} else {
					globalTemp.index = 0;					
					if(!isNaN(parseInt(modelValue.value))) {
						globalTemp.index = modelValue.value;
					}
				}

				return globalTemp.index;
			},
			slugFromText: function(modelValue) {
				var firstWord = true, text  = this.text(modelValue);
				text = text.replace(/\w\S*/g, function(txt){
					if(firstWord) {
						firstWord = false;
						return txt;
					} else {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					}
				}) // capitalize the first leter of every word except for the first word
				.replace(/\s+/g, ''); // remove the spaces

				// TODO removal of the special characters
				// console.log(specials);
				for(var i = text.length-1; i >= 0; i -= 1) {
					if(specials.indexOf(text.charAt(i)) > -1) {
						text = text.slice(0, i) + text.slice(i+1);
					}
				}

				// console.log(text);
				return text;
			}
		};

		var generateObjectValues = function(obj) {
			var modelValue = null;
			var result = {};
			for(var key in obj) {
				modelValue = obj[key];
				if(modelValue && !modelValue.jsonType && modelValue instanceof Array)
				{
					// console.log('TODO Nested arrays');
					result[key] = generateArray(modelValue[0]);
				} else {
					if(modelValue && !modelValue.jsonType && typeof modelValue === 'object') {
						// console.log('Nested object');
						result[key] = generateObjectValues(modelValue);
					}
				}
				if(typeof modelValue === 'string') {
					// TODO maybe create some sort of string like DSL to describe data model
					// currently the data model should be a json structure 
					// inspired by  filltext like definition: http://www.filltext.com/
					// modelValue = translateModelValue(modelValue); // TODO
				}
				if(typeof modelValue === 'object' && 
					typeof modelValue.jsonType === 'string' &&
					typeProcessing.hasOwnProperty(modelValue.jsonType) &&
					typeof typeProcessing[modelValue.jsonType] === 'function') {
						result[key] = typeProcessing[modelValue.jsonType](modelValue);
				}
			}
			// returns null if result is an empty object
			return (Object.getOwnPropertyNames(result).length!==0)?result:null;
		};

		var generateArrayValue = function(obj) {
			if(typeof obj === 'object' && 
				typeof obj.jsonType === 'string' &&
				typeProcessing.hasOwnProperty(obj.jsonType) &&
				typeof typeProcessing[obj.jsonType] === 'function') {
					return typeProcessing[obj.jsonType](obj);
			}
		};

		var generateArray = function(obj) {
			var result = [], rows = config.rows;

			if(config.randomRows) {
				rows = 1+Math.floor(Math.random()*(config.rows - 1));
			}
			for(var idx=0; idx < rows; idx += 1) {
				if(obj.jsonType) {
					result[idx] = generateArrayValue(obj);
				} else {
					result[idx] = generateObjectValues(obj);
				}
				if(typeof result[idx] === 'undefined') {
					errMsg = errMsg+='Unable to generate a value with index '+idx;
					return;
				}
			}
			return result;
		};

		var self = {
			setDataModel: function (dm) {
				dataModel = _.clone(dm);
				// if the dataModel is set/reset, then if not empty reset the generatedData
				if(generatedData.length > 0) {
					generatedData.length = 0;
				}
			},
			setConfig: function (configObj) {
				if(isNaN(parseInt(configObj.rows)) || configObj.rows <= 0) {
					errMsg = errMsg += 'Provide correct number of rows.';
					return false;
				}
				config = _.clone(configObj);
				// if the config is set/reset, then if not empty reset the generatedData
				if(generatedData.length > 0) {
					generatedData.length = 0;
				}
				return true;
			},
			generateData: function() {
				var deferred = $q.defer();
				var delay = 0;
				// console.log('Supported generators:', Object.getOwnPropertyNames(typeProcessing));
				if(!config) {
					errMsg = errMsg+='Missing configuration.';
					deferred.reject(errMsg);
				}
				if(!dataModel || typeof dataModel !== 'object') {
					errMsg = errMsg+='Empty data model.';
					deferred.reject(errMsg);
				}
				var goGenerate = function() {
					generatedData = _.clone(dataModel);
					generatedData = generateArray(generatedData);
					if(generatedData) {
						deferred.resolve(generatedData);
					} else {
						deferred.reject(errMsg);
					}					
				};
				if(config.delay) {
					if(config.simulateServer) {
						var delayMin = delay, delayMax = 2*config.delay;
						delay = delayMin + Math.floor(Math.random()*(delayMax - delayMin));
					} else {
						delay = config.delay;
					}
				}
				if(delay) {
					setTimeout(function() {
						deferred.notify('Delayed generation with '+delay+'ms.');
						// console.log('Delayed generation with '+delay+'ms.');
						goGenerate();
					}, delay);					
				} else {
					goGenerate();
				}
				return deferred.promise;
			}
		};
		return self;
	}]);
})( window, window.angular, window.moment, window._ );