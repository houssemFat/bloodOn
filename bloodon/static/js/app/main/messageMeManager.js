/* ===================================================
 * calendar.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
 'use strict';
/**
 *
 * @param {jQuery} jcontent
 * @constructor
 */
BloodOn.MessageMeManager = function(jcontent) {
    /**
     *
     * @type {Array}
     * @private
     */
    this.emails_ = [];
    /**
     *
     * @type {HTMLObjectElement}
     * @private
     */
    this.content_ = jcontent[0];
    /**
     *
     * @type {HTMLFormElement}
     * @private
     */
    this.form_ = null;
    /**
     *
     * @type {string}
     * @private
     */
    this.url_ = 'public/share/send-mail/';
    /**
     *
     * @type {HTMLTextAreaElement}
     * @private
     */
    this.text_ = null;
};
/**
 *
 * @type {{init: Function, excludeChoice: Function}}
 */
BloodOn.MessageMeManager.prototype = {
    /**
     * Init the function of the blood choice select
     */
    init: function() {
        var container = this.content_,
            context = this,
            prefix = '#send_to_',
            jListContainer = $(prefix + 'list_addresses' + ':eq(0)', container),        
            bindEmails = function(event){
                var emails = context.emails_,
                    value = this.value;
                if (emails.indexOf(value) > -1)
                    return;
                if (Lib.isEmail(this.value)) {
                    var jParent = $('<span class="' +
                            'email-item-message"></span>'),
                        parent = jParent[0];
                    $('<span class="email-item-text">' +
                        value + '</span>').appendTo(parent);
                        jParent.appendTo(jListContainer);
                    var close = $('<span ' +
                        'class="delete hand" >' +
                        '×</span>').appendTo(parent).click(
                            function() {
                                jParent.remove();
                                context.emails_ =
                                    Lib.popFromArray(emails, value);
                            }
                        );

                        context.emails_.push(value);
                        this.value = '';
                }
                else {
                    $(this).css({color: 'red'});
                    var object = this;
                    setTimeout(
                        function() {
                            $(object).css({color: ''});
                        },
                        2000
                    );
                }
            };
        
        $(prefix + 'email' + ':eq(0)', container).keyup(
            function(event) {
                /**
                 * @this {HTMLInputElement}
                */
                if (event.keyCode == 13) {
                    bindEmails.call(this, event);
                }
            })
            .blur (function(){
             bindEmails.call(this, event);
        });
        // assign text area
        this.text_ = $(prefix + 'text' + ':eq(0)', container)[0];
        this.form_ = $('form', container).submit(function() {return false;})[0];
        $(prefix + 'send_button' + ':eq(0)', container).click(
            function() {
                context.sendMessage();
            }
        );
    },
    /**
     * Add excluded choice
     */
    sendMessage: function() {
        var length = this.emails_.length,
            emails = this.emails_,
            emailsString = '',
            alertID = BloodOn.OrganizationManager.MessageToID,
            text = this.text_.value;
        if (length < 1)
            return;
        for (var i = 0; i < length; i++) {
            emailsString += emails[i] + '#';
        }
        // hide the element
        Lib.Widget.overlay(this.content_, 'loading');
        $.post(
            this.url_,
            $.extend(
                {list: emailsString, id: alertID, text: text},
                { 'csrfmiddlewaretoken':  $(this.form_).find('input[name="csrfmiddlewaretoken"]').val()}
            ),
            $.proxy(this.successSubmit, this)
        );
    },
    /**
     * handles the success of alert
     * @param {JSON} data
     */
    successSubmit: function(data) {
        Lib.Widget.unoverlay(this.content_);
        $(this.content_).modal('hide');
    }
};