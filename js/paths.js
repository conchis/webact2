// Utility functions for splitting, joining, and normalizing paths

webact.in_package("paths", function (paths) {  
    
    // Splits a path into tokens while normalizing the resulting path.

    paths.split = function (path) {
        var tokens = path.split("/");
        var result = [];

        // Add any initial slashes
        for (var index = 0;
                index < tokens.length && tokens[index] == ""; index += 1)
            result.push(tokens[index]);

        // Remove any additional slashes
        for (; index < tokens.length; index += 1)
        {
            var token = tokens[index];
            if (token != "")
                result.push(token);
        }

        return result;
    };

    // Joins one or more paths in to a single normalized path.

    paths.join = function () { // arguments
        var segments = [];
        for (var index = 0; index < arguments.length; index += 1) {
            var argument = arguments[index];
            if (argument == '/') argument = '';
            var tokens = paths.split(argument);
            for (var token_index = 0; token_index < tokens.length; token_index += 1)
                segments.push(tokens[token_index]);
        }
        return paths.normalize(segments.join("/"));
    };

    // Normalize Path

    paths.normalize = function (path) {
        return paths.split(path).join("/");
    };
    
});