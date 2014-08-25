/* ===================================================
 * main.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
/**
 *
 * @constructor
 */
 BloodOn.Main = function() {
     /**
      * list of markers
      * @type {{}}
      * @private
      */
     this.organizations_ = {};
     /**
      * list of markers
      * @type {{}}
      * @private
      */
     this.organizationsToAlert_ = {};
     /**
      * list of markers
      * @type {HTMLObjectElement}
      * @private
      */
     this.placeInfoModal_ = $('#place_alerts_details')[0];
     /**
      * getter
      * @return {HTMLObjectElement}
      * @this BloodOn.Main
      */
     this.getPlaceInfoModal = function() {
         return this.placeInfoModal_;
     };
     /**
      * list of markers
      * @type {BloodOn.OrganizationManager}
      * @private
      */
     this.activeAlertPlace_ = null;
     /**
      * list of markers
      * @type {BloodOn.AlertManager}
      * @private
      */
     this.alertManager_ = null;
     /**
      *
      * @type {BloodOn.UserMarker}
      * @private
      */
     this.userMarker_ = null;
     /**
      *
      * @type {BloodOn.MapChoices}
      * @private
      */
     this.menuChoices_ = null;
     /**
      *
      * @type {Array}
      * @private
      */
     this.alertsMarkers_ = [];
     /**
      *
      * @type {L.LayerGroup}
      * @private
      */
     this.organizationsAlertsLayer_ = null;
     /**
      *  @type {L.CalendarManager}
      *  @private
      */
     this.calendar_ = null ;
};
/**
 *
 * @type {{init: Function, refreshMap: Function, successRefreshMap: Function, getMoreAlertsPlace: Function}}
 */
BloodOn.Main.prototype = {
    init: function() {
        var context = this;
        // build the main application map
        BloodOn.GeoTools.buildMap('map-canvas', [34, 9], 10);
        
        // init the user marker place
        this.userMarker_ = new BloodOn.UserMarker(context);
        this.userMarker_.init();
        
        // filter choices
        this.menuChoices_ = new BloodOn.MapChoices();
        this.menuChoices_.init(this);
        
        // construct the alert manager
        this.alertManager_ = new BloodOn.AlertManager();
        this.alertManager_.init(this);
        
        
        
        // manage calendar of blood schedule
        this.calendar_ = new BloodOn.CalendarManager(this);
        this.calendar_.init();

        // sign in modal manager
        $('a#btn_enter').click(function() {
            $('div#sing_in_modal:eq(0)').modal('toggle');
            }
        );
        
        // bind moveend Map event
        BloodOn.GeoTools.bindMapEvent('moveend', this.refreshMap, this);
        
        // bind the loader for more alerts 
        $('a#load_more_place', this.placeInfoModal_).click(function() {
            context.getMoreAlertsPlace(context.activeAlertPlace_);
        });
        
        // groupe the alerts markers 
        this.organizationsAlertsLayer_ =  BloodOn.GeoTools.LayerGroup([]);
        
        // refresh now the map
        this.refreshMap();

    },
    /**
     *
     */
    refreshMap: function() {
        BO.GeoTools.getBound('/home/map/refresh',
            this.successRefreshMap, this);
    },
    /**
     *
     * @param data
     */
    refreshMapWithCircle: function(data) {
        BO.GeoTools.getCircleBound('/home/map/refresh/around',
            this.successRefreshMap, this, data);
    },
    /**
     * callback function of server map refresh
     * @param {JSON} response
     */
    successRefreshMap: function(response) {
        if (response.html) {
            var data_ = response.html,
                data,
                id,
                organization,
                count ;
            for ( var id in data_) {
                data = data_[id];
                count = data['count'];
                // check if the place of alerts already binded
                
                if (!this.organizationsToAlert_[id]){
                    this.organizationsToAlert_[id] = this.alertManager_.registerOrganizationMarker (id, data);
                }
                    
                if (!count)
                    continue;
                // check if the marker already loaded
                if (!this.organizations_[id]) {
                    organization = new
                        BloodOn.OrganizationManager(this, id, data);
                    this.organizations_[id] = organization ;
                    this.organizationsAlertsLayer_.addLayer(organization.getMarker ());
                }
				// update
				else {
				   this.organizations_[id].updateCount (data);			
				}
            }
        }
        // update the calendar manager
        if (response.calendar)
            this.calendar_.bind (response.calendar);
    },
    /**
     * hide show organisations
     * @param {Boolean} show
     */
    toggleAlertsMarkers: function (show) {
        // use geo helper to hide layers
        BloodOn.GeoTools.toggleLayerGroup(this.organizationsAlertsLayer_, show);
    },
    /**
     *
     * @param {BloodOn.OrganizationManager} activePlace
     */
    getMoreAlertsPlace: function(activePlace) {
        activePlace.getMarkerDetails(false);
    },
    /**
     * setter of thr organization manager
     * @param {BloodOn.OrganizationManager} currentOrganization
     */
    setActiveOrganization: function(currentOrganization) {
        this.activeAlertPlace_ = currentOrganization;
        }
    };
// init the function
$(document).ready(
    function() {
        BO._main = new BloodOn.Main().init();
    }
);