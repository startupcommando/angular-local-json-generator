/* Example modelValue which should be passed to setDataModel
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
		country: {type: 'country', format: 'abbr'}, // if abbr, the result is the country's abbreviation
		state: {type: 'usState', format: 'abbr'}, // if abbr, the result is the state's abbreviation
		company: {type: 'company', format: 'us' } // format takes an abbreviation of a country and a company for the country is generated, supported: us, de, bg
		address: {type: 'address'},
		email: {type: 'email'},
		ip: {type: 'ip'}, // generates an ip address of a type x.x.x.x, TODO ipv6 addresses as well as different representations such as hex,ocatal, binary
		username: {type: 'username'},
		txt: {type: 'text', length: 1, randomize: true}, // generate one random word from lorem ipsum, value can be given similar to slug, so it cane outpu a random word fom a given text, 
		number: {type: 'number',length: 5 range: [2*Math.pow(10,5),5*Math.pow(10,5)]},
		floatVal1: {type: 'number',range: [20,50]},
		floatVal2: {type: 'number',length: 2}, // length sets the number of digits after the fraction point
		pass: {	type: 'password', length: 8 },
		date: {	type: 'date',format: 'YYYY-MM-DD',range: ['1-1-2015', '10-2-2015']}, // the given range of dates in the following format D-M-YYY
		firstName: { type: 'firstName' },
		lastName: { type: 'lastName' },
		name: { type: 'name' }, // combines random first and last name
		ccType: {type: 'ccType'} // supported ['american express', 'discover', 'mastercard', 'visa', 'Diners Club', 'jcb', 'voyager']
		cc: { type: 'ccNumber', format: 'american express' }, // generates cc number according to a given type
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
		var globalCfg = null;
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
			type: null,
			value: null, 
			length: null, // for strings and numerics
			format:null, // this is a text indicating a patter, used with dates
			range: [min, max] // numerics and dates, the date format MUST BE 'D-M-YYY'
			enums: [val1, val2, val3] // enum uses that 
		};
*/
		var specials = '!@#$%^&*()_+{}:"<>?\|[];\',./`~';
		var lowercase = 'abcdefghijklmnopqrstuvwxyz';
		var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var numbers = '0123456789';
		var removeSpecialChars = function(text,what) {
			// console.log(specials, what);
			var chars = '';
			what = what.toLowerCase();
			// console.log('what: ',what);
			if(what.indexOf('l') > -1) {
				chars += lowercase;
			}
			if(what.indexOf('u') > -1) {
				chars += uppercase;
			}
			if(what.indexOf('n') > -1) {
				chars += numbers;
			}
			if(what.indexOf('s') > -1) {
				chars += specials;
			}
			// console.log('chars: ',chars);

			for(var i = text.length-1; i >= 0; i -= 1) {
				if(chars.indexOf(text.charAt(i)) > -1) {
					// console.log('Removed special char:',text.charAt(i));
					text = text.slice(0, i) + text.slice(i+1);
				}
			}
			return text;
		};

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
				text = removeSpecialChars(text,'s');
				var txtArr = text.toLowerCase().split(' ');
				txtArr = txtArr.filter(function(n){ 
					return n !== undefined && n !== '';
				}); 

				length = parseInt(modelValue.length);
				if(isNaN(length) || length <= 0 || length > txtArr.length) {
					length = txtArr.length;
				}
				if(modelValue.randomize === true) {
					length = Math.floor(Math.random()*(length-1)) + 1;
				}
				
				text = '';
				for(var i=0; i<length; i+=1) {
					text += ' '+txtArr[Math.floor(Math.random()*txtArr.length)];
				}

				return text.substr(1); // remove the leading space
			},
			number: function(modelValue) {
				var min = null, max = null, i = 0,tmp;
				var baseMin = 1, baseMax = '9';
				if (modelValue.range && modelValue.range instanceof Array) {
					min = modelValue.range[0];max = modelValue.range[1];
				}

				if(!isNaN(parseInt(min))) {
					min = parseInt(min);
				} else {
					min = 0;
				}

				if(!isNaN(parseInt(max))) {
					max = parseInt(max);
				} else {
					max = 1000;
				}
				if(min > max) { // substitude the values
					tmp = min; min = max; max = tmp; 
				}

				if(!isNaN(parseInt(modelValue.length))) {
					if(modelValue.randomize === true) {
						modelValue.length = Math.floor(Math.random()*(modelValue.length-1)) + 1;
					}
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
				// TODO length for controling the number of digits after the ,
				var min = null, max = null,tmp,result=null;
				var fractionPart = 1;
				if (modelValue.range && modelValue.range instanceof Array) {
					min = modelValue.range[0];max = modelValue.range[1];
				}

				if(!isNaN(parseFloat(min))) {
					min = parseFloat(min);
				} else {
					min = 0;
				}

				if(!isNaN(parseFloat(max))) {
					max = parseFloat(max);
				} else {
					max = 1000;
				}
				if(min > max) { // substitude the values
					tmp = min; min = max; max = tmp; 
				}
				result = Math.random() * (max - min) + min;
				if(!isNaN(parseFloat(modelValue.length))) { // cut the float numer after the fraction point to the length
					if(modelValue.randomize === true) {
						modelValue.length = Math.floor(Math.random()*(modelValue.length-1)) + 1;
					}
					fractionPart = Math.pow(10,modelValue.length);
					result = parseInt(result*fractionPart)/fractionPart;
				}					
				return result;
			},
			date: function(modelValue) {				
				var min = 1, max = moment().unix(),tmp;
				var fmt = '';
				if(typeof modelValue.format === 'string') {
					fmt = modelValue.format;
				}
				if(modelValue.range && typeof modelValue.range[0] === 'string' && modelValue.range[0].length > 0) {
					min = moment(modelValue.range[0],'D-M-YYYY').isValid?moment(modelValue.range[0],'D-M-YYYY').unix():1;
				}

				if(modelValue.range && typeof modelValue.range[1] === 'string' && modelValue.range[1].length > 0) {
					max = moment(modelValue.range[1],'D-M-YYYY').isValid?moment(modelValue.range[1],'D-M-YYYY').unix():moment().unix();
				}
				// substitude if max is less then min and use only max
				if(max < min) {
					tmp = max; max = min; min = tmp;
				}

				return moment.unix(min + Math.floor(Math.random() * (max - min))).format(fmt);
			},
			ccType: function (){
				var types = ['american express', 'discover', 'mastercard', 'visa', 'Diners Club', 'jcb', 'voyager'];
				return types[Math.floor(Math.random()*types.length)];
			},
			ccNumber: function (modelValue){
				var ccPrefixes = {
					'american express': {prefixes: ['34','37'],length: [15, 15]},
					'discover': {prefixes: ['6011', '644', '645', '646', '647', '648', '649', '65'],length: [16, 16]},
					'mastercard': {	prefixes: ['51','52','53','54','55'],length: [16, 16]},
					'visa': {	prefixes: ['4539','4556','4916','4532','4929','40240071','4485','4716','4'],length: [13, 16]},
					'Diners Club': {prefixes: ['300','301','302','303','36'],length: [14, 14]},
					'enRoute': {prefixes: ['2014','2149'],length: [16, 16]},
					'jcb': {prefixes: ['3528', 3589],	length: [16, 16]},
					'voyager': {prefixes: ['8699'],length: [16, 16]}
				};
				var ccType, prefixArr, length;

				ccType = modelValue.format;
				if(typeof ccType === 'string' && ccPrefixes[ccType].prefixes instanceof Array) {
					prefixArr = ccPrefixes[modelValue.format].prefixes;
					length = Math.floor(Math.random() * (ccPrefixes[ccType].length[1] - ccPrefixes[ccType].length[0])) + ccPrefixes[ccType].length[0];
				} else {
					ccType = this.ccType();
					ccType = 'mastercard';
				 	prefixArr = ccPrefixes[ccType].prefixes;
					length = Math.floor(Math.random() * (ccPrefixes[ccType].length[1] - ccPrefixes[ccType].length[0])) + ccPrefixes[ccType].length[0];
				}
				// console.log(ccType,prefixArr,length);

				// The next is taken and modified from https://github.com/grahamking/darkcoding-credit-card/blob/master/gencc.js
				function strrev(str) {
					var i;
					if (!str) {
						return '';
					}
					var revstr='';
					for (i = str.length-1; i>=0; i--) {
						revstr+=str.charAt(i);
					}
					return revstr;
				}

				// get the prefix part
				var ccnumber = prefixArr[Math.floor(Math.random()*(prefixArr.length-1))]; 
				// console.log('prefix',ccnumber);

				// generate digits
				while ( ccnumber.length < (length - 1) ) {
					ccnumber += Math.floor(Math.random()*10);
				}
				// console.log('generate digits',ccnumber);

				// reverse number and convert to int
				var reversedCCnumberString = strrev( ccnumber );
				var reversedCCnumber = [];
				for ( var i=0; i < reversedCCnumberString.length; i++ ) {
					reversedCCnumber[i] = parseInt( reversedCCnumberString.charAt(i) );
				}
				// console.log('reversedCCnumber',reversedCCnumber);

				// calculate sum
				var sum = 0,pos = 0,odd;
				while ( pos < length - 1 ) {
					odd = reversedCCnumber[ pos ] * 2;
					if ( odd > 9 ) {
						odd -= 9;
					}
					sum += odd;
					if ( pos !== (length - 2) ) {
						sum += reversedCCnumber[ pos +1 ];
					}
					pos += 2;
				}
				// console.log('sum',sum);

				// calculate check digit
				var checkdigit = (( Math.floor(sum/10) + 1) * 10 - sum) % 10;
				// console.log('checkdigit',checkdigit);
				ccnumber += checkdigit;

				// console.log('the final number',ccnumber);
				// console.log('======================');
				return ccnumber;
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
			country: function (modelValue) {
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

				if(modelValue && modelValue.format === 'abbr') {
					return countries[Math.floor(Math.random()*countries.length)].substr(0,2).toLowerCase();
				}
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
			usSate: function(modelValue) {
				var states = ['AK;Alaska','AL;Alabama','AR;Arkansas','AZ;Arizona','CA;California','CO;Colorado','CT;Connecticut','DC;District of Columbia',
					'DE;Delaware','FL;Florida','GA;Georgia','HI;Hawaii','IA;Iowa','ID;Idaho','IL;Illinois','IN;Indiana','KS;Kansas','KY;Kentucky',
					'LA;Louisiana','MA;Massachusetts','MD;Maryland','ME;Maine','MI;Michigan','MN;Minnesota','MO;Missouri','MS;Mississippi',
					'MT;Montana','NC;North Carolina','ND;North Dakota','NE;Nebraska','NH;New Hampshire','NJ;New Jersey','NM;New Mexico',
					'NV;Nevada','NY;New York','OH;Ohio','OK;Oklahoma','OR;Oregon','PA;Pennsylvania','RI;Rhode Island','SC;South Carolina',
					'SD;South Dakota','TN;Tennessee','TX;Texas','UT;Utah','VA;Virginia','VT;Vermont','WA;Washington','WI;Wisconsi','WV;West Virginia',
					'WY;Wyoming'];

				if(modelValue && modelValue.format === 'abbr') {
					return states[Math.floor(Math.random()*states.length)].substr(0,2).toLowerCase();
				}
				return states[Math.floor(Math.random()*states.length)].substr(3);
			},
			company: function (modelValue) {
				var country = 'us', selected= null;
				var buisnessTypes = {
					us: [ 'LP', 'LLP', 'LLLP', 'LLC', 'PLLC ', 'Corp', 'Inc', 'Ltd', 'Co', 'Industries', 'Association', 	'Company', 'Corporation', 'Club', 'Foundation',
						'Incorporated', 'Institute', 'Society', 'Union', 'Syndicate' ],
					bg: ['АД', 'АДСИЦ', 'ЕАД', 'ЕТ', 'ООД', 'КД', 'КДА', 'СД'],
					de: ['KGaA', 'GmbH', 'AG', 'GbR', 'OHG', 'KG', 'Einzelunternehmen', 'e.G.']
				};

				selected = buisnessTypes[country];
				if(modelValue && buisnessTypes[modelValue.format] instanceof Array) {
					selected = buisnessTypes[modelValue.format];
				}
				return this.lastName()+' '+selected[Math.floor(Math.random()*selected.length)];
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
					length = parseInt(modelValue.length);
					if(modelValue.randomize === true) {
						length = Math.floor(Math.random()*(length-1)) + 1;
					}
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
				if(!modelValue.enums || !(modelValue.enums instanceof Array)) {
					return;
				}
				var enumArr = modelValue.enums.slice(); // copy the values to be picked from
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
				if((globalTemp.index || globalTemp.index >= 0) && isNaN(parseInt(modelValue.value))) {
					globalTemp.index += 1;
				} else {
					globalTemp.index = 0;
					if(!isNaN(parseInt(modelValue.value))) {
						globalTemp.index = modelValue.value;
						modelValue.value = null;
					}
				}

				return globalTemp.index;
			},
			camelCasefromText: function(modelValue) {
				var firstWord = true,text;
				modelValue.value  = removeSpecialChars(modelValue.value,'ns');
				text = this.text(modelValue); // remove numeric and special chars
				text = text.replace(/\w\S*/g, function(txt){
					if(firstWord) {
						firstWord = false;
						return txt;
					} else {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					}
				}) // capitalize the first leter of every word except for the first word
				.replace(/\s+/g, ''); // remove the spaces
				// console.log(text);
				return text;
			},
			slugFromText: function(modelValue) {
				var firstWord = true, text  = this.text(modelValue);
				text = removeSpecialChars(text,'s');
				text = text.replace(/\s+/g, '_'); // remove the spaces
				// console.log(text);
				return text;
			}
		};

		var generateObjectValues = function(obj) {
			var modelValue = null;
			var result = {};
			for(var key in obj) {
				modelValue = obj[key];
				if(modelValue && !modelValue.type && modelValue instanceof Array)
				{
					// console.log('TODO Nested arrays');
					result[key] = generateArray(modelValue[0].config,modelValue[0].model);
				} else {
					if(modelValue && !modelValue.type && typeof modelValue === 'object') {
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
					typeof modelValue.type === 'string' &&
					typeProcessing.hasOwnProperty(modelValue.type) &&
					typeof typeProcessing[modelValue.type] === 'function') {
						result[key] = typeProcessing[modelValue.type](modelValue);
				}
			}
			// returns null if result is an empty object
			return (Object.getOwnPropertyNames(result).length!==0)?result:null;
		};

		var generateArrayValue = function(obj) {
			if(typeof obj === 'object' && 
				typeof obj.type === 'string' &&
				typeProcessing.hasOwnProperty(obj.type) &&
				typeof typeProcessing[obj.type] === 'function') {
					return typeProcessing[obj.type](obj);
			}
		};

		var generateArray = function(cfg,model) {
			var result = [], rows;
			var config = cfg;
			if(!config) {
				config = globalCfg;
			}
			if(!model) {
				errMsg = errMsg+='Undefined object';
				return;
			}

			rows = config.rows;
			if(config.randomRows) {
				rows = 1+Math.floor(Math.random()*(config.rows));
			}

			for(var idx=0; idx < rows; idx += 1) {
				if(model.type && typeof model.type === 'string') {
					result[idx] = generateArrayValue(model);
				} else {
					result[idx] = generateObjectValues(model);
				}
				if(typeof result[idx] === 'undefined') {
					errMsg = errMsg+='Unable to generate a value with index '+idx;
					return;
				}
			}
			return result;
		};

		var self = {
			generateData: function(input) {
				var deferred = $q.defer();
				var delay = 0, config;
				// console.log('Supported generators:', Object.getOwnPropertyNames(typeProcessing));
				if(!input || !input.config || isNaN(parseInt(input.config.rows)) || !input.model) {
					deferred.reject('Error: Provide both the correct configuration and model.');
					return deferred.promise;
				}

				config = input.config;
				globalCfg = _.clone(config);

				var goGenerate = function() {
					generatedData = _.clone(input.model);
					generatedData = generateArray(config,generatedData);
					if(generatedData) {
						deferred.resolve(generatedData);
					} else {
						deferred.reject(errMsg);
						return deferred.promise;
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