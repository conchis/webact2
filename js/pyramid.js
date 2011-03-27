/**
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

webact.in_package("pyramid", function (package) {

 	eval(webact.imports("geometry"));

    var TILE_SIZE = 256;
    var RESOLUTION_MULTIPLIER = Math.sqrt(2);
    var LOG_MULTIPLIER = Math.log(RESOLUTION_MULTIPLIER);
    
    // Model of tile pyramid
    
    package.makePyramid = function (width, height) {
    
        var pyramid = {width: width, height: height};
        
        var computeLayers = function () {
            var l_width = (Math.log(width) - Math.log(TILE_SIZE)) 
                    / LOG_MULTIPLIER;
            var l_height = (Math.log(height) - Math.log(TILE_SIZE)) 
                    / LOG_MULTIPLIER;
            return Math.ceil(Math.max(l_width, l_height)) + 1;     
        }
        
        var layer_count = computeLayers();
        
        pyramid.tile_size = TILE_SIZE;
        pyramid.layer_count = layer_count;
        
        pyramid.dimensions = function () {
            return makeDimensions(pyramid.width, pyramid.height);
        }
        
        pyramid.layers = function () {
            return layer_count;
        }
        
        pyramid.layerForScale = function (scale) {
            var last_layer = layer_count - 1;
            var level =  Math.max(Math.log(scale) / -LOG_MULTIPLIER, 0);
            return Math.max(last_layer - Math.floor(level + 0.0000001), 0);
        }
        
        pyramid.scaleForLayer = function (layer_number) {
            var layer_index = layer_count - layer_number - 1;
            return 1.0 / Math.pow(RESOLUTION_MULTIPLIER, layer_index);
        }
        
        pyramid.tileExtent = function (layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(TILE_SIZE * scale);
        }
        
        pyramid.tileGridSize = function (layer_number) {
            var extent = pyramid.tileExtent(layer_number);
            return makeDimensions(
                Math.ceil(width  / extent), Math.ceil(height / extent));
        }
        
        pyramid.tileSourceRectangle = function (column, row, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            var extent = Math.floor(TILE_SIZE * scale);
            return makeRectangleWidthHeight(
                extent * column, extent * row, extent, extent);
        }
        
        pyramid.clippedDimensions = function (column, row, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var scale = Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            var tileRect = pyramid.tileSourceRectangle(column, row, layer_number);
            var sceneRect = makeRectangleWidthHeight(0, 0, width, height);
            var clippedTile = tileRect.intersect(sceneRect);
            var clippedWidth = Math.ceil(clippedTile.width/scale);
            var clippedHeight = Math.ceil(clippedTile.height/scale);
            return makeDimensions(clippedWidth, clippedHeight);
        }
        
        pyramid.tileColumn = function (x, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var extent = TILE_SIZE 
            		* Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(x / extent);
        }
        
        pyramid.tileRow = function (y, layer_number) {
            var layer_index = layer_count - layer_number - 1;
            var extent = TILE_SIZE 
            		* Math.pow(RESOLUTION_MULTIPLIER, layer_index);
            return Math.floor(y / extent);
        }
        
        pyramid.forTiles = function (rectangle, layer_number, callback) {
            var grid_size = pyramid.tileGridSize(layer_number);
            		
            var left = pyramid.tileColumn(rectangle.left, layer_number);
            left = Math.max(0, Math.min(left, grid_size.width - 1));
            
            var right = pyramid.tileColumn(rectangle.right, layer_number);
            right = Math.max(0, Math.min(right, grid_size.width - 1));
            
            var top = pyramid.tileRow(rectangle.top, layer_number);
            top = Math.max(0, Math.min(top, grid_size.height - 1));
            
            var bottom = pyramid.tileRow(rectangle.bottom, layer_number);
            bottom = Math.max(0, Math.min(bottom, grid_size.height - 1));
            		
            for (var row = top; row <= bottom; row += 1)
            {
            	for (var column = left; column <= right; column += 1)
            		callback(column, row, layer_number, this);
            }
        }
        
        return pyramid; 
    }
    
    package.loadPyramid = function (image_url, callback) {
        var parseXML = function (xml) {
            var xml_query = jQuery(xml);
            var root = xml_query.children().first();
            var dimensions = root.children().first();
            var width = parseInt(dimensions.attr("width"));
            var height = parseInt(dimensions.attr("height"));
            callback(package.makePyramid(width, height));
        }
        
        jQuery.get(image_url + "/contents.xml", {}, parseXML, "xml");
    
    /*
        jQuery.ajax({
          type: "GET",
          url: image_url + "/contents.xml",
          dataType: "xml",
          success: parseXML
        });
    */
    }
});