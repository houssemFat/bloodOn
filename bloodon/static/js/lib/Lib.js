/* ===================================================
 * Lib.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
'use strict';
/**
 * Define the global name lib
 */
var Lib;
Lib = Lib || {};
/**
 * parse a json string
 * @param {string} string
 * @return {Object}
 */
Lib.getObjFromString = function(string) {
    try {
        return eval('(function (){ return' + ($.browser.msie ?
            string : string.trim()) + '}).call()');
    }
    catch (e) {
        return null;
    }
};
/**
 * @param {HTMLObjectElement} object
 * @param {string} attributeName
 * @return {*|string}
 */
Lib.getAttribute = function(object, attributeName) {
    if ($) {
        return $(object).attr(attributeName);
    }
    if (!object.hasAttribute(attributeName)) {
        return null;
    }
    return object.attributes[attributeName].value;
};
/**
 * return a javascript object from an object represented as attribute
 * @param {Object} object
 * @param {string} attributeName
 * @return {Object}
 */
Lib.getAttributeAsObject = function(object, attributeName) {
    'use strict';
    return Lib.getObjFromString(Lib.getAttribute(object, attributeName));
};

/**
 * return a html random color
 * @return {string}
 */
Lib.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
};
/**
 * @param {string} key
 * @return {string}
 */
Lib.trans = function(key) {
    return BloodOn.TRANSLATIONS[key];
};
/**
 *
 * @param {Object} object
 */
Lib._add = function(object) {
    BloodOn.TRANSLATIONS.concat(object);
};
/**
 *
 * @param {jQuery} $parent
 * @param {boolean} state
 */
Lib.switchIconState = function($parent, state) {
    $parent.find('i')[(state ? 'add' : 'remove') + 'Class']('icon-white');
};
/**
 * check if an input is empty
 * @param {HTMLTextAreaElement|HTMLInputElement} object
 * @return {boolean}
 */
Lib.isEmpty = function(object) {
    return ($(object).val().replace(/^\s+|\s+$/g, '').length > 0);
};
/**
 * check if a given is email
 * @param {string} string
 * @return {boolean}
 */
Lib.isEmail = function(string) {
    // FIXME try to check is it correct
    return /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i.test(string);
};
/**
 * check if a given is email
 * @param {Array} array
 * @param {*} element
 * @return {Array}
 */
Lib.popFromArray = function(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
};
/* ===================================================
 * Lib-widget.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
/**
 *
 * @type {{}}
 */
Lib.Widget = {};
/**
 *
 * @type {[]}
 */
Lib.Widget._widgets = [];
/**
 * Save an object widget to application
 * @param {HTMLObjectElement} object
 * @param {Object} options
 * @param {function} callBackFn
 */
Lib.Widget.addToWidgets = function(object, options, callBackFn) {
    if (!object.__libWidget) {
        object.__libWidget = {};
        object.__libWidget.options = options;
        object.__libWidget.fn = callBackFn;
        Lib.Widget._widgets.push(object);
    }
};
/**
 * Mask an element loading
 * @param {HTMLObjectElement} object
 * @param {string} text
 *
 */
Lib.Widget.overlay = function(object, text) {
    if (!object)
        return;
    if (!object.__LibMask) {
        var offset = $(object).offset(),
            width = $(object).innerWidth(),
            height = $(object).innerHeight(),
            displayText = text || Lib.trans('loading'),
            $overlay = $('<div style="top: 9px; position: absolute;' +
                'z-index: 5000;"></div>');
        $('<i class="ajax-loader"></i>').appendTo($overlay);
        $overlay.css({
            width: width, height: height,
            left: offset.left, top: offset.top
        }).addClass('overlay text-center');
        $overlay.appendTo('body');
        object.__LibMask = $overlay;
    }
};
/**
 *
 * @param {HTMLObjectElement} object
 */
Lib.Widget.unoverlay = function(object) {
    if (!object)
        return;
    if (object.__LibMask) {
        object.__LibMask.remove();
    }
};
/**
 * Create a message box
 * @param {string} message message of the alert box message
 * @param {string} type message type of the box
 * @param {boolean} colseIt auto destroy
 * @return {*|jQuery|HTMLElement}
 */
Lib.Widget.createMessage = function(message, type, colseIt) {
    var html = '<div class="alert-message alert-' + type + '"> ' +
                '<a class="close" href="#">×</a>' +
                '<p>' + message + '</p>' +
                '</div>';
    var $message = $(html);
        $message.css({'position': 'absolute', zIndex: '2000', top : '0px', margin : '20px' }).appendTo('body');
    if (colseIt);
        setTimeout(function() {$message.remove()}, 6000);
};

/**
 * @param {Object} event
 * @this {HTMLObjectElement}
 */
var WidgetHandler = function(event) {
    if (event.keyCode == 27)
        return;
    $(Lib.Widget._widgets).each(
        function() {
            var widgetParameters = this.__libWidget;
            if (widgetParameters.options.hide)
                $(this).hide();
            if (widgetParameters.fn)
                widgetParameters.fn();
        }
    );
};
// bind widget handler
$(document).bind('keydown click', WidgetHandler);