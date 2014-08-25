/* ===================================================
 * alert.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
 'use strict';
/**
 * Alert manager of BloodOn application
 * @constructor
 */
BloodOn.AlertManager = function() {
    /**
     * @type {BloodOn.Main}
     */
    this.parent_;
     /**
     * @type {HTMLFormElement}
     * @private
     */
    this.form_;
    /**
     * url to create a new
     * @type {string}
     * @private
     */
    this.url_ = '/create/';
    /**
     * @type {HTMLDivElement}
     */
    this.$placeIndicator;
    /**
     * @type {number}
     * @private
     */
    this.place_alert_id;
    /**
     * @type {Date}
     * @private
     */
    this.date_alert;
    /**
     * @type {number}
     * @private
     */
    this.phone_num_alert;
    /**
     * @type {number}
     * @private
     */
    this.blood_id;
    /**
     * @type {jQuery}
     * @private
     */
    this.jMapCanvas_;
    /**
     * @type {jQuery}
     * @private
     */
    this.jUseMapToSelect_;
    /**
     * @type {jQuery}
     * @private
     */
    this.jCancelButton_;
    /**
     *
     */
    this.organizationsLayer_ = BloodOn.GeoTools.LayerGroup([]);
};
/**
 *
 * @type {{init: Function, validPost: Function, validatePhone: Function, validateDate: Function, changeIconState: Function, getPlacesKeys: Function, registerOrganizationsMarkers: Function, toggleOrganizationsMarkers: Function}}
 */
BloodOn.AlertManager.prototype = {
    /**
     * init the alert manager
     * @param {BloodOn.Main} parent
     */
    init: function(parent) {
        this.content_ = $('div#modal_alert')[0];
        this.parent_ = parent;
        var context = this,
            $form = $('form#create_alert', this.content_),
            content = this.content_;
        this.form_ = $form[0];
        // map canvas
        var $canvasMap = $('#map-canvas'),
            $useMapToSelect = $('#use_map_to_select_place:eq(0)'),
            $cancelButton = $('#cancel_select_organization') ;
        this.jMapCanvas_ = $canvasMap ;
        this.jCancelButton_ = $cancelButton ;
        $cancelButton.click (
            function() {
                context.cancelUsingMap();
            }
        );
        this.jUseMapToSelect_ = $useMapToSelect ;
        // region select place
        {

            /**
             * show alert form
             */
            var clickShowAlertForm = function() {
                /**
                 * Handles the hidden modal call back function
                 */
                function onHiddenModal() {
                    context.cancelUsingMap();
                }
                $(context.content_).modal('toggle').on('hidden', onHiddenModal);
            };
            // connect the alert button
            $('a#alert').click(clickShowAlertForm);
            /**
             * Handles the click event on use map to select button
             * @this {HTMLObjectElement}
             */
            var clickUseMapToSelect = function() {
                if (!this.isShown_) {
                    $(context.content_).css({'marginLeft': '80px'});
                    $canvasMap.css({ 'zIndex': 20000});
                    $cancelButton.show();
                    $(this).addClass('icon-white').
                        css('backgroundColor', '#0088cc');
                    // show organizations layers
                    context.toggleOrganizationsMarkers(true);
                }
                else {
                    context.cancelUsingMap();
                }
                this.isShown_ = !this.isShown_;
            };
            // bind on click event to use map to select button
            $useMapToSelect.click(clickUseMapToSelect);

            // valid the place
            var $iconPlaceValidation = $('#place_input_validation:eq(0)',
                    content),
                $inputPlace = $('#places_of_donation', content),
                $fake = $('#fake_place_of_donation', content);

            /**
             * show the input for edit
             * @this {HTMLObjectElement}
             */
            var showInputPlaceValue = function() {
                $inputPlace.show();
                $(this).hide();
            };

            $fake.click(showInputPlaceValue);
            /**
             * hide the input after edit
             */
            var hidePlaceInput = function() {
                $inputPlace.hide();
                $fake.show();
            };

            //noinspection FunctionWithInconsistentReturnsJS
            /**
             * Connect the auto completer place input
             */
            $inputPlace.typeahead({
                source: function(value, process) {
                    return $.get(
                        'system/search/medical',
                        { query: value },
                        function(data) {
                            context.getPlacesKeys(data);
                            var results = $.map(context.places_,
                                /**
                                 * success ajax return functions
                                 * @param {JSON} item
                                 * @return {string}
                                 */
                                    function(item) {
                                    return item.fields['name'] + '#' +
                                        item.fields['key_words'] +
                                        '#' + item.pk;
                                });
                            process(results);
                        });
                },
                matcher: function(item) {
                    var parts = item.toLowerCase().split('#'),
                        value = this.query.toLowerCase();
                    if ((parts[0].indexOf(value) != -1) ||
                        (parts[1].indexOf(value) != -1)) {
                        return true;
                    }
                },
                highlighter: function(item) {
                    var parts = item.split('#'),
                        html = '<div class=\'typeahead`\'>';
                    html += '<span>' + parts[0] + ' ( ' +
                        parts[1].substring(0, 10) + '... )' + '</span>';
                    html += '</div>';
                    return html;
                },
                updater: function(item) {
                    if (item) {
                        var parts = item.split('#');
                        context.place_alert_id = parts[2];
                        context.changeIconState($inputPlace[0],
                            $iconPlaceValidation, true);
                        $inputPlace.hide();
                        var str = parts[0] + ' ' + parts[1];
                        $fake[0].value = str;
                        hidePlaceInput();
                        return str;
                    }
                    else
                        context.changeIconState($inputPlace[0],
                            $iconPlaceValidation, false);
                }
            }).hide();
            context.inputPlaceValue = $inputPlace[0];
            context.$iconPlaceValidation = $iconPlaceValidation;
            context.$placeIndicator = $fake;
        }
        // region select date
        {
            var $iconDateValidation =
                    $('#date_input_validation:eq(0)', content),
                $datePicker = $('#time_of_donate', content)
                    .datepicker({
                        // min date current day
                        onSelect: function() {
                            context.
                                validateDate(this, $iconDateValidation);
                        }
                    })
                    .prop('readonly', true);
            /**
             * select date handler
             */
            var selectDateAlert = function() {
                $datePicker.datepicker('show');
            };
            $('#fire_time_of_donate:eq(0)', content).click(
                selectDateAlert
            );
        }
        // region phone edit
        {
            var $iconPhoneValidation = $('#phone_input_validation:eq(0)', content);
            var validatePhoneFunction = function () {
                context.validatePhone(this, $iconPhoneValidation);
            };
            $('#alert_phone:eq(0)', content).keyup(validatePhoneFunction).change (validatePhoneFunction);
        }
        // region select blood type
        {
            var $iconBloodValidation = $('#blood_select_validation:eq(0)', content);
            $('#blood_select:eq(0)', content).change(function () {
                context.validateBlood(this, $iconBloodValidation);
            });
        }
        /* region submit form
        {
            $('#submit_alert').click (function(){
                context.submit();
            });
        }*/



        this.toggleOrganizationsMarkers (false);
    },
    /**
     * Validate the current post
     * @return {*}
     */
    validPost: function () {
        // #FIXME
        // validate date
        // validate text ,
        return ((this.date_alert)
            && (this.phone_num_alert)
            && (this.place_alert_id)
            && (this.blood_id));
    },
    /**
     * function triggered when the select places options
     * switched to off
     */
    cancelUsingMap: function() {
        this.jMapCanvas_.css({'zIndex': 0});
        this.jCancelButton_.hide ();
        $(this.content_).css({'marginLeft': ''});
        this.jUseMapToSelect_.removeClass('icon-white')
            .css('backgroundColor', '');
        this.toggleOrganizationsMarkers(false);
        // in case of
        Lib.Widget.unoverlay(this.content_);
        this.jUseMapToSelect_ [0].isShown_ = false;
    },
    /**
     * Get the value of text body
     * @return {*|jQuery}
     */
    text: function (){
        return $('#body_alert', this.content_).val();
    },
    /**
     *
     * @param {HTMLSelectElement} object
     * @param {jQuery} $icon
     */
    validateBlood: function (object, $icon) {
      var value =  Math.abs (object[object.selectedIndex].id),
          valid = value > 0 ;
        this.blood_id = valid ? value : null ;
        this.changeIconState(object, $icon, valid);
    },
    /**
     *
     * @param object
     * @param $icon
     * @returns {boolean}
     */
    validatePhone: function (object, $icon) {
        var format = '## ### ###',
            value = object.value,
            cleanedValue = value.replace(/ /g, ''),
            valid = false;
        if (Math.floor(cleanedValue) === parseFloat(cleanedValue)) {
            var formatted = '',
                length = cleanedValue.length,
                format_length = format.length,
                i = 0,
                j = 0;
            while (j < length && i < format_length) {
                if (format[i] === '#')
                    formatted += cleanedValue[j++];
                else
                    formatted += ' ';
                i++;
            }
            if (j < length)
                formatted += cleanedValue.substr(j);
            object.value = formatted;
            if (length === 8) {
                valid = true;
            }
            else {
                valid = false;
            }
        }
        this.changeIconState(object, $icon, valid);
        this.phone_num_alert = valid ? cleanedValue : undefined;
        return valid;
    },
    /**
     *
     * @param object
     * @param $icon
     * @returns {boolean}
     */
    validateDate: function (object, $icon) {
        var value = object.value,
            isSet = value !== '';
        if (isSet)
            this.date_alert = object.value;
        else
            this.date_alert = null;
        this.changeIconState(object, $icon, isSet);
        return isSet;
    },
    /**
     *
     * @param {HTMLInputElement} object
     * @param {jQuery} $icon
     * @param {boolean} to
     */
    changeIconState: function (object, $icon, to) {
        var $parent = $(object).parents('div.control-group');
        $parent.removeClass(!to ? 'success' : 'error');
        $parent.addClass(to ? 'success' : 'error');
        $icon.css('backgroundColor', to ? 'green' : 'red').show();
    },
    /**
     * return the organizations josn objects
     * @param {JSON} data
     */
    getPlacesKeys: function (data) {
        this.places_ = $.parseJSON(data.data);
    },
    /**
     * registers the loaded organizations on the map
     */
    registerOrganizationMarker: function (id, data) {
        var context = this,
            title = data.name,
            marker = BloodOn.GeoTools.Marker(
                    new BloodOn.GeoTools.LatLng(data.lat, data.lng)
                ),
            icon = BloodOn.GeoTools.Icon(
                    {'iconUrl': 'https://a.tiles.mapbox.com/v3/marker/pin-m-hospital+f63a39.png'}
            );
            marker.__BOObject = {
                'type_': 'organization',
                'title_': title,
                'id_': id
            };
            BloodOn.GeoTools.setIconMarker(marker, icon);
            BloodOn.GeoTools.bindPopup(marker, title, {closeButton: false});


            BloodOn.GeoTools.bindMarkerEvents(marker,
                {
                    click: function (e){
                        context.markerClick.call (context, e);
                    },
                    mouseout: context.markerOut,
                    mouseover : context.markerOver
                }
            );
            this.organizationsLayer_.addLayer (marker);
            return marker;
    },
    /**
     *
     */
    markerOver : function(e) {
        BloodOn.GeoTools.openPopupMarker(BloodOn.GeoTools.getMarker(e));
    },
    /**
     *
     */
    markerOut : function(e) {
        BloodOn.GeoTools.closePopupMarker(BloodOn.GeoTools.getMarker(e));
    },
    /**
     *
     */
    markerClick : function (e) {
        var marker = BloodOn.GeoTools.getMarker(e),
            context = this,
            title = marker.__BOObject.title_,
            id = marker.__BOObject.id_;
        context.inputPlaceValue.value = title;
        context.place_alert_id = id;
        context.$placeIndicator[0].value = title;
        $(context.inputPlaceValue).hide();
        context.$placeIndicator.show();
        context.changeIconState(context.inputPlaceValue, context.$iconPlaceValidation, true);
        context.cancelUsingMap ();
                // hidePlaceInput ();
     },
    /**
     * hide show organisations
     * @param {Boolean} show
     */
    toggleOrganizationsMarkers: function (show) {
        // use geo helper to hide layers
        BloodOn.GeoTools.toggleLayerGroup(this.organizationsLayer_, show);
        this.parent_.toggleAlertsMarkers(!show);
    },
    /**
     * submit a new alert
     * @returns {boolean}
     */
    submit: function() {
        if (!this.validPost())
            return false;
        // hide the element
        Lib.Widget.overlay(this.content_, 'loading');
        // show
        //
        var $mainForm =  $(this.form_);
        $.ajax({
            type: $mainForm.attr('method'),
            url: this.url_,
            data: $.extend({},
                { blood : this.blood_id },
                { text : this.text ()},
                { organization: this.place_alert_id},
                { date_for : this.date_alert},
                { contact : this.phone_num_alert},
                { 'csrfmiddlewaretoken':  $mainForm.find('input[name="csrfmiddlewaretoken"]').val()}
            ),
            success: $.proxy(this.successSubmit,this),
            error: $.proxy(this.failSubmit,this)
        });
    },
    /**
     * handles the success of alert sumbit
     * @param data
     */
    successSubmit: function(data) {
        Lib.Widget.unoverlay(this.content_);
        $(this.content_).modal('hide');
    },
    /**
     * handle the fail on submit
     * @param data
     */
    failSubmit: function (data){
        // show error in error for list
        Lib.Widget.unoverlay(this.content_);
    }
};