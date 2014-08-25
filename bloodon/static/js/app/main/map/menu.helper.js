
/**
 * Init the use map marker
 */
BloodOn.UserMarker = function(parent) {
    /**
     * mai parent application
     * @type {BloodOn.Main}
     * @private
     */
    this.parent_ = parent;
    /**
     * url server connexion
     * @type {string}
     * @private
     */
    this.serverPath_ = '/home/map/user/?';
    /**
     * circle search radius
     * @type {string}
     * @private
     * @default 100
     */
    this.radius_ = 5000; // 5km
    /**
     * circle search radius
     * @type {Object}
     * @private
     */
    this.arround_ = null; // 5km
    /**

     * @type {HTMLObjectElement}
     * @private
     */
    this.container_ = null;
    /**
     * @type {jQuery}
     * @private
     */
    this.$zoomer_ = null;
    /**
     * @type {jQuery}
     * @private
     */
    this.$zoomerText_ = null;
    /**
     * @type {Object}
     * @private
     */
    this.marker_ = null;
    /**
     * @type {jQuery}
     * @return [Object}
     */
    this.getLatLng = function() {
        return this.marker_.getLatLng();
    };
    /**
     * @type {jQuery}
     * @return [Object}
     */
    this.detectProperties = function(resize) {
	var mobile = false,
	    context = this ;
	if ((window.screen.availWidth <= 480) || (document.body.clientWidth <= 480)){
		mobile = true ;	
	}
    	context.zOrientation_ = mobile ? 'top' : 'left';
    	context.zMarginProperty_ = 'margin' + ( mobile ? 'Top' : 'Left');
    	context.zClientProperty_ = 'client' + ( mobile ? 'Y' : 'X');
    	context.zStyleProperty_ = mobile ? 'height' : 'width';
    	BloodOn.UserMarker.TogglingDirection = mobile ? 'bottom' : 'right';
	context.zDisplay_ = mobile ? 'v' : 'h';
	
	var container = context.container_,
	    leftCssClass = 'icon-%s-sign'.replace('%s', mobile ? 'plus' : 'minus');
	    rightCssClass = 'icon-%s-sign'.replace('%s', mobile ? 'minus' : 'plus');
	$('#zoom_min_value:eq(0)', container ).html(mobile ? '100' : '5');	
	$('#zoom_max_value:eq(0)', container).html(mobile ? '5' : '100');	
	$('span#zoom_minus', container).find ('i').removeClass(rightCssClass).addClass(leftCssClass);	
	$('span#zoom_plus', container).find ('i').removeClass(leftCssClass).addClass(rightCssClass);
        
	if (resize){	
    		context.$zoomerText_.css ({'marginTop' : '', 'marginLeft' : ''});
	    	context.$zoomer_.css ({'width' : '4px', 'height' : '4px'});   		
		context.updateSliderView ((this.radius_ / 1000) * 4, true );
	    if (context.$zoomer_ && !mobile)
		context.$zoomer_.css ({'marginTop' : ''});
	}
	// change the zoomer
    };
    /**
     * 
     * @private
     */
    this.zOrientation_ = 'left';
    /**
     * 
     * @private
     */
    this.zStyleProperty_ = 'width';
    /**
     * 
     * @private
     */
    this.zMarginProperty_ = 'marginLeft';
    /**
     * 
     * @private
     */
    this.zClientProperty_ = 'clientX';
    /**
     * 
     * @private
     */
    this.zDisplay_ = 'h'; // or v : vertical
    
};
/**
 *
 * @type {{init: Function, saveUserPlace: Function, buildZoomer: Function, updateSliderView: Function, updateRadius: Function}}
 */
BloodOn.UserMarker.prototype = {
    /**
     * init function of user marker
     */
    init: function() {
        this.container_ = $('li#user_marker_container:eq(0)')[0];
        // marker components
        {
        var map = BloodOn.GeoTools._map,
            $place = $('#map_user_session:eq(0)'),
            latitude = 33.89415,
            longitude = 9.03738,
            lastBound = null,
            context = this,
            useLocator = true,
            radius = this.radius_;
        // the user coordinates are saved on map
        if ($place[0]) {
            var coordinates = $($place).attr('infos').split('#');
            latitude = parseFloat(coordinates[0]);
            longitude = parseFloat(coordinates[1]);
            useLocator = false;
            radius = parseFloat(coordinates[2]);
        }
        var circleOptions = {
                color: 'gray',
                opacity: 0.5,
                weight: 3,
                fillColor: 'white',
                fillOpacity: 0.3
            },
            /**
             * @type {Object}
             */
            circle = L.circle([latitude, longitude], radius, circleOptions);
        // assign current circle
        this.arround_ = circle;
        var latLng = new L.LatLng(latitude, longitude),
            userMarker = L.marker(
                latLng,
                {
                    'marker-color': '#EDF107',
                    draggable: true
                }
            );
        /**
         * function handles the drag event on the user marker
         * @param {Object} e
         */
        function userMarkerDragEnd(e) {
            var current = e.target.getLatLng();
            circle.setLatLng([current.lat, current.lng]);
            context.refreshMap();
        }
        userMarker.on('drag',
                function(e, event) {
                    var current = e.target.getLatLng();
                    circle.setLatLng([current.lat, current.lng]);
                    if (!map.getBounds().contains(current)) {
                        // FIXME
                        var pcurrent = map.latLngToLayerPoint(current);
                        map.panBy([pcurrent.x - lastBound.x,
                            pcurrent.y - lastBound.y], {animate: false});
                    }
                    lastBound = map.latLngToLayerPoint(current);
                }
            ).on('dragend',
                function(e) {
                userMarkerDragEnd(e);
            });
        }
        // marker menu
        {
        function hidePlaceMeMarker() {
            var method = 'removeLayer',
                map = BloodOn.GeoTools.getMap(),
                marker = BloodOn.GeoTools.getUserMarker(),
                circle = BloodOn.GeoTools.getUserCircleMarer();
            $(this).button('toggle');
            map[method](marker);
            map[method](circle);
            var jparent = $(this).parent().find('#inner');
            if (BloodOn.UserMarker.TogglingDirection === "right")
                jparent.toggle('slide', { direction : "right"}, 500);
            else
                jparent.slideToggle( "slow" );
            BloodOn.GeoTools.onEventMap('moveend', true);
        }
        /**
         * display the marker of user positioning.
         * @this {HTMLObjectElement}
         */
        function showPlaceMeMarker() {
            BloodOn.GeoTools.offEventMap('moveend');
            var method = 'addLayer',
                map = BloodOn.GeoTools.getMap(),
                marker = BloodOn.GeoTools.getUserMarker(),
                circle = BloodOn.GeoTools.getUserCircleMarer();
            $(this).button('toggle');
            map[method](marker);
            map[method](circle);
            if (useLocator) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        /**
                         * Activate the browser geo localisation
                         * @param {Geolocation} geoloaction
                         */
                        function(geoloaction) {
                            var latitude = geoloaction.coords.latitude,
                                longitude = geoloaction.coords.longitude,
                                latLng = new BloodOn.GeoTools.LatLng(latitude,
                                    longitude);
                            BloodOn.GeoTools.setLatLng(marker, latLng);
                            BloodOn.GeoTools.panTo(map, latLng);
                            BloodOn.GeoTools.setLatLng(circle,
                                [latitude, longitude]);
                        }
                    );
                }
                else {
                    this.innerHTML = 'Geolocation is not supported by' +
                        'this browser, try using the cursor';
                }
                // refresh map using current
            }
            map.panTo(marker.getLatLng());
            var jparent = $(this).parent().find('#inner');
            if (BloodOn.UserMarker.TogglingDirection === "right")
                jparent.toggle('slide', { direction : "right"}, 500);
            else
                jparent.slideToggle( "slow" );
            // refresh map
            // FIXME the user use the cursor , no need to refresh map
            //context.refreshMap();
            context.refreshMap();
        }
        /**
         * @deprecated this function will be remove in jquery 1.9
         * instead , get the current state of the button , and toggle
         * between its
         */
        $('a#select_my_place', this.container_).toggle(
            showPlaceMeMarker,
            hidePlaceMeMarker
        );
        }
        this.detectProperties (false);
        this.buildZoomer ();
        this.marker_ = userMarker ;
        BloodOn.GeoTools._userMarker = userMarker;
        BloodOn.GeoTools._userCircleMarker = circle;
        this.updateSliderView((radius / 1000) * 4, true) ;
        $(window).resize(function() {
            context.detectProperties (true);
        });
    },
    /**
     *
     * @param {number} radius
     */
    buildZoomer : function() {
        var context = this, // right left
            container = this.container_,
            $zoomer = $('#zoom_circle_container', container),
            zoomer = $zoomer [0],
            $slider = $('#slider', zoomer),
            $sliderText = $('#slider_text', zoomer);
        // function zoom in/out
        var zoomIn = function (plus){
	    var way = context.zDisplay_ == 'h' ? plus : !plus ;
		value =  way ? 10 : -10,
                width = $slider[context.zStyleProperty_] (),
                result = Math.min(width + value,200);
            context.updateSliderView (result);
        };
        // zoom out
        $('span#zoom_minus', $zoomer).click(
               function (){ zoomIn (false);}
        );
        // zoom in
        $('span#zoom_plus', zoomer).click(
               function (){ zoomIn (true);}
            );
        // clicked area zoom
        var zoomBy = function(event){
            var offset = $(this).parent().offset(),
	        clientProperty = context.zClientProperty_,
                clientX = event[clientProperty],
		orientation = context.zOrientation_;
            var width = (clientX - offset[orientation]),
                result = Math.round (width / 10) * 10;
		if (context.zDisplay_ !== 'h')
	           result = 200 - result; 
            context.updateSliderView (result);
        };
        //  clicked area zoom on slider bg
        $('div#slider_bg', zoomer).click(zoomBy);
        // clicked area zoom on slider
        $slider.click(zoomBy);
        // save the zoomer
        context.$zoomer_ = $slider ;
        // $sliderText
        context.$zoomerText_ = $sliderText ;
    },
    /**
     *
     * @param result
     * @this {BloodOn.UserMarker}
     */
    updateSliderView: function(result, doNotUpdate) {
        var width = Math.min(result, 200),
            property = this.zStyleProperty_,
            marginProperty = this.zMarginProperty_ ;        // percent calculation
        // 200 px = 20 km
	width = Math.max (10, width);
	this.$zoomer_.css (property, width);
        var scale = (width / 2),
            textMargin = width ;
	if (this.zDisplay_ !== 'h'){
	    textMargin = 200 - width ;
	    this.$zoomer_.css ('marginTop', textMargin);
	}
	this.$zoomerText_.css (marginProperty, textMargin).html (scale);
        // update raduis
        this.setRadius (scale * 1000);
        if (!doNotUpdate)
            this.refreshMap();
    },
    /**
     *
     * @param {number} value
     * @this {BloodOn.UserMarker}
     */
    setRadius: function(value) {
       this.radius_ = value /2;
       this.arround_.setRadius(value / 2);
    },
    /**
     * triggerd when the user draw the circle , change the raduis
     */
    refreshMap:function(){
        var data = this.getLatLng();
        this.parent_.refreshMapWithCircle(
            {'radius': this.radius_,
              'lng' : data.lng,
               'lat' : data.lat}
        );
    }
};
/**
 * @static 
 */
BloodOn.UserMarker.TogglingDirection = 'right';
/**
 * Init the map choices marker
 */
BloodOn.MapChoices = function() {
    /**
     *
     * @type {null}
     * @private
     */
    this.parent_ = null;
    /**
     *
     * @type {Array}
     * @private
     */
    this.choicesStates_ = {};
};
/**
 *
 * @type {{init: Function, includeChoice: Function}}
 */
BloodOn.MapChoices.prototype = {
    /**
     * Init the function of the blood choice select
     * @param {BloodOn.Main} parent
     */
    init: function(parent) {
        this.parent_ = parent;
        this.container_ = $('li#map_blood_choices:eq(0)')[0];
        var container = this.container_,
            context = this;
        /**
         * @deprecated this function will be remove in jquery 1.9
         * instead , get the current state of the button , and toggle
         * between its
         */
        $('a#filter_choices_btn', container).click(
            function() {
                $(this).button('toggle');
                var jparent = $(this).parent().find('#inner');
                if (BloodOn.UserMarker.TogglingDirection === "right")
                    jparent.toggle('slide', { direction : "right"}, 500);
                else
                    jparent.slideToggle( "slow" );
            }
        );
        // choices includes on search
        //
        var $choices = $('.blood-choice', container),
            state = true ;
            $choices.click(function() {
                var object = this,
                    id = object.id;
                    context.choicesStates_[id] = !context.choicesStates_[id];
                context.update ();
            })
            .each(function() {
                state = parseInt($(this).attr('in'));
                this.__appIncludeMe  = state;
                context.includeChoice (this, state);
            });
        // choices includes on search
        $('#blood_choice_all', container)
            .click(function() {
                $choices.each(function() {
                    $(this).find('span').addClass('blood-choice-on');
                    this.__appIncludeMe = true;
                    for (key in context.choicesStates_ )
                        context.choicesStates_[key] = true ;
                    context.update ();
                    }
                );
            }).each(function() {
                state = parseInt($(this).attr('in'));
                this.__appIncludeMe  = state;
                context.switchCss (this, !state);
            });
    },
    /**
     * 
     */
    getOutChoices : function (){
        return this.choicesStates_;
    },
    /**
     * Add excluded choice
     * @param {HTMLObjectElement} object
     * @param {Boolean} exclude
     */
    includeChoice: function(object, include) {
        this.choicesStates_[object.id] = include;
        this.switchCss (object, include);
    },
    /**
     * Add excluded choice
     * @param {HTMLObjectElement} object
     * @param {Boolean} exclude
     */
    switchCss : function(object, include) {
        $(object).find('span')[(include ?
            'add' : 'remove') + 'Class']('blood-choice-on');
    },
    
    /**
     * Add excluded choice
     * @param {HTMLObjectElement} object
     * @param {Boolean} exclude
     */
    update: function() {
        var statesDic = this.choicesStates_,
            states = [];
        for (var key in statesDic){
            if (!statesDic[key])
                states.push (key);
        }            
        window.location = BloodOn._rootUrl + '?exclude=' + states.join(',');
        //location.reload();
    }
};
