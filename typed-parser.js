/*\
title: $:/plugins/gt6796c/graph-tw5/typed-parser.js
type: application/javascript
module-type: parser

This parser wraps unadorned railroad syntax into a railroad widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

	var GraphParser = function(type,text,options) {
		var element = {
			type: "graph",
			tag: "$graph",
			text: text
		};
		this.tree = [element];
	};

	exports["text/vnd.tiddlywiki.graph"] = GraphParser;

})();

