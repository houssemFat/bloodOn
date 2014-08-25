/*
 * validators.js - validators librairie for sPot js framework
 * Copyright (c) sPot Inc. 2012 
 * @author fathallah.houssem@gmail.com (Fathallah Houssem )
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

	//goog.require('sPot'); 
	//goog.require('sPot.Widget');
	//goog.provide('sPot.validators');
	sPot.Validators = {};
/**
 * Validate an object using params send in the object it self
 * @param {Object} params
*/
sPot.Validators.valid = function (){
	var error = false ;
	var obj = this;
	var color  = obj['__appValidation'].COLOR_;
	var value = obj.value ;
	var min  = obj['__appValidation']['MIN_'];
	if (obj['__appValidation'].REQ_ && value === ''){
		error = {'message' : 'DICTIONARY.NONEMPTY'} ;
	}
	else if (min && value.length < min ){
		error = {'message' : 'DICTIONARY.ERRORMINCARACTER', 'moreInfo' : ' ' + min};
	}
	else if (obj['__appValidation']['EXTFN_'])
		error = obj['__appValidation']['EXTFN_'].fn.call ( obj['__appValidation']['EXTFN_'].scope, obj['__appValidation']['EXTFN_'].params);
	else {
		var type  = obj['__appValidation']['TYPE_'];
		var max  = obj['__appValidation']['MAX_'];
		switch (type){
			case 'date' :
				error = sPot.Validators.vDate (value) ;
			break;
			case 'email' :
				error = sPot.Validators.vEmail (value) ;
			break;
			case 'decimal' :
				error = sPot.Validators.vDecimal (value, max);
			break;
			case 'phone' :
				error = sPot.Validators.vInteger (value, 8);
			break;
			case 'zip_code' :
			case 'year' :
				error = sPot.Validators.vInteger (value, 4, true);
			break;
			case 'int' :
				error = sPot.Validators.vInteger (value, max) ;
			break;
			case 'web-site' :
				error = sPot.Validators.vWebSite (value);
			break;
		}
	}
	// detach events
	// $(obj).unbind ('mouseover mouseout');
	if (error){
		// connect onmouse over
		var errorMessage = error.message ;
		obj['__appErrorMessage'] =  eval (errorMessage).replace ('%s',  error.moreInfo ?  error.moreInfo : '');
		/* replaced with jquery 
		$(obj).bind ('mouseover', function () { 
										var objError = sPot.Validators._errorObj ;
										var horizontalDirection =   ( LANG == 'en_AR') ? 'left' : 'right' ;
										sPot.Validators._errorObj.innerHTML =
										sPot.Widget.display (objError, obj, {
																				"vertical" : 'bottom', 
																				"horizontal" : horizontalDirection ,
																				"position" : 'inverse', 
																				"vAdjust" : -10, 
																				"hAdjust" : -10,
																				"isTemporised" : true 
																				}
															);
							});
		(color !== 'red') ? obj.style.color = 'red' : obj.style.color = 'orange' ;
		*/
		return errorMessage ;
	}
	else {
		obj['__appErrorMessage']  = null ;
		//obj.style.color = color ;
		return null;
	}
}
/**
 * Return an object contains an error string if the value does not much sample date format (day{_,-,\}month{_,-,\}year) else null
 * @param {string} value
*/
sPot.Validators.vDate = function (value){
	var execValue = /\b\d{1,2}(\/|-|\.|_)\d{1,2}\1\d{4}\b/.exec (value);
	var thirtyOneMonths = '1,3,5,7,8,10,12';
	if (execValue){
		var resultvalue = execValue[0];
		if (value.replace (resultvalue, '') !== '')
			return {'message' : 'error convert date'};
		else {
			var separator = execValue[1];
			var tabDate = value.split (separator) ;
			var month = parseInt (tabDate[0]), day = parseInt (tabDate[1]), year = parseInt (tabDate[2]) ;
			if ((month < 1) || (month > 12))
					return {'message' : 'month must be in [1,12]'};
			if ((day < 1) || (day > 31))
					return {'message' : 'DICTIONARY.ERRORDAY'}
					//error in day, day must be in [1,31]'};
			else {	
				if (day == 31){
					if (thirtyOneMonths.indexOf(month) < 0)
						return {'message' : 'DICTIONARY.ERRORMONTH'} ;
						//: 'day 31, month must be in [1,3,5,7,8,10,12]'};
				}
				if (month == 2){
					if (day > 29 ) 
						return {'message' :  'DICTIONARY.ERRORFEBRARY'} ;//'day 30 for febrary !!!'};
					else if (day == 29){ 
						if (!(year % 4 == 0)) 		// if the year is bessectile 
							return {'message' : 'DICTIONARY.ERRORBESSECTYLE'};
					 }
				}
			}
		}
	}
	else 
	 return {'message' : 'error convert date'};
}
/**
 * Return an object contains an error string if the value is not a decimal else null
 * @param {string} value
 * @return {Object|null} 
*/
sPot.Validators.vDecimal = function (value){
	var error = {'message' : 'DICTIONARY.PARSEDECIMAL'} ;
	if (/[^\d\.\,]/.test(value))
		return error;
	var indexComma = value.indexOf (','),
		lIndexComma = value.lastIndexOf (','),
		indexPoint = value.indexOf ('.'),
		lIndexPoint = value.lastIndexOf ('.');
	if (((indexComma > - 1) && (indexPoint > - 1)) || (lIndexComma !== indexComma) || (lIndexPoint !== indexPoint) )
		return error;
	if (/^\d+(,|.)?\d*/.test(value))
		return null ;
	else 
		return error;
}
/**
 * Return an object contains an error string if the value is not an integer else null
 * @param {string} value
 * @return {Object|null} 
*/
sPot.Validators.vInteger = function (value, max, exact){
	if (/[^\d]/.test(value))
		return {'message' : 'DICTIONARY.PARSEINT'};
	else if (typeof (max) !== 'undefined'){
			if (exact){
				if(value.length !== max)
					return {'message' : 'DICTIONARY.ERRORMUSTLIMIT', 'moreInfo' : ' ' + max};
			}
		}
		
}
/**
 * Return an object contains an error string if the value is not a valid email else null
 * @param {string} value
 * @return {Object|null} 
*/
sPot.Validators.vEmail = function (value){
	if (!((value.indexOf(".") > 0) && 
				   (value.indexOf("@") > 0) && (value.lastIndexOf('.') > value.indexOf("@"))) || 
				  /[^a-zA-Z0-9.@_-]/.test(value)) 
		return {'message' :"DICTIONARY.ERRORMAIL"}
 }
/**
 * Return an object contains an error string if the value is not a valid link else null
 * @param {string} value
 * @return {Object|null} 
*/
sPot.Validators.vWebSite = function (value){
	if (value == "") return {'message' : "No web site was entered."} 
	else if (!/\bWWW\.[a-zA-Z0-9][a-zA-Z0-9\/\/]*\b/ig.test(value)) 
		return {'message' :"invalid web site."}
 }
/**
 * Register a validation object inside a dom element connected to onblur  
 * the object is named '__appValidation' wich conatains :
	- TYPE_  		: type of validation ('date', 'decimal', 'integer' , 'email' , 'link/website')
	- COLOR_ 		: initial color of the input object
	- EXTFN_ 		: extensible validation fn (used to add personnal validation)
	- REQ_   		: is the input must be non null value
	- INFOMESSAGE_	: message to display if the validation is failure
 * @param {Element} obj
 * @param {string} type event (lick , blur, mouse down ........)
 * @param {boolean} isRequired
 * @param {string} infoMessage
 * @param {string} fn valid function if it exist
 * @param {Object} scope conext function execution
 * @param {Object} params  params of function
*/
sPot.Validators.validObj = function (obj,  type, isRequired, maxLength, minLength, infoMessage, fn, scope, params){
	if (!obj['__appValidation']){	
		obj['__appValidation'] = {} ;
	}
	obj['__appValidation']["TYPE_"] = type ;
	obj['__appValidation']["MAX_"] = maxLength ;
	obj['__appValidation']["MIN_"] = minLength ;
	obj['__appValidation']["COLOR_"] = obj.style.color ;
	if (fn){
		obj['__appValidation']["EXTFN_"] = { 
										fn : fn,
										scope	 :scope, 
										params : params} ; 
	}
	if (isRequired)
		obj['__appValidation']["REQ_"] = true ;
	if (infoMessage)
		obj['__appValidation']["INFOMESSAGE_"] = infoMessage ; 
	$(obj).bind('change keydown keypress mouseover', $.proxy (sPot.Validators.valid, obj));
	if (!sPot.Validators._errorObj){	
		sPot.Validators._errorObj = sPot.createElement ('div', {style :{color : 'red' }});
		document.body.appendChild (sPot.Validators._errorObj);
	}
	// execute for first time
	// sPot.Validators.valid.call(obj);
}
/**
 * Add a dom element validation object to an array named groups
 * the object is named '__appValidation' wich conatains :
	- TYPE_  		: type of validation ('date', 'decimal', 'integer' , 'email' , 'link/website')
	- COLOR_ 		: initial color of the input object
	- EXTFN_ 		: extensible validation fn (used to add personnal validation)
	- REQ_   		: is the input must be non null value
	- INFOMESSAGE_	: message to display if the validation is failure
 * @param {Element} obj
 * @param {string} type (email , link, ..........)
 * @param {boolean} isRequired
 * @param {string} infoMessage
 * @param {Array<Element>} groups
 * @param {string} fn valid function if it exist
 * @param {Object} scope conext function execution
 * @param {Object} params  params of function
*/
sPot.Validators.registerValidGroup = function (objs, group, options){
	if (!objs)
		return ;
	if (!objs.length){
		sPot.Validators.registerValidGroup ([objs], group, options);
		return ;
	}
	var type = options.type || 'string',
		isRequired = options.required || false,
		infoMessage = options.infoMessage || '',
		fn = options.fn,
		scope = options.scope,
		params = options.params,
		maxLength = options.max,
		minLength = options.min,
		length = objs.length ;
	for (var i = 0; i < length ; i++){
		sPot.Validators.validObj (objs[i], type, isRequired, maxLength, minLength, infoMessage, fn, scope, params);
		group.push (objs[i]) ;
	}
}

/**
 * Returns a string contains the errors message of validation else null
 * @param {Array<Element>} groups
 * @return {Boolean|Array{string}} 
*/
sPot.Validators.validGroup = function (groups){
	var errors = [] ;
	var error ;
	for ( var i = 0 ; i < groups.length ; i ++){
		error = sPot.Validators.valid.call(groups[i]);
		if (error)
			errors.push (error);
	}
	if (errors.length > 0)
		return {error : errors};
	else 
		return true ;
}


/**
 * Returns a string contains the errors message of validation else null
 * @param {Array<Element>} groups
 * @return {Boolean|Array{string}} 
*/
sPot.Validators.isEmpty = function (string){
	return ( string.length == 0 || string.replace(/\s/g,'').length == 0 );
}

/**
 * Returns a string contains the errors message of validation else null
 * @param {Array<Element>} groups
 * @return {Boolean|Array{string}} 
*/
sPot.FormatDate = function (string){
	var message = sPot.Validators.vDate (string);
	if (message)
		return message.message;
	var tabDate = string.split ((/\b\d{1,2}(\/|-|\.|_)\d{1,2}\1\d{4}\b/.exec (string)) [1]) ;
	return new Date ( tabDate[2],  tabDate[0] - 1, tabDate[1]) ;}

/**
 * Returns a string contains the errors message of validation else null
 * @param {Array<Element>} groups
 * @return {Boolean|Array{string}} 
*/
sPot.Validators.FormatNumber = function (string, format){
	if (!format || !string) return string ;
	var return_ = '',
	length = string.length,
	format_length = format.length,
	i = 0 , j = 0 ;
	while ( i < length && i < format_length){
		if (format[i] === '#')
			return_ +=  string[j++];
		else
			return_ += ' ';
		i++;
	}
	if (j < length)
		return_ += string.substr(j);
		
}