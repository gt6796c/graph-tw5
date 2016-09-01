/*\
title: $:/plugins/gt6796c/graph-tw5/widget.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
     var uniqueID = 1;

    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    if ($tw.browser && !window.graph) {
        window.graph = require("./graph.js");
    }

    function getScriptBody(src,tag)
    {
        var scriptBody= src.getAttribute("text", src.parseTreeNode.text || "");

        if (src.parseTreeNode.text) {
            scriptBody = src.parseTreeNode.text;
        }
        else if (src.parseTreeNode.children)
        {
            var kids = src.parseTreeNode.children;
            for (var k in kids)
            {
                var kk = kids[k];
                switch(kk.type)
                {
                    // no wikiparsing found
                    case "text":
                        scriptBody += kk.text; break;
                    // internal link, make it a permalink reference
                    case "link":
                        scriptBody += "#" + kk.children[0].text; break;
                    // -- gets interpreted as an HTML element, we don't want that
                    case "entity":
                        switch(kk.entity)
                        {
                            case "&ndash;":
                                scriptBody+="--"; break;
                        };
                        break;
                    // just re-write it back out
                    case "element":
                        switch (kk.tag)
                        {
                            case "a":
                                scriptBody+=kk.children[0].text;
                        }
                };
            }
        }
        else {
            scriptBody = "";
        }

        return scriptBody;

    };

    function getCanvas(src,tag)
    {
        var height = src.getAttribute("height");
        var width = src.getAttribute("width");

        var divNode = src.document.createElement("canvas");
        var style = "";
        if (height) style +=" height:"+height;
        if (width) style +=" width:"+width;
        if (style) divNode.setAttribute("style", style);
        divNode.setAttribute("id", tag+"_" + uniqueID);

        uniqueID++;
        return divNode;
    };

    function getOptions(src, tag, options)
    {
        try {
            // try to set options from fields on tiddler first
            // [tag-xxx]
            var tt = src.getVariable('currentTiddler');
            if (tt) {
                var t = src.wiki.getTiddler(tt);
                if (t)
                {
                    for (var f in t.fields) {
                        var fi = f.indexOf(tag);
                        if (fi != 0) continue;
                        var k = f.substring(tag.length+1);
                        var v = t.fields[f];
                        // try as JSON
                        try {
                            options[k] = JSON.parse(v);
                        }
                            // last attempt is just a string
                        catch (ex) {
                            options[k] = v;
                        }
                    }
                }
            }
            // treat any attributes as JSON representations of options
            // for the object
            for (var att in src.attributes) {
                // we already used these in the div definition
                if (att == "height" || att == "width") continue;

                var attval = src.getAttribute(att);
                // allow for data from named tiddlers
                if ($tw.wiki.tiddlerExists(attval))
                {
                    var data = $tw.wiki.getTiddlerData(attval);
                    options[att] = data;
                }
                else {
                    // try as JSON
                    try { options[att] = JSON.parse(attval); }
                    // last attempt is just a string
                    catch (ex) { options[att] = attval; }
                }
            }
        }
        catch (ex) { console.error(ex); }

        return options;

    };

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
        var scriptBody = getScriptBody(this,tag).trim();
        var divNode = getCanvas(this,tag);
        try {
            var options = {}
            options.minX = -10;
            options.minY = -10;
            options.maxX = 10;
            options.maxY = 10;
            options.color = 'red';
            options.thickness = 2;
            options.unitsPerTick = 1;

            getOptions(this, tag, options);
            options.canvas = divNode;
            window.graph.graph.configure(options);
            var eqs = scriptBody.split('\n');
            for (var i=0;i<eqs.length;++i) {
                var eq = eqs[i].trim();
                var f = Function('x', "return " + eq + ";");
                var c = typeof(options.colors) != "undefined" && i < options.colors.length ? options.colors[i] : options.color;
                var t = typeof(options.thicknesses) != "undefined" && i < options.thicknesses.length ? options.thicknesses[i] : options.thickness;
                window.graph.graph.drawEquation(f, c, t);
            }
        }
        catch(ex)
        {
            divNode = this.document.createElement("div");
            divNode.innerText = ex.stack;
        }
        parent.insertBefore(divNode, nextSibling);

        this.domNodes.push(divNode);
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
