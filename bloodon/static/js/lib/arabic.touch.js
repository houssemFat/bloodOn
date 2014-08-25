/* ===================================================
 * arabic-board.js v0
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
 * @param parent
 * @param content
 * @constructor
 */
Lib.ArabicKeyBoard.Touch = function (parent, content){
    var myCanvas = $('#touch_keys', parent._board)[0],
        context = this;
    this.strokesHistory_ = {
        Strokes : []
    };

    var currentStroke = {
        Points: []
    };

    myCanvas.onmousedown = myCanvas.ontouchstart = function  (e) {
        var parentOffset = myCanvas.getBoundingClientRect();
        context.offsetX_ = parentOffset.left ;
        context.offsetY_ = parentOffset.top ;
        var  xy = context.getInputCoordinates (e);
        currentStroke.Points.push ({X: xy.x, Y: xy.y});
        context.beginDraw (xy.x, xy.y);
            e.stopPropagation();
    };
    myCanvas.onmousemove = myCanvas.ontouchmove = function  (e) {
        if  (context.isDrawing === true ) {
            var xy =  context.getInputCoordinates  (e);
            currentStroke.Points.push ({X: xy.x, Y: xy.y});
            context.draw (xy.x, xy.y);
            e.stopPropagation();
        }
    };

    myCanvas.onmouseup = myCanvas.ontouchend = function  (e) {
        context.strokesHistory_.Strokes.push (currentStroke);
        currentStroke = {Points: []};
        context.endDraw ();
        e.stopPropagation();
        // send data to server
        context.sendData();
    };
    this.canvasSurface_ = myCanvas ;
    this.setup();
}
/**
 *
 * @type {{isDrawing: boolean, surface: null, offsetX_: number, offsetY_: number, sendData: Function, successSendData: {}, clearData: Function, setup: Function, beginDraw: Function, draw: Function, endDraw: Function, getInputCoordinates: Function}}
 */
Lib.ArabicKeyBoard.Touch.prototype = {
    isDrawing: false ,
    surface: null ,
    offsetX_ : 0,
    offsetY_: 0,
    getData: function  () {
        var data = [],
            i = 0,
            strokes = this.strokesHistory_.Strokes,
            array,
            points,
            point ;
        for ( var i = 0; i < strokes.length; i++){
            data[i] = [];
            points = strokes[i].Points ;
            for (var j = 0; j < points.length; j++){
                point = points[j] ;
                data[i].push ([point.X, point.Y]);
            }
        }
        return JSON.stringify(data);
    },
    sendData: function  () {
        $.get('/tools/lang/handwritten', { data : this.getData() }, $.proxy(this.successSendData, this));
    },
    successSendData :{

    },
    clearData: function  () {
        $.clean(this.surface);
        this.strokesHistory_ = {};
    },
    setup: function  () {
        var canvas = this.canvasSurface_ ;
        canvas.width = 370;//$(canvas).parent().innerWidth();
        canvas.height = 170;//$(canvas).parent().innerHeight();
        this.surface = canvas.getContext("2d");
        this.surface.lineWidth = 3;
        this.surface.fillStyle = 'orange';
        this.surface.strokeStyle = 'orange';
    },
    beginDraw: function (x, y) {
        this.surface.beginPath ();
        this.surface.moveTo (x, y);
        this.surface.fillRect(x, y, 3, 3);
        this.isDrawing = true ;
    },
    draw: function  (x, y) {
        this.surface.lineTo (x, y);
        this.surface.stroke ();
    },
    endDraw: function  () {
        this.isDrawing = false ;
    },
    getInputCoordinates : function(e, offX, offY) {
        var  x, y;
        if  (e.changedTouches) {
            var touchData = e.changedTouches[0];
            x = touchData.clientX;
            y = touchData.clientY;
            e.preventDefault ();
        }
        else  {
           //or $(this).offset(); if you really just want the current element's offset
           var x = e.pageX - this.offsetX_;
           var y = e.pageY - this.offsetY_;
        }
        return  {x: x, y: y};
    }
};