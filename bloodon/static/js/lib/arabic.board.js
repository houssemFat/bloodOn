/* ===================================================
 * arabic-board.js v0
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
 * @constructor
 */
Lib.ArabicKeyBoard = function() {
    /**
     * Main board_ object
     * @type {HTMLObjectElement}
     * @private
     */
    this.board_IntellijIdeaRulezzzIntellijIdeaRulezzz = null;
    /**
     * Main board_ object
     * @type {HTMLObjectElement}
     * @private
     */
    this.keyBoard_ = null;
    /**
     * Main board_ object
     * @type {HTMLObjectElement}
     * @private
     */
    //this.touchBoard_ = null;
    /**
     * Current active target of the arabic writer
     * @type {HTMLInputElement||HTMLTextAreaElement}
     * @private
     */
    this.currentActiveTarget_ = null;
    /**
     * Indicates weather the shift key is active
     * @type {boolean}
     * @private
     */
    this.isShift_ = false;
    /**
     *  list of all write in arabic location
     * @type {*|jQuery|HTMLElement}
     */
    this.arabicPens_ = null;
    /**
     * Indicates weather the cap key is active
     * @type {boolean}
     */
    this.isCap_ = false;
    /**
     * Keys to ignore from key board_ to continue event propagation
     * @type {Array}
     */
    this._keysToJump = ['8', '116', '17', '16', '13'];
    /**
     * shift key
     * @type {Array}
     */
    this.specialKeys_ = [];
};
/**
 * 
 * @type {Array}
 * @static
 */
Lib.ArabicKeyBoard.STATES = ['S'/*symboles*/,'N'/*numeric*/, 'L' /*letters*/];
/**
 *
 * @type {{}}
 */
Lib.ArabicKeyBoard.KEYS ={
    32: { l:' ', u:' ' },
48: { l:'ُ', u:'0' },
49: { l:'‟', u:'1' },
50: { l:'”', u:'2' },
51: { l:'«', u:'3' },
52: { l:'»', u:'4' },
53: { l:'ا', u:'5' },
54: { l:'ً', u:'6' },
55: { l:'ْ', u:'7' },
56: { l:'ّ', u:'8' },
57: { l:'ِ', u:'9' },
65: { l:'ض', u:'۰' },
66: { l:'ز', u:'%' },
67: { l:'و', u:'&' },
68: { l:'ي', u:'€' },
69: { l:'ث', u:'۲' },
70: { l:'ب', u:']' },
71: { l:'ل', u:'[' },
72: { l:'ا', u:'#' },
73: { l:'ه', u:'۸' },
74: { l:'ت', u:'أ' },
75: { l:'ن', u:'إ' },
76: { l:'م', u:'ئ' },
77: { l:'ك', u:'ؤ' },
78: { l:'ى', u:'؟' },
79: { l:'خ', u:'۹' },
80: { l:'ح', u:'¤' },
81: { l:'ش', u:'\'' },
82: { l:'ق', u:'۳' },
83: { l:'س', u:'$' },
84: { l:'ف', u:'۵' },
85: { l:'ع', u:'۷' },
86: { l:'ر', u:'|' },
87: { l:'ذ', u:'>' },
88: { l:'ء', u:'@' },
89: { l:'غ', u:'۴' },
90: { l:'ص', u:'۱' },
186: { l:'د', u:'£' },
187: { l:'ٍ', u:'+' },
188: { l:'ة', u:'?' },
190: { l:'٬', u:'‚' },
191: { l:'\'', u:'.' },
192: { l:'ط', u:'ؤ' },
219: { l:'َ', u:'°' },
220: { l:'ظ', u:'لا' },
221: { l:'ج', u:'^' },
222: { l:'"', u:'²' },
223: { l:'.', u:'!' },
226: { l:'ﭫ', u:'<' },
8: { l:'←', u:'←' },
13: { l:'↲', u:'↲' }
};
/**
 * init the key board_
 */
Lib.ArabicKeyBoard.prototype.init = function() {
    // get the main board_
    var context, board;
    this.board_ = $('#arabic_key_board')[0];
    $(this.board_).css ({top : '', left : ''});
    // get all write for arabic inputs
    this.arabicPens_ = $('.write-arabic');

    context = this;
    board = this.board_;

    
    /**
     * Connect draggable function
     */
    $(board).draggable({
        drag: function(event, ui) {
                var object = ui.helper.context ;
                
            }
    }).click(
        /**
         * Stop the event propagation (prevent hiding the main board)
         * @param {event} event
         */
          function(event) {
            event.stopPropagation();
        }
    );
    /**
     * Connect cap event
     */
    $('#20:eq(0)', board).click(
        /**
         * Manage code for cap key
         * @param {event} event
         */
        function(event) {
            context.manageCodes(20, event, true);
        }
    ).each(function(){context.specialKeys_.push(this);});;
    /**
     * Connect key board_ inputs
     */
    $('.keyboard', board).each(
        /**
         * Click on the input
         */
        function() {
            var  id = this.id ;
            Lib.ArabicKeyBoard.KEYS[id]['object'] = this;
            this.value = Lib.ArabicKeyBoard.KEYS[id].l;
        }
    )
        .click(
        /**
         * Handle the click event on the button
         * @param {event} event
         */
        function(event) {
            context.manageCodes(this.id, event || window.event, true);
            event.stopPropagation();
        }
    );
    // shift key
    {
    /**
     * Connect shif key inputs
     */
    $('#17', board).click(
        /**
         * Handle the click event on the button
         * @param {event} event
         */
        function(event) {
            context.isShift_ = !context.isShift_;
            var isShift = context.isShift_  ;
            context.switchKeyBoardToCap(event);
            event.stopPropagation();
            context.switchState($(this), isShift);
            Lib.switchIconState ($(this), isShift);
        }
    ).each(function(){context.specialKeys_.push(this);});
    }
    /**
     * connect hide key board_ button
     */
    $('#arabic_key_board_hide:eq(0)', board).click(
        /**
         * Handle the onclick event of hide ket board
         */
        function() {
            context.disable();
        }
    );
    /**
     * Connect all buttons of arabic key board_
     */
    this.arabicPens_.click(function() {
            context.enable($('#' + $(this).attr('for') + ':eq(0)')[0]);
        }
    );
    /*
    {
    *
     *
     *
    $('#switch_state').click(function() {
            var active = false ;
            if (context.writeMethod_ === 'key'){
                $(context.touchBoard_).show ();
                $(context.keyBoard_).hide ();
                context.writeMethod_ = 'touch';
                active = true ;
            }
            else{
                $(context.touchBoard_).hide ();
                $(context.keyBoard_).show ();
                context.writeMethod_ = 'key';
            }
            context.switchState($(this), active);
            Lib.switchIconState ($(this), active);
        }
    );
    }*/

    $('#mobile_symbol_screen').click(function() {
            var state = this.__appClickToggleState;
            $('.keys-char', context.board_)[state ? 'show' : 'hide']();
            $('.keys-symbol', context.board_)[!state ? 'show' : 'hide']();
            Lib.switchIconState($(this), !state);
            this.__appClickToggleState = !this.__appClickToggleState;
        }
    );
};
/**
 * Prevents the event propagation
 * @param {Event} event
 */
Lib.ArabicKeyBoard.prototype.stopEvent = function(event) {
    if (event.preventDefault)
        event.preventDefault(); // Standard technique
    if (event.returnValue)
        event.returnValue = false;
};
/**
 * @param {HTMLObjectElement} source
 * @param {HTMLInputElement||HTMLTextAreaElement} target
 * @param {Event} event
 */
Lib.ArabicKeyBoard.prototype.FireKey = function(source, target, event) {
    // get the character in the saved objects
    var key = this.getState(event),
        id = source.id ;
    // delete Code
    if (id === '8') {
        this.clearText(target, event);
    }
     // enter Key
    else if (id === '13') {
        this.appendCharacter(target, '\n');
    }
    else{
        // append the value
        this.appendCharacter(target, Lib.ArabicKeyBoard.KEYS[id][key]);
    }
    // change the color of current key
    this.setColor(source, Object(key));
};
/**
 * return the key board state (lower case, capital case)
 * @param {Event} event
 * @return {string}
 */
/**
 *
 * @param event
 * @returns {string}
 */
Lib.ArabicKeyBoard.prototype.getState = function(event) {
    // get current key type
    var state = (this.isCap_ ? 'u' : 'l'),
        shift = this.isShift_;// || (event || window.event).shiftKey;
    // inverse the situation in shift mode
    if (shift)
        state = (!this.isCap_ ? 'u' : 'l');
    return state;
};
/**
 * append character to current target
 * @param {HTMLInputElement||HTMLTextAreaElement} target
 *           target text zone destination
 * @param {string} character character to append
 */
Lib.ArabicKeyBoard.prototype.appendCharacter = function(target,
                                                        character) {
    //if (!$.browser.mozilla)
        target.setRangeText('');
    // split the source into two parts
    var start = target.value.substr(target.selectionStart),
        end = target.value.substr(0, target.selectionStart);
    // append the character and fire all related events
    $(target).val(end + character + start).
            keydown().keypress().keyup();
    // update the caret position
    this.moveCaretTo(target, end.length + 1);
};
/**
 * this function execute when the user press 'Del' button
 * @param  {HTMLInputElement||HTMLTextAreaElement} target
 */
Lib.ArabicKeyBoard.prototype.clearText = function(target) {
        // get the caret position

    if (!$.browser.mozilla)
        target.setRangeText('');
    // split the source into two parts
    var start = target.value.substr(target.selectionStart),
        end = target.value.substr(0, target.selectionStart);
    // remove designed character and fire all related events
    $(target).val(end.substr(0, end.length - 1) + start).
        keydown().keypress().keyup();
    this.moveCaretTo(target, end.length - 1);
    };
/**
 * Move the caret to designed position
 * @param {HTMLInputElement||HTMLTextAreaElement} object target
 * @param {number} position position to move to
 */
Lib.ArabicKeyBoard.prototype.moveCaretTo = function(object, position) {
    // For internet explorer
    if (object.setSelectionRange) {
        object.focus();
        object.setSelectionRange(position, position);
    }
    // For others
    else if (object.createTextRange) {
        var range = object.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
    }
};
/**
 * Simulate the click on key down or change color on click
 * @param {HTMLObjectElement} input
 * @param {Object} code
 */
Lib.ArabicKeyBoard.prototype.setColor = function(input, code) {
    $(input).css({backgroundColor: 'orange'});
    setTimeout(function() {
        $(input).css({backgroundColor: ''});
    }, 250);
};
/**
 *
 * @param {Event} event
 */
Lib.ArabicKeyBoard.prototype.handleKey = function(event) {
    var e = event || window.event,
        context = this;
    //this.isShift_ = e.shiftKey;
    this.manageCodes(e.keyCode, e, false);
 };
/**
 * Switch the key board state to lower, capital states
 * @param {Event} event
 */
Lib.ArabicKeyBoard.prototype.switchKeyBoardToCap = function(event) {
    var key = this.getState(event);
    $('.keyboard', this.board_).each(function() {
        this.value = Lib.ArabicKeyBoard.KEYS[this.id][key];
    });
};
/**
 * Main function of the library, it set the \
 * correspondent values switch codes
 * @param {number} keyCode code of current key (pressed) or button clicked
 * @param {Event} event the event window
 * @param {boolean} click indicates weather the
 * source is the htmlElement Object or a key event
 */
Lib.ArabicKeyBoard.prototype.manageCodes = function(keyCode, event, click) {
    var code = String(keyCode),
        target = Lib.ArabicKeyBoard.currentActiveTarget_,
        e = event || window.event;
    if (code === '27') {
        this.disable();
        return;
    }
    // Change display to capital keys
    if (code === '20') {
        this.isCap_ = !this.isCap_;
        var state = this.isCap_ ;
        $capKey = $('#20:eq(0)', this.board_);
        this.switchState($capKey, state);
        Lib.switchIconState ($capKey, state);
        this.switchKeyBoardToCap(e);
        return;
    }
    // Change shift
    if (code === '17' || code === '16') {
        this.isShift_ = !this.isShift_;
        var state = this.isShift_ ;
        $shift = $('#17:eq(0)', this.board_);
        this.switchState($shift, state);
        Lib.switchIconState ($shift, state);
        this.switchKeyBoardToCap(e);
        return;
    }
    //
    if (click) {
        //.click(e);// IE
        this.stopEvent(e);
    }
    if (!e.ctrlKey) {
        if (Lib.ArabicKeyBoard.KEYS[code]) {
            if (!click) {
                this.stopEvent(e);
            }
            this.FireKey(Lib.ArabicKeyBoard.KEYS[code].object, target, e);
        }
    }
};
/**
 *
 * @param icon
 */
Lib.ArabicKeyBoard.prototype.switchState = function($button, state) {
    var prefix = 'key-state-',
        toggle = prefix + (state ? 'active' : 'idle') +
            ' ' + prefix + (state ? 'idle' : 'active');
    $button.toggleClass(toggle);
};
/**
 *  Activates the arabic key board_
 * @param {HTMLInputElement||HTMLTextAreaElement} target
 */
Lib.ArabicKeyBoard.prototype.enable = function(target) {
    $(this.board_)
        .css({
        'left' : '0px',
        'top' : '0px'}
    );
    var halfWidth = $(this.board_).innerWidth() / 6,
        $target = $(target);
    $target.show();
    var offset = $target.offset(),
        height = $target.innerHeight(),
        boardHeight = $(this.board_).innerHeight(),
        context = this,
	top = offset.top - boardHeight ;
    if (top < 0)
	top = offset.top + height + 5;
    // calculate the position
   // $(object).css ({'height' : $(object).innerHeight() + 'px'});
    $(this.board_)
        .css({
        'left' : (offset.left - halfWidth) + 'px',
        'top' : top + 'px'}
    )
        .show();
    Lib.Widget.addToWidgets(this.board_,
        /***
         * Function to handle after the widget is closed
         */
        function() {
        $(document).unbind('keydown', $.proxy(context.handleKey, context));
      });
    $(document).bind('keydown', $.proxy(context.handleKey, context));
     $target.show().select();
    Lib.ArabicKeyBoard.currentActiveTarget_ = target;
};
/**
 * Disable the key board_ .
 */
Lib.ArabicKeyBoard.prototype.disable = function() {
    $(this.board_).hide();
    $(document).unbind('keydown', this.handleKey);
};
// execute the function
$(document).ready(function() {
    BO.keyboard = new Lib.ArabicKeyBoard();
    BO.keyboard.init();
    //BO.keyboard.Touch_ = new Lib.ArabicKeyBoard.Touch (BO.keyboard);
});
