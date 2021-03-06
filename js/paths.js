/*jslint newcap: false, onevar: false */
/*global webact: true, jQuery: false */

/*
 * Copyright 2011 Jonathan A. Smith.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* 
    File: paths.js
    
    Utility functions for splitting, joining, and normalizing paths.
*/

webact.in_package("paths", function (paths) { 

    /*
        Class: InvalidPathError
        
	    Error class used to signal that a path would be invalid.
	    
	    Parameters:
	        path - invalid path string
	*/

	var makeInvalidPathError = function (path) {
		var error = new Error("Invalid Path: " + path);
		error.name = "InvalidPath";
		return error;
	};
    
    /*
        Function: split
        
        Splits a path into tokens while normalizing the resulting path.
        
        Parameters:
            path - Path to be split in to tokens
            
        Returns:
            Tokens in path
    */

    paths.split = function (path) {
        var tokens = path.split("/");
        var result = [];

        // Add any initial slashes
        for (var index = 0;
                index < tokens.length && tokens[index] === ""; index += 1) {
            result.push(tokens[index]);
        }

        // Remove any additional slashes
        for (; index < tokens.length; index += 1) {
            var token = tokens[index];
            if (token !== "") {
                result.push(token);
            }
        }

        return result;
    };

    // Joins one or more paths in to a single normalized path.

    paths.join = function () { // arguments
        var segments = [];
        for (var index = 0; index < arguments.length; index += 1) {
            var argument = arguments[index];
            if (argument === '/') {
                argument = '';
            }
            var tokens = paths.split(argument);
            for (var token_index = 0; token_index < tokens.length; token_index += 1) {
                segments.push(tokens[token_index]);
            }
        }
        return paths.normalize(segments.join("/"));
    };

    // Normalize Path

    paths.normalize = function (path) {
        return paths.split(path).join("/");
    };

	// Returns the path with the last element removed.
	
	paths.parent = function (path) {
		var segments = paths.split(path);
		if ((segments.length === 1 && segments[0] === "") || 
			(segments.length === 2 && segments[0] === "" && segments[1] === "")) {
			throw makeInvalidPathError("parent(\"" + path + "\")");	
		}	
		segments = segments.slice(0, segments.length - 1);
		if (segments.length === 1 && segments[0] === "") {
			return "/";
		}
		else {
			return segments.join("/");	
		}
	};
    
});