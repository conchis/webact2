// This file must be loaded after jQuery and before any other webact packages.

webact = webact || {}
(function (webact, $) {

	// Opens a package for additions. Note that this may be done any number
	// of times to add new names. All exported names should be set in the 
	// exports argument to the body function.

	webact.package = function (name, body) {
		var exports = webact[name] || {};
		body(exports);
		webact[name] = exports;
	}
	
	// Returns an expression that should be evaled in a scope to add all or
	// some of the exported names to that scope. The called may optionally
	// provide a comma delimited string, or array of names to be imported.
	
	webact.imports = function (name, imported_names) {
		switch (typeof imported_names) {
			case "string":
				imported_names = imported_names.split(",");
			
			case "undefined":
			
			default:
		}	
	}
	
})(webact, jQuery);