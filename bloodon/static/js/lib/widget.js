/*
 * widget.js - widget librairie for sPot js framework
 * Copyright (c) sPot Inc. 2012 
 * @author fathallah.houssem@gmail.com (Fathallah Houssem )
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
	//goog.require('sPot');
	//goog.provide('sPot.Widget');
sPot.Widget = {};
/**
 * @type {number}
 * @const
 */
 sPot.Widget.Zindex_ = 300;
 /**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.INVERSED_PROPERTY = { 
	'TOP' : 'bottom' , 
	'LEFT' : 'right' , 
	'RIGHT' : 'left', 
	'BOTTOM' : 'top'  
}
/**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.VERTICAL_PROPERTIES = { 
	'TOP' : 'bottom' , 
	'BOTTOM' : 'top'  
}
/**
 * @enum {string}
 * @define {Element}
 * @const
 */
sPot.Widget.HORIZONTAL_PROPERTIES = { 
	'RIGHT' : 'right' , 
	'left' : 'top'  
}
/**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.ALIAS_POSTIONS = { 
	'TOP' : 't' , 
	'LEFT' : 'l' , 
	'RIGHT' : 'r', 
	'BOTTOM' : 'b' 
};
/**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget['REFERENCES_POSTIONS'] = { 
	'INVERSE' : 'inverse' , 
	'VERTICAL' : 'vertical' , 
	'HORIZONTAL' : 'horizontal', 
	'DEFAULT' : 'default' 
};
/**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.modals_ = [];
 /**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.toolTips_ = [];
 /**
 * @enum {string}
 * @define {Element}
 * @const
 */
 sPot.Widget.modalOpacity_ = undefined ;
 
/**
 * @param {Element} obj
 * @param {Element} refElement
 * @param {sPot.Widget.VERTICAL_PROPERTIES} vertical
 * @param {sPot.Widget.HORIZONTAL_PROPERTIES} horizontal
 * @param {sPot.Widget.REFERENCES_POSTIONS} postion
 * @param {number} verticalAdjust
 * @param {number} horizontalAdjust
 * @param {boolean} isTemporised
 * @param {?Element=} text
 * @export
 */
sPot.Widget.display = function (obj, refElement, options) { 
		// options vertical, horizontal, position, vAdjust , hAdjust, isTemporised, text){
	var container = sPot.Widget.initPingPong (obj),
		options = options || {}, 
	verticalProperty = 'top',  
	horizontalProperty = 'left' ,
	verticalValue =  0 , 
	horizontalValue =  0 ,
	vertical = options.vertical || 'top' ,
	horizontal = options.horizontal || 'left' ,
	position = options.position || '' ;
	if (refElement){
		var properties = sPot.Widget.getProperties (refElement);
		var verticalUpKey = vertical.toUpperCase () ;
		var horizontalUpKey = horizontal.toUpperCase () ;
		var elementWidth = properties.w ;
		var elementHeight = properties.h ;
		var posText  = 'postions  : ' ;
		// clear style
		switch (position){
			case 'inverse' :
				verticalProperty = sPot.Widget.INVERSED_PROPERTY[verticalUpKey] ;
				verticalValue = elementHeight + properties[sPot.Widget.ALIAS_POSTIONS[verticalProperty.toUpperCase ()]];
				
				horizontalProperty = sPot.Widget.INVERSED_PROPERTY[horizontalUpKey] ;
				horizontalValue = elementWidth + properties[sPot.Widget.ALIAS_POSTIONS[horizontalProperty.toUpperCase ()]];
			
			break ;
			case 'horizontal' : 
				verticalProperty = vertical || verticalProperty  ;
				verticalValue = properties[sPot.Widget.ALIAS_POSTIONS[verticalUpKey]];
				
				horizontalProperty = sPot.Widget.INVERSED_PROPERTY[horizontalUpKey] ;
				horizontalValue = elementWidth + properties[sPot.Widget.ALIAS_POSTIONS[horizontalProperty.toUpperCase ()]];
			break ;
			case 'vertical' : 
				verticalProperty = sPot.Widget.INVERSED_PROPERTY[verticalUpKey] ;
				verticalValue = elementHeight + properties[sPot.Widget.ALIAS_POSTIONS[verticalProperty.toUpperCase ()]];
				
				horizontalProperty = horizontal ||   horizontalProperty  ;
				horizontalValue = properties[sPot.Widget.ALIAS_POSTIONS[horizontalUpKey]];
			break ;
			default :
				verticalProperty = vertical || verticalProperty  ;
				verticalValue = properties[sPot.Widget.ALIAS_POSTIONS[verticalUpKey]];
				
				horizontalProperty = horizontal ||   horizontalProperty  ;
				horizontalValue = properties[sPot.Widget.ALIAS_POSTIONS[horizontalUpKey]];
				break ;
		}
	}
	// posText += 'vertcial property = ' + verticalProperty + ', value = ' + verticalValue ;
	// posText += '  horizontal property = ' + horizontalProperty + ', value = ' + horizontalValue ;
	
	container.style[verticalProperty] = verticalValue + (options.vAdjust ? options.vAdjust : 0 ) +  "px";
	container.style[horizontalProperty] = horizontalValue  + (options.hAdjust ? options.hAdjust : 0 ) + "px" ;
	
	if (options.text)
		options.text.value = posText ;
	sPot.Widget.displayWidget (container, options.isTemporised);
}

/**
 * Displays the current widget
 * @param {Element} container
 * @param {boolean} isTemporised indicate if the widget will be disappear after 4 seconds
 */
sPot.Widget.displayWidget = function  (object, isTemporised, options ){
	$(object).show ();
	if (isTemporised){
		var time = options ? (options.time || 2000) : 2000 ;
		var newTimeOut = setTimeout ( function (){$(object).hide ();}, time);
		$(object)
			.mouseout (	function (){newTimeOut = setTimeout ( function (){$(object).hide ();}, time);})
			.mouseover ( function (){clearTimeout (newTimeOut);});
	}
	sPot.Widget.addToWidgets (object);
}
/**
 * Returns (and init) the ping pong container
 * @param {Element} obj
 * @return {Element}
 */
sPot.Widget.initPingPong = function (object){
	$(object).css({ 
					zIndex : sPot.Widget.Zindex_,
					position : 'absolute',
					top : '',
					left : '',
					right : '',
					bottom : ''
				});
	sPot.Widget._pingPong = object ;
	return  object ;
};
/**
 * Returns the properties of an element (top, left, right, bottom, height, width).
 * @param {Element} refElement
 * @return {sPot.Widget.ElementProperties}
 */
sPot.Widget.getProperties = function (refElement){
	/** @type {sPot.ElementPostion} */
	var posTopLeft = sPot.getPosition (refElement) ;
	// l : letf 
	// w : width 
	var l = posTopLeft.l ;
	var w = refElement.clientWidth ;
	// t : top
	// h : height 
	var t = posTopLeft.t ;
	var h = refElement.clientHeight;
				/*
               		 -----------left + width---|		
					 --------------------------|---- right =  body width - left ----|
									 __________
									|          |
									|		   |
									|__________|
				*/
	var r = document.body.clientWidth - (l+w) ;
				/*
				   ---
					|
					|
					|     top
					|
					|	 
				   ---   __________     ---
 					|	|          |     |
					|	|		   |     |    bottom = body height - top 
					|	|__________|     |
					|					 |
				   ---                  ---
				*/
	var b = document.body.clientHeight - (t+h); ///!!!!!!!!!!!!!!!!!!!!!
	return  {'t':t, 'l':l, 'r':r, 'b':b, 'w':w , 'h':h};
};
/**
 * Displays the model widget contains obejct
 * @param {Element} obj
 * @export
 */
sPot.Widget.displayModal = function  (content, bgcolor, options){
	/* sPot.Widget.initModal();
	var container = sPot.Widget._modal._modalContainer ; 
	// hide last active object for an  IE problem 
	$(sPot.Widget._modal.activeObj).hide (); = 
	//sPot.clearObj (container);
	if(obj){
			container.appendChild(obj);
			var body = document.body ;
			sPot.Widget._modal.style.width  = parseInt (body.scrollWidth) + 'px' ;
			sPot.Widget._modal.style.height  = parseInt (body.scrollHeight) + 'px' ;
			// adjust scroll top 
			sPot.Widget._modal._modalFg.style.top = parseInt (body.scrollTop) + 'px' ;
			// djust width
			sPot.Widget._modal._modalFg.style.left = parseInt (body.scrollLeft) + 'px' ;
			sPot.Widget._modal._modalFg.style.width = parseInt (body.clientWidth) + 'px' ;
			// djust width
			sPot.Widget._modal._modalFg.style.height = parseInt (body.clientHeight) + 'px' ;
			if(bgcolor) 
				sPot.Widget._modal._modalBg.style.backgroundColor = bgcolor;
			$(sPot.Widget._modal).show ();
			$(obj).show ();
			sPot.MODAL_STATE = 'A' ;
			sPot.MODAL_OPTIONS = options ;
			sPot.Widget._modal.activeObj = obj ;
	}
	*/	
		// hide all other modals 
		if (!sPot.Widget.modalOpacity_)
			sPot.Widget.modalOpacity_ = $('<div class="modal"></div>').appendTo('body')[0];
		$(sPot.Widget.modals_).hide ();
		var $dialg = $(content);
		if(bgcolor) 
				sPot.Widget.modalOpacity_.style.backgroundColor = bgcolor;
		// var inheight = $dialg .innerHeight ();
		var inwidth = $dialg.innerWidth ();
		$body = $('body') ;
		//var bheight = ;
		//var bwidth = $body.width () ;
		var scrollTop = $body.scrollTop ();
		var scrollLeft = $body.scrollLeft () ;
		var top = scrollTop  + 50 ;
		var left = scrollLeft + ($body.innerWidth ())/2 - inwidth/2  ;
		//alert (inheight/2 );
		$dialg.css ({'top' :  top, 'left' : left, 'position' : 'absolute'});
		$dialg.show ();
		$(sPot.Widget.modalOpacity_).show ();
		if (content){
			if (!content.__modal__){
				content.__modal__ = true ;
				sPot.Widget.modals_.push (content);
			}
		}
}
/**
 * Hides the modal if it's not defined
 * @param {Element} obj
 * @export
 */
sPot.Widget.addToWidgets = function  (object, function_){
	if (!object.widgetId_){
		// all widget must be on the body
		object.widgetId_ = new Date ().getTime () ;
		__appWidgets.push(object);
		if (function_)
			object._appWidgetCbFn_ = function_;
		//$(object).appendTo('body');
	}
}

/**
 * Hides the modal if it's not defined
 * @param {Element} obj
 * @export
 */
sPot.Widget.hideModal = function  (){
	$(sPot.Widget.modals_).hide ();
	$(sPot.Widget.modalOpacity_).hide ();
	sPot.MODAL_STATE = 'H' ;
}
/**
 *
 */
sPot.Widget.showTooltip = function (object, refObj){
	if (!__appToolTip){
		__appToolTip = $('#app_tooltip:eq(0)').click (function (event){
															//alert ('cc');
															if (event.preventDefault) event.preventDefault(); // Standard technique
															if (event.returnValue) event.returnValue = false;
															event.stopImmediatePropagation ();
															}
													)[0];
		
		// sPot.Widget.toolTips_ = [] ;
	}
	if (!object.widgetId_){
		$(object).appendTo ($('#app_tooltip_container:eq(0)', __appToolTip)[0]);
	}
	// hide all other modal
	$(sPot.Widget.toolTips_).hide ();
	
	var $refObj = $(refObj) ,
		offset = $refObj.offset (),
		adjustHeight = $refObj.innerHeight (),
		adjustWidth = $refObj.innerWidth (),
		$__appToolTip = $(__appToolTip) ,
		scrollY = document.body.scrollTop,
		scrollX = document.body.scrollLeft,
		width = $('body').innerWidth (),
		height = $('body').innerHeight (),
		hValue = width + scrollX - offset.left  - adjustWidth - 10,
		vValue = offset.top + (adjustHeight / 2),
		vertical = 'top',
		horizontal = 'right'  ;
		$__appToolTip.css ({'right':'', 'left':'','bottom':'','top':''});
		__appToolTip.style[horizontal] = (hValue + 15) + 'px';
		__appToolTip.style[vertical] = (vValue + 15) + 'px';
		$__appToolTip.show ();
		$(object).show();
}
/**
	@enum
*/
sPot.Widget.MESSAGE_BOX_TYPES = 
{
	info  		: 'i',
	error 		: 'e',
	validation  : 'v'
}
/**
 * @param {Object} event
 */
var WidgetHandler = function (event){
	if (event.keyCode == 27){
		sPot.Widget.hideModal();
		$('.hidden').hide ();
	}
	else
		return ;
	// alert (event.keyCode) ;
	// Echap code
	//alert ('document');
	/*echap*/
	$(__appWidgets).each (
		function (){
			if (this._appWidgetCbFn_)
				this._appWidgetCbFn_ ();
			$(this).hide ();
		}
	);
	(event || window.event).stopImmediatePropagation();
};
$(document).bind ('keydown click', WidgetHandler);
__appWidgets = [] ;
__appToolTip = undefined ;