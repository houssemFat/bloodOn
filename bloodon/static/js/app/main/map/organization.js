/* ===================================================
 * alert.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ==========================================================
 * @require [Lib.js, Chart.js, JQuery, BloodOn]
  */
 'use strict';
/**
 *
 * @param {BloodOn.Main} parent
 * @param {string} id
 * @param {Object} data
 * @constructor
 */
BloodOn.OrganizationManager = function(parent, id, data) {
    /**
     *
     * @type {BloodOn.Main}
     * @private
     */
    this.parent_ = parent;/**
     *
     * @type {*}
     * @private
     */
    this.title_ = null;
    /**
     * @type {string}
     * @private
     */
    this.id_ = id;
    /**












     * @type {number}
     * @private
     */
     this.pagecount_ = 0;/**
      * url for marker information's
      * @type {string}
     * @private
      */
    /**
     *
      * @type {string}
     * @private
     */
    this.basicUrl_ = '/home/place/';
    /**
      * url for marker information's
      * @type {string}
     * @private
      */
     this.infosUrl_ = this.basicUrl_ + 'infos/%s/'.replace('%s', this.id_);
     /**
      * url for marker detail's
      * @type {string}
      * @private
      */
     this.detailsUrl_ = this.basicUrl_ +
         'details/%s/%p/'.replace('%s', this.id_);
    /**
      * modal for send message
      * @type {HTMLObjectElement}
      * @private
      */
     this.$sendToModal_ = null;
    /**
      * id for blood object message
      * @type {string}
      * @private
      */
     this.sendMeToID_ = null;
    /**
     * @type {Object}
     * @private
     */
     this.marker_ = null;
     /**
     * @type {function}

     * @public
     */
     this.getMarker = function (){
         return this.marker_;
     };     /**
      * url for marker detail's
      * @type {number}
     * @private
      */
     this.alertsCount_ = 0;

     /**
      * url for marker detail's
      * @type {number}
      * @private
      */
     this.updateCount = function (data){
        if (this.alertsCount_ !== data.count){
           this.alertsCount_ = data.count ;
            var animHtml = '<svg width="50px" height="50px"> <circle cx="25" cy="25" r="24" stroke-width="2px" style="stroke: #ff0000; fill: #ffffff;"> <animate attributeName="stroke" attributeType="XML" from="#ff0000" to="#ffffff" begin="0s" dur="0.7s" fill="remove" repeatCount="indefinite"/> </circle> <circle cx="25" cy="25" r="24" style="stroke: none; fill: #ff0000;"> <animate attributeName="r" attributeType="XML" from="15" to="24" begin="0s" dur="0.7s" fill="remove" repeatCount="indefinite"/> </circle> </svg>',
                html ='<div style="background-color:' + Lib.getRandomColor() +'"><span id="count">' + this.alertsCount_ + '</span></div>',
                context = this;
                this.getMarker().setIcon (BO.GeoTools.divIcon({'html' : animHtml}));
                setTimeout (function (){
                    context.getMarker().setIcon (BO.GeoTools.divIcon({'html' : html}));
                }, 
                3000);
        }
     };
    // init the class object
    this.init(data);
};
/**
 *
 * @type {{init: Function, validPost: Function, validatePhone: Function, validateDate: Function, changeIconState: Function, getPlacesKeys: Function, registerOrganizationsMarkers: Function, toggleOrganizationsMarkers: Function}}
 */
BloodOn.OrganizationManager.prototype = {
    /**
     * Entry function to organization manager builder
     * @param {Object} data initial provided data
     */
    init: function(data) {
        var map = BO.GeoTools._map,
            options = {html: ''},
            latitude,
            longitude,
            mapMarker,
            title,
            color,
            count,
            context = this,
            icon = null;
        color = Lib.getRandomColor();
        latitude = BO.GeoTools.parseCoordinate(
            data['lat']);
        longitude = BO.GeoTools.parseCoordinate(
            data['lng']);
        count = data['count'];
        options['html'] = '<div style="background-color:' + color +
            '"><span id="count">' + count + '</span></div>';

        title = data['name'];
        icon =  BO.GeoTools.divIcon(options);
        mapMarker = BO.GeoTools.Marker([latitude, longitude],{
            icon: icon,

            title: title
        });
        //mapMarker.addTo(map);
        // save count
        this.alertsCount_ = count;
        // save title
        this.title_ = title;
        // save the marker
        this.marker_ = mapMarker;
        // region init function
        {
        var context = this,
            markerInfo = function(marker) {
                context.getMarkerInfo();
            };
        var markerDetails = function(marker) {
            context.getMarkerDetails(true);
        };
        BO.GeoTools.bindMarkerEvents(mapMarker,
            {
                'mouseover': markerInfo,
                'click': markerDetails
            });

        }
        // region modal saving
    },
    /**
     *
     * @return {*}
     */
    getMarkerInfo: function() {
        $.ajax({
            type: 'get',
            url: this.infosUrl_,
            success: $.proxy(this.successGetMarkerInfo, this),
            error: function() {}
        });
    },
    /**
     *
     * @return {*}
     */
    successGetMarkerInfo: function(data) {
        // show modal
        // var chart = new Lib.Chart.PieChart (data.data);
        BloodOn.GeoTools.bindPopup(this.marker_, data.html, {}, true);
    },
    /**
     *
     */
    getMarkerDetails: function(isnew) {
        // set current active place
        this.parent_.setActiveOrganization(this);
        if (isnew)
            this.pagecount_ = 0;
        $.ajax({
            type: 'get',
            url: this.detailsUrl_.replace('%p', String(this.pagecount_)),
            success: $.proxy(this.successGetMarkerDetails, this, isnew),
            error: function() {}
        });
    },
    /**
     *
     * @param {Boolean} isNew check if first time loaded
     * @param {JSON} data  organization details server response
     */
    successGetMarkerDetails: function(isNew, data) {
        var $html = $(data.html),
            $container = $(this.parent_.getPlaceInfoModal()),
            $body = $container.find('#place_alerts:eq(0)'),
            title = $container.find('.modal-title:eq(0)').html(this.title_);
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
        // send to freind
        //icon-envelope
        // FIXME
        // (jquery dialog)
        /*$container.dialog({
          height: 600,
          width: 480,
          modal: true,
          draggable: false,
          title: this.title_
        });**/
        $container.modal('show');
    }

};
/**
 *
 * @param {string} id
 * @param {string} title
 * @param {jQuery} source
 * @static
 */
BloodOn.OrganizationManager.sendMeAsMessage =  function (id, title, source){
    BloodOn.OrganizationManager.MessageToID = id ;
    var $modal = BloodOn.OrganizationManager.jMessageToModal,
        $title = $modal.find('.modal-title').empty().html(title);
    $title.find ('i').each(
            function() {
                $(this).addClass('icon-white');
            }
        );
    //$title.empty().append(jNewTitle);
    $modal.modal('show');//.css({'zIndex' : parseInt(zIndex) + 1});
    if (source){
        BloodOn.OrganizationManager.jbackModalToOpen = source ;
        source.modal('hide');
    }
    else
        BloodOn.OrganizationManager.jbackModalToOpen = undefined;
};
/**
 *
 * @type {jQuery}
 * @static
 */
 BloodOn.OrganizationManager.jMessageToModal = null ;

/**
 *
 * @type {string}
 * @static
 */
 BloodOn.OrganizationManager.MessageToID = null ;
/**
 *
 * @type {jQuery}
 * @static
 */
 BloodOn.OrganizationManager.jbackModalToOpen = null ;
// init variable
$(document).ready(function(){
    var $modal = $('#modal_send_to');
    $modal.on('hidden',
            function() {
                if (BloodOn.OrganizationManager.jbackModalToOpen)
                    BloodOn.OrganizationManager.jbackModalToOpen.modal('show');
            }
        );
    BloodOn.OrganizationManager.jMessageToModal = $modal ;
    (new BloodOn.MessageMeManager($modal)).init ();
});
