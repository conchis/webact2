// An outline is a tree of data objects maintained by the server.
// The client (this program) loads parts of this tree as needed.

webact.in_package("outlines", function (outlines) {

	eval(webact.imports("paths"));

	outlines.makeOutline = function (base_url, that) {
		var outline = {};
		
		// Loads the root node from the specified base_url, then calls the 
		// speified callback function on the bindings object.
		
		outline.getRootThen = function (callback, bindings) {
		};

		// Loads a node from a specified base_url relative path, then calls the 
		// speified callback function on the bindings object.
		
		outline.getNodeThen = function (path, callback, bindings) {
		};
		
		// POSTs a new node under a specified parent path in a specific index
		// position, then calls the callback function on the bindings object.
		
		outline.addNodeThen = function (parent_path, index, node, callback, bindings) {
		};
		
		// DELETEs a node at a specified base_url relative path, then calls the 
		// specified callback function on the bindings object.	
		
		outline.removeNodeThen = function (path, callback, bindings) {
		};
		
		return outline;
	};
	
	outlines.makeNode = function (options) {
		var node = {
			name:  options.name || null,
			path:  options.path || null,
			count: options.count || 0
		};
		
		// Loads this node's parent function, and passes it to the callback 
		// function invoked on the bindings object.
		
		node.getParentThen = function (callback, bindings) {
		};
		
		// Loads a child or descendent node, then passes it to the callback
		// function invoked on the bindings object.
		
		node.getThen = function (path_or_index, callback, bindings) {
		};
		
		// POSTs a new node at a specified path or index, then invokes the
		// callback function on the bindings object.
		
		node.addThen = function (path_or_index, callback, bindings) {
		};
		
		// Saves the values of this node, then invokes the callback function on
		// the bindings object.
		
		node.saveThen = function (callback, bindings) {
		};
		
		// Preloads specified child objects (so that they need not be returned
		// from the server.)

		node.preloadThen = function (start, end, callback, bindings) {
		};
				
		return node;
	};
	
});

