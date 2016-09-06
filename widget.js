/*\
title: $:/plugins/gt6796c/graph-tw5/widget.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    var Rocklib = require("$:/plugins/gt6796c/rocklib/widget-tools.js").rocklib;
    var Graph = require("./graph.js").graph;

    if ($tw.browser) {
        window.graph = new Graph();
        window.rocklib = new Rocklib();
    }


    var GraphWidget = function(parseTreeNode, options) {
        this.initialise(parseTreeNode, options);
    };

    GraphWidget.prototype = new Widget();

    /*
     Render this widget into the DOM
     */
    GraphWidget.prototype.render = function(parent,nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();

        var tag = 'graph';
        var scriptBody = rocklib.getScriptBody(this,"equation").trim();
        var canvas = rocklib.getCanvas(this,tag,"canvas");
        try {
            var options = {}
            options.minX = -10;
            options.minY = -10;
            options.maxX = 10;
            options.maxY = 10;
            options.color = '#000';
            options.thickness = 2;
            options.unitsPerTick = 1;

            rocklib.getOptions(this, tag, options);
            rocklib.hue = 0;
            options.canvas = canvas;
            graph.configure(options);
            var eqs = scriptBody.split('\n');
            for (var i=0;i<eqs.length;++i) {
                var eq = eqs[i].trim();
                var f = Function('x', "return " + eq + ";");
                var c = options.color;
                var needColor = options.color instanceof Array && i >= options.color.length;
                needColor |= typeof(options.color) == "string" && i > 0;
                if (needColor)
                {
                    c = rocklib.nextColor(.75, 0.95);
                }
                else
                {
                    c = typeof(options.color) == "string" ? options.color : options.color[i];
                }
                var t = typeof(options.thicknesses) != "undefined" && i < options.thicknesses.length ? options.thicknesses[i] : options.thickness;
                graph.drawEquation(f, c, t);
            }
        }
        catch(ex)
        {
            canvas = this.document.createElement("div");
            canvas.innerText = ex.stack;
        }
        parent.insertBefore(canvas, nextSibling);

        this.domNodes.push(canvas);
    };

    GraphWidget.prototype.execute = function() {
        // Nothing to do
    };

    /*
     Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    GraphWidget.prototype.refresh = function(changedTiddlers) {
        return false;
    };

    exports.graph = GraphWidget;

})();
