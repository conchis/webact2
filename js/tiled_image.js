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

webact.in_package("tiled_image", function (package) {

    eval(webact.imports("geometry"));
    eval(webact.imports("pyramid"));

    var pad = function (number, width) {
        var text = "" + number;
        while (text.length < width)
            text = "0" + text;
        return text;
    }
    
    // Tile
    
    var tile = {layer: 0, column: 0, row: 0, tile_url: null, pyramid: null};
    
    var makeTile = function (image_url, layer, column, row, pyramid) {
        var tile_url = image_url + "/layer" + pad(layer, 4)
            + "/tile" + pad(row, 4) + "n" + pad(column, 4) + ".jpg";
        return webact.create(tile, {
            layer: layer,
            column: column,
            row: row,
            tile_url: tile_url,
            pyramid: pyramid
        });
    }
    package.makeTile = makeTile;
    
    tile.generate = function (container) {
        var element = jQuery("<img/>", {
            src: this.tile_url,
            style: "position: absolute",
            draggable: false
        });
        container.append(element);
        element.data(this);
        this.element = element;
        element.hide();
        this.update();
    }
    
    tile.update = function () {
        var element = this.element;
        element.css("left", this.column * 256);
        element.css("top", this.row * 256);
    }
    
    tile.draw = function (x, y, size) {
        var element = this.element;
        element.css("left", x);
        element.css("top",  y);
        element.css("width", size);
        element.css("height", size);    
        this.element.show();
    }
    
    tile.hide = function () {
        this.element.hide();
    }
    
    // Layer
    
    var makeLayer = function (image_url, layer_number, pyramid, viewport) {
        var layer = {layer_number: layer_number};
        
        var element = null;
        
        var columns = 0;
        var rows = 0;
        var scale = 1.0;
        var tiles = [];
        
        var shown = [];
        
        var initialize = function () {
            var grid_size = pyramid.tileGridSize(layer_number);
            columns = grid_size.width;
            rows = grid_size.height;
            scale = pyramid.scaleForLayer(layer_number);
            initializeTiles();
        }
        
        var initializeTiles = function () {
            tiles = [];
            for (var row = 0; row < rows; row += 1) {
                var row_tiles = [];
                for (var col = 0; col < columns; col += 1)
                    row_tiles.push(null);
                tiles.push(row_tiles); 
            }
        }
        
        var computeOrigin = function (visible_rectangle) {
        	var left = pyramid.tileColumn(visible_rectangle.left, layer_number);
        	left = Math.max(0, Math.min(left, columns - 1));
        	var top = pyramid.tileRow(visible_rectangle.top, layer_number);
        	top = Math.max(0, Math.min(top, rows - 1));
        	return makePoint(left, top);
        }
        
        var computeOffset = function (origin, visible_rectangle, scaled_tile_size, desired_scale) {
        	var left = (origin.x * scaled_tile_size) - visible_rectangle.left * desired_scale;
        	var top  = (origin.y * scaled_tile_size) - visible_rectangle.top  * desired_scale;
        	return makePoint(left, top);
        }
                
        layer.draw = function () {           
            var view_rectangle = viewport.getView().bounds();
		    var desired_scale = viewport.getScale();
            
            var origin = computeOrigin(view_rectangle);
            var scaled_tile_size = pyramid.tile_size * (desired_scale / scale);	
            var offset = computeOffset(origin, view_rectangle, scaled_tile_size, desired_scale);
	
            layer.hide();
            pyramid.forTiles(view_rectangle, layer_number, function (col, row) {
                drawTile(col, row, origin, scaled_tile_size, offset);
            });
        } 

        var drawTile = function (col, row, origin, size, offset) {
            var tile = tiles[row][col];
            if (tile == null) {
                tile = makeTile(image_url, layer_number, col, row, pyramid);
                tiles[row][col] = tile;
                tile.generate(element);
            }
            
            var x = Math.round((col - origin.x) * size + offset.x);
            var y = Math.round((row - origin.y) * size + offset.y);
            tile.draw(x, y, size);
            shown.push(tile);
        }
                
        layer.hide = function () {
            for (var index = 0; index < shown.length; index += 1)
                shown[index].hide();
            shown = [];
        }
        
        layer.generate = function (container) {
            element = jQuery("<div/>", {
                id: "layer" + pad(layer_number, 4),
                style: "position: abolute;"
            });
            container.append(element);
            return element;
        }
        
        initialize();
        return layer;
    }
    package.makeLayer = makeLayer;
    
    var makeTiledImage = function (image_url, pyramid, viewport) {
        var tiled_image = {pyramid: null};
        
        var element = null;
        var layers = [];
        
        var is_panning = false;
        
        var pan_start = null;
        
        var initialize = function () {
            viewport.addListener("changed", tiled_image);
            viewport.addListener("zoomed", tiled_image, "changed");
        }
        
        var generate = function (container) {
            element = jQuery("<div/>", {
                style: "position:relative;width:700px;height:660px;overflow:hidden;"
            });
            container.append(element);
            tiled_image.width   = pyramid.width;
            tiled_image.height  = pyramid.height;
            createLayers();
            this.element = element;
            var offset = element.offset();
            draw();
            return element;
        }
        tiled_image.generate = generate;

        var createLayers = function () {
            layers = [];
            var layer_count = pyramid.layers();
            for (var layer_number = 0; layer_number < layer_count; 
                    layer_number += 1) {
                var layer = makeLayer(image_url, layer_number, pyramid, viewport);
                layer.generate(element);
                layers.push(layer);
            }
        }
        
        tiled_image.changed = function () {
            draw();
        }
        
        var draw = function () {
            var layer_number = pyramid.layerForScale(viewport.getScale());
            var layer_count = pyramid.layers();
            for (var index = 0; index < layer_count; index += 1) {
                var layer = layers[index];
                if (index <= layer_number)
                    layer.draw();
                else
                    layer.hide();
            }
        }

        tiled_image.toString = function () {
            return "TiledImage(width=" + tiled_image.width 
                    + ", height=" + tiled_image.height + ")";
        }
        
        initialize();
        return tiled_image;
    }
    package.makeTiledImage = makeTiledImage;


});