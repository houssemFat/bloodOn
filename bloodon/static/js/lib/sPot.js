/*
 * sPot.js -principal file of sPot js framework
 * Copyright (c) sPot Inc. 2012 
 * @author fathallah.houssem@gmail.com (Fathallah Houssem )
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
/* @GOOGLE
	goog.provide('sPot.sPot'); 
	
	@typedef {{l: number, t: number}} 
	sPot.ElementPostion;*/

if (!document.sPot){
	sPot = {};
	/** @type {string} */
	sPot.MODAL_STATE = 'H' ;
	/** @type {string} */
	sPot.ALERT_STATE = 'H' ;
	/** @enum {String} */
	sPot.FILE_TYPE = {
		/* css file type */
		CSS  : 'css',
		/* image file type */
		IMG	 : 'img',
		/* Java script type */
		JS	 : 'js'
	};
	/** @define {boolean} */
	sPot.USE_HTTPS = false;
	/** @define {string} */
	sPot.HOSTNAME = 'localhost';
	/**/
	 sPot.DEFAULT_DELIMITER_KEYS = '&';
	/** @define {number} */
	sPot.PORT = 8080;
	/**
	 * @type {string}
	 * @const
	 */
	sPot.URL = 'http' + (sPot.USE_HTTPS ? 's' : '') + '://' + sPot.HOSTNAME + ':' + sPot.PORT + '/';
	/** @define {string} */
	sPot.PROJECT_URL = "" ;
	/** @define {string} */
	sPot.JS_BASE_URL = "" ;
	/** @define {string} */
	sPot.EXT_JS_BASE_URL = "Js/" ;
	/**
	 * @export
	 * Returns the corrent project path
	 * @return {string}
	*/
	sPot.getProjectUrl = function () {
		return sPot.PROJECT_URL ;
	};
	/**
	 * @export
	 * Returns the corrent project path
	 * @return {string}
	*/
	sPot.getProjectJsUrl = function () {
		return sPot.JS_BASE_URL ;
	};
	/**
	 * Returns the path of pages code projects.
	 * @return {string}
	 * 
	 */
	sPot.projectPath =  function () { 
		return sPot.URL + sPot.getProjectUrl () ;
	};
	/**
	 * Returns the path of js path ressource code projects.
	 * @return {string}
	 * @export
	 */
	sPot.PAGE_PATH_JS = function () {
		var path = sPot.URL + sPot.getProjectUrl () + sPot.getProjectJsUrl () + '/';
		return path ;
	};
	
	/**
	 * Returns an element by given id (use of document.getElementById ())
	 * @return {Element}
	 */
	sPot.$ = function (id) { 
		return  document.getElementById (id) ;
	}
	/**
	 * Returns a unique key/value object from an array of key/value object.
	 * @param {Array.<Object>|undefined} paramsTables
	 * @return {Object|undefined}
	 */
	sPot.mergeObjects = function (){ 
		var count = arguments.length ;
		if ( count == 0)
			return null;
		else if (count == 1)
			return arguments[0];
		else{
			var object = {}, 
				loopObject ;
			for (var i = 0 ; i < count ; i++){
				loopObject = arguments[i];
				if (sPot.isObject(loopObject)){
					for ( var key in loopObject){
						object[key] = loopObject [key];
					}
				}
			}
				return  object ;
		}
	};
	/**
	 * Returns if the argument is an object 
	 */
	sPot.isObject = function (object){
		if (!object)
			return false ;
		return (object.constructor).name  == (({}).constructor).name ;
		
	};
	/**
	 * Returns a unique key/value object from an array of key/value object.
	 * @param {Array.<Object>|undefined} param
	 * @return {Array|undefined}
	 */
	sPot.clearParams = function (params, clearedKey){ 
		var returnParams = {} ;
		var copy = true ;
		var i = 0 ;
		for ( var key1 in params){
			copy = true ;
			for ( i = 0 ; (i <  clearedKey.length ) && copy ; i ++ ){
				if (key1 === clearedKey[i]){
					copy = false ;
				}
			}
			if (copy)
				returnParams[key1] = params [key1] ;
		}
		return returnParams ;
	};
	/**
	 * Mask an object with cloned object that have the same postion, width , height with loder and text insider.
	 * @param {!Element} obj
	 * @param {string|null|undefined} text
	 * @export
	 */
	sPot.mask = function (obj, text){
		if (!obj)
			return ;
		if (!obj._mask){
			var pos = sPot.getPosition (obj) ,
			text = text || DICTIONARY.LOADING,
			innerHTML = '<div class="content">' +
							'<div class="opacity"></div>' +
							'<div class="text">' +
								'<div style="display:inline-block">' +
									'<span style="font-size:12">' + 
											text  + 
										'</span>' + 
									'</div>'+
									'<div class="loader" style="display:inline-block;clear:left">'+
							'</div>'+
						'</div>',
			mask = sPot.createElement('div', 
											{	style : 
													{
														zIndex 		: (obj.style.zIndex < 100) ? 100 : obj.style.zIndex + 1,
														position 	: 'absolute',
														left 		: pos.l + "px",
														top 		: pos.t + "px",
														width 		: obj.clientWidth,
														height 		: obj.clientHeight
													},
												className : 'mask',
												innerHTML : innerHTML
											
											});
			obj._mask = mask;
			document.body.appendChild(mask);
		}
	};
	/**
	 * Remove a mask of an object.
	 * @param {!Element} obj
	 * @param {?string|undefined}
	 * @export
	 */
	sPot.unMask = function (obj){
		if (obj._mask){
			try{
				document.body.removeChild(obj._mask);
			}
			catch (error){};
		}
		obj._mask = void 0 ;
	};
	/**
	 * Hide an element (using display style property = 'none' ).
	 * @param {!Element} obj
	 * @export
	 */
	sPot.hide = function (obj){
		if (obj)
			obj.style.display ="none";
	};
	/**
	 * Hide an element (using displat style property = '').
	 * @param {!Element} obj
	 * @export
	 */
	sPot.show = function (obj){
		if (obj)
			obj.style.display ="";
	};
	/**
	 * Returns a postion of an element given in parametres.
	 * @param {Element} obj
	 * @return {ElementPostion}
	 * @export
	 */
	sPot.getPosition = function (obj){
		var l = sPot.getScrollLeft (obj) ;
		var t = sPot.getScrollTop (obj) ;
		var x = 0 ; 
		var y = 0  ;
		while (obj.offsetParent){
			x +=  obj.offsetLeft ;
			y += obj.offsetTop ; 
			obj = obj.offsetParent ;
		}
		if (obj.parentElement)
			x += obj.parentElement.offsetLeft ;
		return {'l' : x - l , 't' : y - t}
	}
	/**
	 * Returns the scroll top postion of an element.
	 * @param {Element} obj
	 * @return {number}
	 * @export
	 */
	sPot.getScrollTop = function (obj){
		var sT = obj.scrollTop ;
		while (obj.offsetParent){
			sT += obj.scrollTop ;
			obj = obj.offsetParent ;
		}
		return sT ;
	}
	/**
	 * Returns the scroll Left postion of an element.
	 * @param {Element} obj
	 * @return {number}
	 * @export
	 */
	sPot.getScrollLeft = function (obj){
		var sL = obj.scrollLeft ;
		while (obj.offsetParent){
			sL += obj.scrollLeft ;
			obj = obj.offsetParent ;
		}
		return sL ;
	}
	/**
	 * Replace a css class name of an element by a new class name.
	 * @param {Element} obj
	 * @param {String} class1
	 * @param {String} class2
	 * @export
	 */
	sPot.replaceClass = function (obj, class1 , class2){
		if (obj){	
			if (obj.className.indexOf(class1) > -1)
				obj.className = obj.className.replace(class1, class2);
		}
	}
	/**
	 * Returns a new element with type <tag> and proprieties.
	 * @param {String} tag
	 * @param {String} properties
	 * @return {Element}
	 * @export
	 */
	sPot.createElement = function (tag, properties){
		var element =  document.createElement(tag);
		if (element){
			for (var key in properties){
				value = properties[key] ;
				// value  is an embedded object  and not a function  , like style : {}
				if (!Function.prototype.isPrototypeOf(value) && Object.prototype.isPrototypeOf(value)){
					for (var embkey in value)
						element[key] [embkey] = value[embkey] ;
				}
				else 
					element[key] = value ;
			}
		}
		return element ;
	}
	/**
	 * Returns a suffix of an id by cutting the whole string to the last index of string.
	 * @param {Element} element
	 * @return {String}
	 * @export
	 */
	sPot.cutId = function (element){
		var id = element.id ?  element.id : element;
		return id.substr(id.lastIndexOf('_') + 1);
	}
	/**
	 * Returns the name of file if it's extension match any extension of given array.
	 * @param {string} fname
	 * @param {Array.<string>} exts
	 * @return {boolean}
	 * @export
	 */
	sPot.validFileExtensions =  function (fname, exts){
		var name = fname.substr(fname.lastIndexOf('.') + 1).toLowerCase () ;
		// alert (name);
		var i = 0 ;
		while (i < exts.length){
			if ( name === exts[i])
				return true ;
			i++ ;
		}
		return false ;
	}
	/**
	 * Returns a string type 'key0=value0(del)key1=value1(del)' from an object splitted by delimiter if defined  .
	 * @param {Object} params
	 * @param {srtring=} delimiterKey
	 * @return {string}
	 * @export
	 */
	sPot.getStringParams =  function (params, delimiterKey){
		stringToReturn = '' ;
		delimiterKey = delimiterKey ? delimiterKey : sPot.DEFAULT_DELIMITER_KEYS ;
		for ( var key in  params){
		stringToReturn += key + '=' + params[key] + delimiterKey ;
		}
		if (stringToReturn.indexOf(delimiterKey) > -1){
			return stringToReturn.substr(0, stringToReturn.lastIndexOf (delimiterKey));
		}
		return '';
	}
	/**
	 * Returns an json Object from string passed from server.
	 * @param {!string} stringObj
	 * @return {Object}
	 */
	sPot.getObjFromString = function (stringObj) {
		try {
			return eval ('(function (){ return' + ((sPot.NAV != 'IE') ? stringObj.trim () : stringObj) + '}).call()');
		}
		catch (e){}
	};
	/**
	 * Returns an attribute of an element
	 * @param {Element} object
	 * @param {string} attributeName
	 * @return {Object|null}
	 * @export
	 */
	sPot.getAttribute = function (object, attributeName){
		if (!object.hasAttribute(attributeName))
			return null ;
		else 
			return object.attributes[attributeName].value ;
	}
	
	/**
	 * Returns an attribute of an element
	 * @param {Element} object
	 * @param {string} attributeName
	 * @return {Object|null}
	 * @export
	 */
	sPot.getAttributeAsObject = function (object, attributeName){
		return sPot.getObjFromString ( sPot.getAttribute (object, attributeName));
	}
	/**
	 * Returns an attribute of an element
	 * @param {Element} object
	 * @param {string} attributeName
	 * @return {Object|null}
	 * @export
	 */
	sPot.getAttribute = function (object, attributeName){
		if (!object.hasAttribute(attributeName))
			return null ;
		else 
			return object.attributes[attributeName].value ;
	}
	/**
	 * Replace a css class name of an element by a new class name.
	 * @param {Element} obj
	 * @param {String} class1
	 * @param {String} class2
	 * @export
	 */
	sPot.soon = function (){
		alert ('soon ...');
	}
	/**
	 * Returns an option value
	 * @param {Element} option
	 * @return {string|""}
	 */
	sPot.getOptionValue = function (option){
		return option.value ;
	}
	/**
	 *  Function trim for the IE version
	 *	JavaScript: The Definitive Guide, Sixth Edition
	 *	by David Flanagan
	 *	Copyright © 2011 David Flanagan. All rights reserved.
	*/
	String.prototype.trim = String.prototype.trim || function() {
		if (!this) return this; // Don't alter the empty string
		return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
	};
}	
// 
var userAgent = navigator.userAgent.toUpperCase() ;
if (userAgent.indexOf('MSIE') > - 1){
	sPot.NAV = 'IE' ;
	var x = userAgent.substr (userAgent.indexOf('MSIE') + 5 );
	sPot.NAVIE_VERSION =  parseInt(x.substr(0,x.indexOf(';')).replace(/ /g, ""));
}
// chrome
else if (userAgent.indexOf('CHROME') > - 1)
	sPot.NAV = 'GCH' ;
// firefox
else if (userAgent.indexOf('FIREFOX') > - 1)
	sPot.NAV = 'FF' ;