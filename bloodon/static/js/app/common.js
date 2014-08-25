/* ===================================================
 * common.js v0
 * ===================================================
 * Copyright 2013 BloodOn, Inc.
 * ========================================================== */
 "use strict";
 /**
 * Define the global main app
 */
var BloodOn;
BloodOn = BloodOn || {
    /**
     *
     */
    _projectPath: '',
    /**
     *
     */
    _main: null,
    /**
     *
     */
    _rootUrl: 'http://bloodon.pythonanywhere.com/'
};
/**
 * configure the menu
 */
$(document).ready(function() {
    // contact form
     /**
     * show alert form
     */
   var $contactModal = $('#contact_modal:eq(0)');
    var clickShowContactForm = function() {
        $contactModal.modal('toggle');
    };
    // connect the alert button
    $('#contact_us').click(clickShowContactForm);
    (new BloodOn.ContactUs()).init($contactModal);
});
/* ===================================================
 * alert.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
 'use strict';
/**
 * ContactUs manager of BloodOn application
 * @constructor
 */
BloodOn.ContactUs = function() {
    /**
     * whole core content
     * @type {HTMLObjectElement}
     * @private
     */
    this.content_ = null;
    /**
     * email input text
     * @type {HTMLInputElement}
     * @private
     */
    this.emailInput_ = null;
    /**
     * name input text
     * @type {HTMLInputElement}
     * @private
     */
    this.nameInput_ = null;
    /**
     * core text input text
     * @type {HTMLTextAreaElement}
     * @private
     */
    this.textInput_ = null;
    /**
     * form
     * @type {HTMLFormElement}
     * @private
     */
    this.form_ = null;
};
/**
 *
 * @type {{init: Function, validate: Function, changeIconState: Function, submit: Function, successSubmit: Function}}
 */
BloodOn.ContactUs.prototype = {
    /**
     * init the contact manager
     * @param {jQuery} $content
     */
    init: function($content) {
        this.content_ = $content[0];
        var $form = $('form', this.content_),
            form = $form[0],
            prefix = '#contact_us_',
            context = this;
        this.emailInput_ = $(prefix + 'email:eq(0)', form)
            .keyup(function() {context.validate();})[0];
        this.nameInput_ = $(prefix + 'name:eq(0)', form)
            .keyup(function() {context.validate();})[0];
        this.textInput_ = $(prefix + 'text:eq(0)', form)
            .keyup(function() {context.validate();})[0];
        $(prefix + 'submit:eq(0)', this.content_).click(
            function() {
                context.submit();
            }
        );
        this.form_ = form ;
    },
    /**
     * Validate form inputs
     * @return {Boolean}
     */
    validate: function() {
        var email = this.emailInput_,
            name = this.nameInput_,
            text = this.textInput_,
            form = this.form_,
            iconPrefix = '#contact_us_' + '%s' + '_validation' + ':eq(0)';
        // check for empty email
        var emailValid = Lib.isEmpty(email);
        this.changeIconState(email,
            $(iconPrefix.replace('%s', 'email'), form), emailValid);
        // check for empty name
        var nameValid = Lib.isEmpty(name);
        this.changeIconState(name,
            $(iconPrefix.replace('%s', 'name'), form), nameValid);

        // check for empty text
        var textValid = Lib.isEmpty(text);
        this.changeIconState(text,
            $(iconPrefix.replace('%s', 'text'), form), textValid);
        return (emailValid && nameValid && textValid);
    },
    /**
     *
     * @param {HTMLInputElement|HTMLTextAreaElement} object
     * @param {jQuery} $icon
     * @param {boolean} to
     */
    changeIconState: function(object, $icon, to) {
        var $parent = $(object).parents('div.control-group');
        $parent.removeClass(!to ? 'success' : 'error');
        $parent.addClass(to ? 'success' : 'error');
        $icon.css('backgroundColor', to ? 'green' : 'red').show();

    },
    /**
     * @return {*|boolean}
     */
    submit: function() {
        if (!this.validate())
            return false;
        // hide the element
        Lib.Widget.overlay(this.content_, 'loading');
        //
        var $mainForm = $(this.form_);
        $.ajax({
            type: $mainForm.attr('method'),
            url: $mainForm.attr('action'),
            data: $.extend({},
                { email: this.emailInput_.value },
                { name: this.nameInput_.value},
                { text: this.textInput_.value},
                { 'csrfmiddlewaretoken':
                    $mainForm.find('input[name="csrfmiddlewaretoken"]').val()}
            ),
            success: $.proxy(this.successSubmit, this)
        });
        return true;
    },
    /**
     * handles the success of alert submit
     * @param {JSON} data
     */
    successSubmit: function(data) {
        Lib.Widget.unoverlay(this.content_);
        $(this.content_).modal('hide');
        var state = data.state;
        Lib.Widget.createMessage(data.message, data.state, true);
    }
};
/**
 * define the Bo short cut of BlOOD
 * @type {*}
 */
window.BO = BloodOn;