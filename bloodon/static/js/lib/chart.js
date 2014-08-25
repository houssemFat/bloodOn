/* ===================================================
 * Lib-chart.js v0
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
 *
 * @type {{}}
 */
Lib.Chart = {};
/**
 *
 * @param {Object|Array} data
 * @param {Object} options
 * @constructor
 */
Lib.Chart.PieChart = function(data, options) {
    var _options = options || {},
        _total = 0,
        _titles = [],
        _angles = [],
        _percents = [],
        _percent ;
    /**
     *
     * @type {HTMLObjectElement}
     * @private
     */
    this.chart_ = this.createElement('svg:svg');
    /**
     * construct the options of the chart
     * @type {{width: (*|Function|.elementSize.width|jQuery.effects.fold.width|jQuery.effects.puff.width|b.options.origin.width|.from.width|.to.width|child.from.width|child.to.width|.style.width|width|string|width|.style.width|a.style.width|.style.width|.size.width|width|.containers.containerCache.width|_makeResizable.options.width), height: (*|Function|.elementSize.height|jQuery.effects.fold.height|jQuery.effects.puff.height|b.options.origin.height|.from.height|.to.height|child.from.height|child.to.height|number|number|number|.size.height|height|.containers.containerCache.height|_makeResizable.options.height), cx: *, cy: *, r: *}}
     * @private
     */
    this.options_ = {
        width: _options.width ? _options.width : '180px' ,
        height: _options.height ? _options.height : '120px' ,
        cx: _options.cx ? _options.cx : 100,
        cy: _options.cy ? _options.cy : 60
    };
    /**
     *
     * @type {number}
     * @private
     */
    this.radius_ = _options.r ? _options.r : 50;
    /**
     *
     * @type {number}
     * @private
     */
    this.title_ = _options.title ? _options.title : 'PIE CHART';
    /**
     *
     * @type {Array}
     * @private
     */
    this.angles_ = [];
    /**
     *
     * @type {Array}
     * @private
     */
    this.titles_ = [];
    /**
     *
     * @type {Array}
     * @private
     */
    this.percents_ = [];
    /**
     *
     * @type {Array}
     * @private
     */
    this.colors_ = ['blue', 'red', 'yellow',
        '#36AFDF', 'green', 'gray', 'black'];

    if ((_options.colors) && (typeof(_options.colors) == 'Array'))
        this.colors_ = _options.colors;
    // build titles
    if ($.isPlainObject(data)) {
        for (var i in data) {
            _total += parseInt(data[i]);
            _titles.push(i);
        }
    }
    else if ($.isArray(data)) {
        for (i = 0; i < data.length; i++) {
            _total += parseInt(data[i]);
            _titles.push(i);
        }
    }
    for (i = 0; i < _titles.length; i++) {
        _percent = parseFloat(data[_titles[i]]) / _total ;
         _angles[i] = _percent * Math.PI * 2;
        _percents [i] = _percent * 100;
    }
    if (_titles.length < 1)
        return;
    this.titles_ = _titles;
    this.percents_ = _percents ;
    this.angles_ = _angles;
    this.init();
};

Lib.Chart.PieChart.prototype = {
    chart: function() {
        return this.chart_;
    },
    /**
     *
     */
    init: function() {
        var chart = this.chart_,
            width = this.options_.width,
            height = this.options_.height;
        chart.setAttribute('width', width);
        chart.setAttribute('height', height);
        chart.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        // Loop through each slice of pie.
        var startangle = 0,
            end = 0,
            color,
            pie,
            percent;
        if (this.angles_.length > 2) {
            for (var i = 0; i < this.angles_.length; i++) {
                end = startangle + this.angles_[i];
                color = this.colors_[i];
                percent = this.percents_[i];
                var object = this.drawArc(startangle, end,
                    color,
                    /*Math.round(percent * 100) / 100*/
                    Math.round(percent) + ' %');
                pie = object[0];
                this.chart_.appendChild(pie);
                this.chart_.appendChild(object[1]);
                this.appendToLegend(pie, i);
                startangle = end;
            }
        }
        else {
            var circle = this.drawCircle(this.options_.cx, this.options_.cy,
                this.radius_, this.colors_[0]);
            this.chart_.appendChild(circle);
            this.appendToLegend(circle, 0);
        }
    },
    appendToLegend: function(piePiece, index) {

        var currentColor = this.colors_[index],
            pieColor = this.drawIconKey(0, 30 * index,
            16, 16, this.colors_[index]),
            pieTitle = this.drawLabel(25, (30 * index) + 18,
            this.titles_[index]);
        this.chart_.appendChild(pieColor);
        this.chart_.appendChild(pieTitle);
        // connect on hover
        $([pieTitle, pieColor])
            .hover(
            function() {
                piePiece.setAttribute('fill', 'orange');
                piePiece.setAttribute('stroke', 'white');
                piePiece.setAttribute('stroke-width', '2');
            })
            .mouseout(
            function() {
                piePiece.setAttribute('fill', currentColor);
                piePiece.setAttribute('stroke', '');   // Outline wedge in black
                piePiece.setAttribute('stroke-width', '');
            }
         );
    },
    /**
     *
     * @param {number} start angle
     * @param {number} end
     * @param {string} color
     * @return {HTMLElement}
     */
    drawArc: function(start, end, color, percent) {
    // Add up the data values so we know how big the pie is
    var cx = this.options_.cx,
        cy = this.options_.cy,
        r = this.radius_;

        // This is where the wedge ends
        // Compute the two points where our wedge intersects the circle
        // These formulas are chosen so that an angle of 0 is at 12 o'clock
        // and positive angles increase clockwise.
        var x1 = cx + r * Math.sin(start),
            y1 = cy - r * Math.cos(start),
            x2 = cx + r * Math.sin(end),
            y2 = cy - r * Math.cos(end),
            big = (end - start > Math.PI) ? 1 : 0,
            // This string holds the path details
            d = 'M ' + cx + ',' + cy +  // Start at circle center
            ' L ' + x1 + ',' + y1 +     // Draw line to (x1,y1)
            ' A ' + r + ',' + r +       // Draw an arc of radius r
            ' 0 ' + big + ' 1 ' +       // Arc details...
            x2 + ',' + y2 +             // Arc goes to to (x2,y2)
            ' Z',
            centroidx  = (x1 + cx + x2) / 3,
            centroidy = (y1 + cy + y2) / 3;


        // This is a flag for angles larger than than a half circle
        // It is required by the SVG arc drawing component

        // We describe a wedge with an <svg:path> element
        // Notice that we create this with createElementNS()
        var path = this.createElement('path');
        var center = this.drawLabel(centroidx, centroidy, percent, 'white');
        // Now set attributes on the <svg:path> element
        path.setAttribute('d', d);              // Set this path
        path.setAttribute('fill', color);   // Set wedge color
        //path.setAttribute('stroke', 'black');   // Outline wedge in black
        //path.setAttribute('stroke-width', '2'); // 2 units thick
        return [path, center];                // Add wedge to chart
    },
    drawCircle: function(cx, cy, radius, fill) {
        var circle = this.createElement('circle');
        circle.setAttribute('cx', cx);             // Position the square
        circle.setAttribute('cy', cy);            // Position the square
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', fill);
        return circle;
    },
    /**
     *
     * @param {number} leftx
     * @param {number} lefty
     * @param {number} width
     * @param {number} height
     * @param {string} color
     * @return {HTMLElement}
     */
    drawIconKey: function(leftx, lefty, width, height, color) {
        var icon = this.createElement('rect');
        icon.setAttribute('x', leftx);             // Position the square
        icon.setAttribute('y', lefty);
        icon.setAttribute('width', width);         // Size the square
        icon.setAttribute('height', height);
        icon.setAttribute('fill', color);   // Same fill color as wedge
        // icon.setAttribute('stroke', 'black');   // Same outline, too.
        //icon.setAttribute('stroke-width', '2');
        return icon;
    },
    /**
     *
     * @param {number} leftx
     * @param {number} lefty
     * @param {string} text
     * @param {string} color
     * @return {HTMLElement}
     */
    drawLabel: function(leftx, lefty, text, color) {
        // And add a label to the right of the rectangle
        var label = this.createElement('text');
        label.setAttribute('x', leftx);       // Position the text
        label.setAttribute('y', lefty);
        // Text style attributes could also be set via CSS
        label.setAttribute('font-family', 'sans-serif');
        label.setAttribute('font-size', '10');
        if (color) {
            label.setAttribute('fill', color);
            label.setAttribute('font-size', '9');
        }
        // Add a DOM text node to the <svg:text> element
        label.appendChild(document.createTextNode(text));
         $(label).addClass('hand');
        return label;
    },
    /**
     *
     * @param {string} type
     * @return {HTMLElement}
     */
    createElement: function(type) {
        return document.createElementNS(
            'http://www.w3.org/2000/svg', type);
    }
}