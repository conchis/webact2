/*jslint newcap: false, onevar: false,  evil: true */
/*global webact: true, jQuery: false, 
  makeRectangle: false, makeRectangleWidthHeight: false, makeDimensions: false */

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
     File: pyramid.js
     
     Provides a class for modling a timed image's pyramid of tiles.
 */

webact.in_package("pyramid", function (pyramid) {

    eval(webact.imports("geometry"));

    var TILE_SIZE = 256;
    var RESOLUTION_MULTIPLIER = Math.sqrt(2);
    var LOG_MULTIPLIER = Math.log(RESOLUTION_MULTIPLIER);
    
    /*
        Class: Pyramid
        
        Mathematical model of a tile pyramid (for a tiled image)
        
        Layer 0 has a single tile containg the entire image. Each following layer
        contains a matrix of n x m tiles, enough to cover the entire image at a
        higher resolution. At the base of the pyramid, tiles are at the resolution
        of the original image. Each tile is 256 x 256 pixels.
            
        The base layer has scale 1.0. On each layer above the base, the scale is
        the scale of the prior layer times the sqare root of two. This means that it
        is necessary to advance two layers in order to double the dimensions of the
        area of the orignal image covered by each tile.
        
        Parameters:
            width  - width of tiled image
            height - height of tiled image
    */
    
    pyramid.makePyramid = function (width, height) {
    
        var self = {width: width, height: height};
        
        var computeLayers = function () {
            var l_width = (Math.log(width) - Math.log(TILE_SIZE)) / LOG_MULTIPLIER;
            var l_height = (Math.log(height) - Math.log(TILE_SIZE)) / LOG_MULTIPLIER;
            return Math.ceil(Math.max(l_width, l_height)) + 1;     
        };
        
        var layer_count = computeLayers();
        
        self.tile_size = TILE_SIZE;
        self.layer_count = layer_count;
        
        /*
            Function: dimensions
            Returns: 
                Dimensions of the tiled image.
        */
        
        self.dimensions = function () {
            return makeDimensions(self.width, self.height);
        };
        
        /*
            Function: layers
            Returns: 
                Number of layers in the tile pyramid.
        */
        
        self.layers = function () {
            return layer_count;
        };
        
        /*
            Function: layerForScale
            
            Computes the layer of the pyramid with tiles at a specified resolution
            (scale) or better.
            
            Parameters:
                scale - desired scale (1 = original image)
                
            Returns: 
                Pyramid layer number
        */
        
        self.layerForScale = function (scale) {
            var last_layer = layer_count - 1;
            var level =  Math.max(Math.log(scale) / -LOG_MULTIPLIER, 0);
            return Math.max(last_layer - Math.floor(level + 0.0000001), 0);
        };
        
        /*
            Function: scaleForLayer
            
            Computes the scale (1 = original image) of tiles in a specifed pyramid
            layer.
            
            Parameters:
                layer_number - number of layer in the pyramid (0 = top)
                
            Returns:
                scale of tiles in layer
        */
        
        self.scaleForLayer = function (layer_number) {
            var layer_index = layer_count - layer_number - 1;
            return 1.0 / Math.pow(RESOLUTION_MULTIPLIER, layer_index);
        };
        
        /*
            Function: tileExtent
            
            Computes the size of the area of the original image covered by tiles 
            in a specified layer.
            
            Parameters:
                layer_number - index of pyramid layer
                
            Returns:
                Size of each side in a square area in image coordinates
        */
        
        self.tileExtent = function (layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(TILE_SIZE * scale);
        };
        
        /*
            Function: tileGridSize
            
            Computes the number of columns and rows of tiles on a specified
            pyramid layer.
            
            Parameters:
                layer_number - index of pyramid layer
                
            Returns: 
                Dimensions object containing width and height in tiles           
        
        */
        
        self.tileGridSize = function (layer_number) {
            var extent = self.tileExtent(layer_number);
            return makeDimensions(
                Math.ceil(width  / extent), Math.ceil(height / extent));
        };
        
        /*
            Function: tileSourceRectangle
            
            Computes a rectangle in image coordinates that is depicted in a specified
            tile and layer.
            
            Parameters:
                column         - column index of tile on specified layer
                row            - row index of tile on specified layer
                layer_number   - index of pyramid layer
                
            Returns:
                Rectangle in image coordinates
                
        */
        
        self.tileSourceRectangle = function (column, row, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            var extent = Math.floor(TILE_SIZE * scale);
            return makeRectangleWidthHeight(
                extent * column, extent * row, extent, extent);
        };
        
        /*
            Function: clippedDimensions
            
            Computes the size of the area of a tile that is actually filled with 
            image data. A tile may lay on the lower or right boundry of the image 
            and may cover more that the original image.
            
            Parameters:
                column         - column index of tile on specified layer
                row            - row index of tile on specified layer
                layer_number   - index of pyramid layer
                
            Returns:
                Dimensions: width and height of filled area of tile in pixels
        */
        
        self.clippedDimensions = function (column, row, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            var tileRect = self.tileSourceRectangle(column, row, layer_number);
            var sceneRect = makeRectangleWidthHeight(0, 0, width, height);
            var clippedTile = tileRect.intersect(sceneRect);
            var clippedWidth = Math.ceil(clippedTile.width / scale);
            var clippedHeight = Math.ceil(clippedTile.height / scale);
            return makeDimensions(clippedWidth, clippedHeight);
        };
        
        /*
            Function: tileColumn
            
            Computes the column index of a tile that includes an x coordinate in
            image pixels on a specified tile layer.
            
            Parameters:
                x             - x coordinate in original image pixels
                layer_number  - index of pyramid layer
                
            Returns:
                Column index (integer)
        */
        
        self.tileColumn = function (x, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var extent = TILE_SIZE * Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(x / extent);
        };
        
        /*
            Function: tileRow
            
            Computes the row index of a tile that includes a y coordinate in
            image pixels on a specified image layer.
            
            Parameters:
                y             - y coordinate in original image pixels
                layer_number  - index of pyramid layer
                
            Returns:
                Row index (integer)
        */
        
        self.tileRow = function (y, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var extent = TILE_SIZE * Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(y / extent);
        };
        
        /*
            Function: forTiles
            
            Invokes a callback function (closure) on each tile column, row
            in a specified tile layer that intersects a specified rectangle 
            in image coordinates.
            
            Parameters:
                rectangle    - rectangle in image coordinates
                layer_number - layer index in pyramid
                callback     - function (column, row, layer_number, self)
        */
        
        self.forTiles = function (rectangle, layer_number, callback) {
            var grid_size = self.tileGridSize(layer_number);
        
            var left = self.tileColumn(rectangle.left, layer_number);
            left = Math.max(0, Math.min(left, grid_size.width - 1));
            
            var right = self.tileColumn(rectangle.right, layer_number);
            right = Math.max(0, Math.min(right, grid_size.width - 1));
            
            var top = self.tileRow(rectangle.top, layer_number);
            top = Math.max(0, Math.min(top, grid_size.height - 1));
            
            var bottom = self.tileRow(rectangle.bottom, layer_number);
            bottom = Math.max(0, Math.min(bottom, grid_size.height - 1));
            
            for (var row = top; row <= bottom; row += 1) {
                for (var column = left; column <= right; column += 1) {
                    callback(column, row, layer_number, self);
                }
            }
        };
        
        return self; 
    };
    
    /*
        Function: loadPyramid
        
        Asynchronously loads a Pyramid object from a specified tiled image
        URL. Invokes a callback funtion with the loaded pyramid.
        
        Parameters:
            image_url - URL of tiled image (including XML metadata)
            callback  - function (pyramid)
    */
    
    pyramid.loadPyramid = function (image_url, callback) {
        var parseXML = function (xml) {
            var xml_query = jQuery(xml);
            var root = xml_query.children().first();
            var dimensions = root.children().first();
            var width = parseInt(dimensions.attr("width"), 10);
            var height = parseInt(dimensions.attr("height"), 10);
            callback(pyramid.makePyramid(width, height));
        };
        
        jQuery.get(image_url + "/contents.xml", {}, parseXML, "xml");
    };
});