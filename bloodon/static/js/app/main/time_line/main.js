,
    /**
     *
     */
    updateScrollParams : function() {
       var $timeLine = $('#time_line:eq(0)'),
        $scroll = this.$timeLineCurosr_,
        $container = this.$timeLineContainer_,
        parentFix = 550,
        step = 100,
        totalOutHeigth = $container.innerHeight();
        this.TOTALSCROLLHEIGHT_ = totalOutHeigth ;
        // percent out container
        // 
        $scroll.css({'height' : ((parentFix / totalOutHeigth) * 100)+ '%'});
        this.updateScroll($scroll[0]);
    },
    /**
     *
     */
    manageScroll: function() {
        var $timeLine = $('#time_line:eq(0)'),
            $scroll = this.$timeLineCurosr_,
            $container = this.$timeLineContainer_,
            context = this;
        $timeLine.mouseenter(function() {
               $scroll.show();
            })
            .mouseleave(function() {
                $scroll.hide();
            });

        $container.bind('mousewheel DOMMouseScroll', function(event) {
            // top
                var params = context.SCROLLING_,
                    percentStep = params.percentStep,
                    realStep = params.realStep,
                    floating = parseFloat($container[0].style.top) || 0,
                    percentFloating = parseFloat($scroll[0].style.top) || 0,
                    toFloat = Math.floor(percentFloating / params.percentStep),
                    oEvent = event.originalEvent,
                    top = oEvent.wheelDelta / 120 > 0;
                if ($.browser.mozilla)
                    top = oEvent.detail > 0;
                floating = (-(toFloat * realStep)) +
                    ((top) ? realStep : -realStep);
                percentFloating = (toFloat * percentStep) +
                    ((top) ? -percentStep : +percentStep);
                if (((Math.abs(floating) + 10) > out) ||
                    ((percentFloating + 10) < 0)) // tolerance fixed with 10px
                    return;
                if (((out - Math.abs(floating)) + 10) <
                    realStep) // tolerance fixed with 10px
                    return;
                context.updateScrollBy(floating, percentFloating);
            });
        $scroll.draggable({
            axis: 'y',
            containment: 'parent',
            drag: function(event, ui) {
                context.updateScroll(ui.helper.context);
            },
            stop : function(event, ui) {
                context.updateScroll(ui.helper.context);
            }
        });
    },
    /**
     *
     * @param {number} container
     * @param {number} percentBar
     */
    updateScroll: function(object) {
        var $container = this.$timeLineContainer_,
            $scroll = this.$timeLineCurosr_ ,
            top = $(object).offset().top - $(object).parent().offset().top;
            percentFloat = parseFloat(top/550) * 100;
            percent = (percentFloat >  0) ? percentFloat : 0,
            percentHeight = parseFloat(object.style.height);
            $scroll.css ({ 'top' :  percent  + '%' });
            
            $container.css ({ 'top' : - ((percent * this.TOTALSCROLLHEIGHT_)/100) + 'px' });
    }
    /**
      *
      * @type {HTMLObjectElement}
      * @private
      */
     this.$timeLineContainer_ = null;
     /**
      * getter
      * @return {HTMLObjectElement}
      * @this BloodOn.Main
      */
     this.getTimeLineContainer = function() {
         return this.$timeLineContainer_;
     };
     /**
      *
      * @type {BloodOn.MapChoices}
      * @private
      */
     this.$timeLineCurosr_ = null;
     // region alerts
        {

         var $timeLine = $('#time_line:eq(0)'),
            timeLine = $timeLine[0],
            $scroll = $('#app_alerts_scroll', timeLine),
            $container = $('#app_alerts_container', timeLine);

        this.$timeLineCurosr_ = $scroll;
        this.$timeLineContainer_ = $container;
        }
        
        this.updateScrollParams ();
        this.manageScroll();
        
//

    /**
     *
     */
    registerAlerts: function() {
        // alerts map main
        var context = this,
            $mainTimeLine = context.getTimeLineContainer();
        $mainTimeLine.find('.share-item', $mainTimeLine[0]).click(
            function() {
                $(this).closest('.item-actions')
                    .find('.share-inside').slideToggle();
                $(this).button('toggle');
            }
        );
        $mainTimeLine.find('.send-to-item').click(
            function() {
                var $parent = $(this).closest('.app-alert-item'),
                    title = $parent.find('.app-alert-item-body')
                        .html().replace('<br>', ' : ');
                BloodOn.OrganizationManager.
                    sendMeAsMessage($parent.attr('id'), title, null);

            }
        );
    }
    
        this.registerAlerts();
