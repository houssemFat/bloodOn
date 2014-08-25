/* ===================================================
 * calendar.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
 'use strict';
/**
 *
 * @param {BloodOn.Main} parent
 * @constructor
 */
BloodOn.CalendarManager = function(parent) {
    /**
     * @type {BloodOn.Main}
     * @private
     */
    this.parent_ = parent;
    /**
     * @type {HTMLObjectElement}
     * @private
     */
    this.content_ = $('div#container-calendar:eq(0)')[0];
    /**
     * @type {HTMLObjectElement}
     * @private
     */
    this.modal_ = $('div#modal_calendar:eq(0)')[0];
    /**
     * @param {string} principal url
     * @private
     */
    this.url_ = 'home/calendar/event/';
    /**
     * @param {string} show on hover
     * @private
     */
    this.infoUrl_ = this.url_ + 'show/';
    /**
     * @param {string} show detail
     * @private
     */
    this.detailsUrl_ = this.url_ + 'details/%d/%p';
    /**
     * @param {string} show on hover
     * @private
     */
    this.dateToLoad_ = null;
    /**
     * @param {string} title of date to show on modal
     * @private
     */
    this.title_ = null;
    /**
     * days of current  
     */
    this.days_ = {};
    /**
     * days of current  
     */
    this.getObjectById  = function (id){
        return this.days_[id].object ;
    };
};
/**
 *
 * @type {{init: Function, submit: Function, getEventDetails: Function, successGetEventDetails: Function}}
 */
BloodOn.CalendarManager.prototype = {
    /**
     *
     */
    init: function() {
        var context = this;
        $('.cell-day', this.content_).each(function() {
            context.days_ [this.id.replace(/\//g, '-')] = { object : this , bind : false, count : 0} ;
        });
        var jShowCalendar = $('#show_calendar'),
            jCalendar = $('#main_calendar_view');
        jShowCalendar.click(
            /**
             * Handle the click event on mobile display
             * @param {Event} event
             */
            function(event) {
                event.preventDefault();
                jCalendar.slideToggle();
            }
        );
        // connect load more
         $('#load_more', this.modal_).mouseenter(function(event) {
               context.getEventDetails(false, undefined);
               event.stopImmediatePropagation ();
        });
    },
    /**
     *
     */
    bind : function(data) {
        var count,
            dayDictionary,
            context = this,
            object;
        for (var when in data){
            count = data[when];
            dayDictionary = this.days_[when];
            if (!dayDictionary)
                continue ;
            // firt time
            object = this.getObjectById(when);
            if (!dayDictionary.bind){
                $(object).mouseenter(function() {
                        context.submit (this);
                    }
                ).click(function() {
                    context.getEventDetails(true, this);
                    }
                ).mouseleave(
                    function() {
                        $(this).find('.alert-event:eq(0)').tooltip('destroy');
                    }
                ).addClass('event');
                 this.days_[when].bind = true ;
                 $(object).append ( $('<div class="alert-event"></div>'));
            };
            
            if (dayDictionary.count !== count){
                $(object).find ('.alert-event:eq(0)')
                .html (count).addClass('alert-event-anim');
                context.setAnimation (object);
            }   
            dayDictionary.count = count ;
            // update
        }
        
    },
    /**
     *
     */
    setAnimation : function(object) {
        setTimeout (function(){
            $(object).find ('.alert-event:eq(0)').removeClass('alert-event-anim'); 
            }, 2000
        );
    },
    /**
     *
     * @param {HTMLObjectElement} object
     */
    submit: function(object) {
        $.ajax({
            type: 'get',
            url: this.infoUrl_ + object.id + '/',
            /**
             *
             * @param {JSON} data
             */
            success: function(data) {
                //$(this).tooltip('destroy');
                $(object).find(".alert-event:eq(0)").tooltip({html : true, title : data.html/*, title : object.id*/}).tooltip('show');
            },
            /**
             *
             * @param {JSON} data
             */
            error: function(data) {
                Lib.Widget.unoverlay(this.content_);
            }
        });
    },
    /**
     *
     */
    getEventDetails: function(isnew, object) {
        // set current active place
        if (isnew){
            this.dateToLoad_ = object.id;
            // this.title = object.id ;
            this.title_ = object.title;
            this.pagecount_ = 0;
        }
        var url = this.detailsUrl_ ;
            url = url.replace('%p', String(this.pagecount_)) ;
            url = url.replace('%d', this.dateToLoad_ );

        $.ajax({
            type: 'get',
            url: url,
            success: $.proxy(this.successGetEventDetails, this, isnew),
            error: function() {}
        });
    },
    /**
     *
     * @param {Boolean} isNew
     * @param {JSON} data
     */
    successGetEventDetails: function(isNew, data) {
        var $html = $(data.html),
            $container = $(this.modal_),
            container = $container[0],
            $body = $container.find('#alerts_body:eq(0)', container),
            title = $container.find('.modal-title:eq(0)', container).html(data.at);
        if (isNew) {
            $body.empty();
        }
        $body.append($html);
        this.pagecount_ = $body.find('.app-alert-item').length;
        $html.find('.share-item').click(
            function() {
                $(this).closest('.item-actions')
                    .find('.share-inside').slideToggle();
            }
        );
        $html.find('.send-to-item').click(
            function() {
                var $parent = $(this).closest('.app-alert-item'),
                    title = $parent.find('.app-alert-item-body')
                        .html().replace('<br>', ' : ');
                BloodOn.OrganizationManager.sendMeAsMessage(
                    $parent.attr('id'), title, $container
                );

            }
        );
        $container.modal('show');
    }
};