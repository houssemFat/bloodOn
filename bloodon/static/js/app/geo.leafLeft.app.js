/* ===================================================
 * geo-tools.js v0
 * this class works for leafleft.js and mapBox.js library
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
/**
 * Geo tools BloodOn application
 * @constructor
 */
BloodOn.GeoTools = BloodOn.GeoTools || {};
BloodOn.GeoTools = {
    /**
     * main map.
     */
    _map: null,
    /**
     * user marker.
     */
    _userMarker: null,
    /**
     * user circle around
     */
    _userCircleMarker: null,
    /**
     *
     * @return {*}
     */
    getMap: function() {
        return BloodOn.GeoTools._map;
    },
    /**
     *
     * @return {*}
     */
    getUserMarker: function() {
        return BloodOn.GeoTools._userMarker;
    },
    /**
     *
     * @return {*}
     */
    getUserCircleMarer: function() {
        return BloodOn.GeoTools._userCircleMarker;
    },
    /**
     * build a new marker
     * @param {Object} latlng
     * @param {Object} options
     * @return {*} the marker
     * @constructor
     */
    Marker: function(latlng, options) {
        return L.marker(latlng, options);
    },
    /**
     *  Build a new latitude longitude map object
     * @param {number} latitude
     * @param {number} longitude
     * @return {*}
     * @constructor
     */
    LatLng: function(latitude, longitude) {
        return L.latLng(latitude, longitude);
    },
    /**
     * Build a new icon map object
     * @param {Object} options
     * @return {*}
     * @constructor
     */
    Icon: function(options) {
        return L.icon(options);
    },
    /**
     * Build a new icon map object
     * @param {Object} options
     * @return {*}
     * @constructor
     */
    divIcon: function(options) {
        return L.divIcon(options);
    },
    /**
     *
     * @param {Array} group
     * @return {*}
     * @constructor
     */
    LayerGroup: function(group) {
        return L.layerGroup(group).addTo(BloodOn.GeoTools.getMap());
    },
    /**
     *
     * @param {Object} source
     * @return {*}
     */
    getMarker: function(source) {
        return source.target;
    },
    /**
     * set a map icon on map marker object
     * @param {Object} marker
     * @param {Object} icon
     */
    setIconMarker: function(marker, icon) {
        marker.setIcon (icon);
    },
    /**
     * bin an event function on marker object
     * @param {Object} marker
     * @param {Object} events
     */
    bindMarkerEvents: function(marker, events) {
       for (var eventKey in events) {
           var key = eventKey;
           BloodOn.GeoTools.bindMarkerEvent(marker, key, events[key]);
       }
    },
    /**
     * bin an event function on marker object
     * @param {Object} marker
     * @param {Object} event
     * @param {function} fn
     */
    bindMarkerEvent: function(marker, event, fn) {
       marker.on(event, function(e) {
               fn.call(marker, e);
           }
       );
    },
    /**
     * set an object on a latLang map Object
     * @param {Object} object
     * @param {Object} latLng
     */
    setLatLng: function(object, latLng) {
      object.setLatLng(latLng);
    },
    /**
     * bin a popup object on a map marker object
     * @param {Object} marker
     * @param {Object} text
     * @param {Object} options
     * @param {Boolean} options
     */
    bindPopup: function(marker, text, options, open) {
        marker.bindPopup(text, options);
        if (open)
            BO.GeoTools.openPopupMarker (marker);
    },
    /**
     * Open a popUp object on a map marker
     * @param {Object} marker
     */
    openPopupMarker: function(marker) {
        marker.openPopup();
    },
    /**
     * Close the popup bind object on map marker
     * @param {Object} marker
     */
    closePopupMarker: function(marker) {
        marker.closePopup();
    },
    /**
     * return a geographic coordinate from string
     * @param {string} string
     * @return {number}
     */
    parseCoordinate: function(string) {
        return (typeof(string) === 'string') ?
            parseFloat(string.replace(',', '.')) : string;
    },
    toggleLayerGroup: function(layerGroup, show) {
        $(layerGroup).each(toggleLayerGroupCallBack);
        function toggleLayerGroupCallBack() {
            if (typeof (this) == 'object')
                BloodOn.GeoTools._map[(show ?
                    'add' : 'remove') + 'Layer'](this);
        }
    },
    /**
     * pan a map at the latitude longitude map object
     * @param {Object} map
     * @param {Object} latLng
     */
    panTo: function(map, latLng) {
        map.panTo(latLng);
    },
    /**
     * calculate the distance between two geographic points
     * @param {Array} A point A
     * @param {Array} B point B
     * @return {number}
     */
    getDistance: function(A, B) {
        var R = 6371, // earth radius length,
            dLat = (A[0] - B[0]).toRad(),//latitude
            dLon = (A[1] - B[1]).toRad(),// longitude
            lat1 = A[0].toRad(),
            lat2 = B[0].toRad(),
            a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) *
                    Math.cos(lat1) * Math.cos(lat2),
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },
    /**
     * send the bounded area of map to filter marker
     * @param {string} url
     * @param {function} callbackFn Function call back after success
     * @param {Object} callBackScope main object
        * context of success call back function
     * @param {Object|undefined} serverData server parameters
     */
    getBound: function(url, callbackFn, callBackScope, serverData) {
        var map = BO.GeoTools._map,
            bound = map.getBounds(),
            center = map.getCenter(),
            zoom = map.getZoom();
        $.ajax({
            type: 'get',
            url: url,
            data: $.extend(
                { e: bound.getEast(), w: bound.getWest(),
                    s: bound.getSouth(), n: bound.getNorth(),
                    center: center.lat + '#' + center.lng,
                    zoom: zoom
                },
                serverData
            ),
            success: function(data) {
                callbackFn.call(callBackScope, data);
             },
            error: function() {
                alert ('error');
            }
        }
        );
    },
    /**
     * send the bounded area of map to filter marker
     * @param {string} url
     * @param {function} callbackFn Function call back after success
     * @param {Object} callBackScope main object
        * context of success call back function
     * @param {Object|undefined} serverData server parameters
     */
    getCircleBound: function(url, callbackFn, callBackScope, data) {
        var map = BO.GeoTools._map,
            center = map.getCenter(),
            zoom = map.getZoom();
        $.ajax({
            type: 'get',
            url: url,
            data: $.extend(
                {radius: data.radius , lat: data.lat , lng: data.lng},
                {
                    center: center.lat + '#' + center.lng,
                    zoom: zoom
                }
            ),
            success: function(data) {callbackFn.call(callBackScope, data);},
            error: function() {}
        }
        );
    },
    /**
     * @param 
     */
    bindMapEvent: function(eventType, _function, context) {
        if (!BloodOn.GeoTools._map.__appEvents)
            BloodOn.GeoTools._map.__appEvents = {};
        var mapFnCallback = function() {
                _function.call(context);
        };
        BloodOn.GeoTools._map.__appEvents[eventType] = mapFnCallback;
        BloodOn.GeoTools._map.on(eventType/*'viewreset'*/,
            BloodOn.GeoTools._map.__appEvents[eventType]);
    },
    /**
     *
     * @param {string} eventType
     */
    offEventMap: function(eventType) {
        if (!BloodOn.GeoTools._map.__appEvents)
            return;
        if (!BloodOn.GeoTools._map.__appEvents[eventType])
            return;
        BloodOn.GeoTools._map.off(eventType/*'viewreset'*/,
            BloodOn.GeoTools._map.__appEvents[eventType]
            );
    },
    /**
     *
     * @param {string} eventType
     * @param {Boolean} execute
     */
    onEventMap: function(eventType, execute) {
        if (!BloodOn.GeoTools._map.__appEvents)
            return;
        if (!BloodOn.GeoTools._map.__appEvents[eventType])
            return;
        BloodOn.GeoTools._map.on(eventType/*'viewreset'*/,
            BloodOn.GeoTools._map.__appEvents[eventType]
            );
        if (execute)
            BloodOn.GeoTools._map.__appEvents[eventType] ();
    }
};
/**
 * Build the main app function
 * @param {string} id
 * @param {Array} viewOn
 * @param {number} zoom
 */
BloodOn.GeoTools.buildMap = function(id, viewOn, zoom) {
    var _viewOn = viewOn,
        _zoom = zoom;
    var $mapView = $('#map_view_session:eq(0)'),
         $mapZoom = $('#map_zoom_session:eq(0)');
    if ($mapView.length) {
       var center = $mapView[0].lang.split('#');
       _viewOn = [BloodOn.GeoTools.parseCoordinate(center[0]),
           BloodOn.GeoTools.parseCoordinate(center[1])];
        _zoom = BloodOn.GeoTools.parseCoordinate($mapZoom[0].lang);
    }

   var map = L.mapbox.map(id, 'houssemfat.map-jrzf0li9')
       .setView(_viewOn, _zoom);
    L.control.scale().addTo(map);
    BloodOn.GeoTools._map = map ;
};