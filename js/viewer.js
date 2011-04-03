/*jslint newcap: false, onevar: false, evil: true */
/*global webact: true, jQuery: false, makeControl: false, 
    makePoint: false, makeRectangle: false, makeDimensions: false, loadPyramid: false,
    makeViewport: false, makeTiledImage: false */

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

webact.in_package("viewer", function (viewer) {

    eval(webact.imports("geometry"));
    eval(webact.imports("pyramid"));
    eval(webact.imports("viewport"));
    eval(webact.imports("tiled_image"));
    eval(webact.imports("controls"));
    
    var makeSelector, makeNavigator, makeZoomSlider, makeViewerButtons; 
    
    // Constants for viewer mode
    var SELECT_MODE = 0;
    var PAN_MODE    = 1;
    
    viewer.SELECT_MODE = SELECT_MODE;
    viewer.PAN_MODE = PAN_MODE;
    
    viewer.makeViewer = function (options) {
		var self = makeControl(options);
		
		var mode = SELECT_MODE;
		var shift_mode = false;
		
		var width  = options.width;
		var height = options.height;
		
		var image_url = options.image_url;
		var image     = null;
		var viewport  = null;
		
		// Selection rectangle
		var selector = null;
		
		
		self.getViewport = function () {
		    return viewport;
		};
		
		self.getImageURL = function () {
		    return image_url;
		};
		
        self.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_viewer"
            });
            dom_element.css("width", width);
            dom_element.css("height", height);
            container.append(dom_element);
            if (options.css) {
                dom_element.addClass(options.css);
            }
            dom_element.data("_control", this);
            self.load(image_url, dom_element);
            return dom_element;
        };
        
        self.getMode = function () { 
            return mode; 
        };
        
        var setMode = function (new_mode) {
            if (new_mode === undefined) {
                new_mode = (mode === SELECT_MODE) ? PAN_MODE : SELECT_MODE;
            }
            if (new_mode !== mode) {
                mode = new_mode;
                if (mode === PAN_MODE) {
                    self.dom_element.css("cursor", "move");
                }
                else {
                    self.dom_element.css("cursor", "default");
                }
                self.broadcast("onModeChange", new_mode); 
            }        
        };
        self.setMode = setMode;
        
        var onPan = function (event) {
            var mouse_point = makePoint(event.pageX, event.pageY);
            viewport.pan(mouse_point);
            setMode(mode);
        };
        
        var onPanEnd = function (event) {
            var element = self.dom_element;
            viewport.endPan();
            
            element.unbind("mousemove", onPan);
            jQuery("body").unbind("mouseup", onPanEnd);
        };
        
        var onMouseDown = function (event) {
            var element = self.dom_element;
            var mouse_point = makePoint(event.pageX, event.pageY);
            
            if (mode === PAN_MODE) {
                viewport.startPan(mouse_point);  
                element.bind("mousemove", onPan);
                jQuery("body").bind("mouseup", onPanEnd);
            }
            else if (mode === SELECT_MODE) {
                selector.select(mouse_point, event);
            }
        };
 
        var onKey = function (event) {
            if (event.shiftKey) {
                if (!shift_mode) {
                    setMode();
                    shift_mode = true;
                }
            }
            else {
                if (shift_mode) {
                    setMode();
                    shift_mode = false;
                }
            }
        };

        self.load = function (image_url, dom_element) {
            loadPyramid(image_url, function (pyramid) {
                viewport = makeViewport(pyramid.dimensions(), 
                    makeDimensions(width, height)); 
                image = makeTiledImage(image_url, pyramid, viewport);       
                image.generate(dom_element, dom_element);                
                selector = makeSelector(self, viewport);
                selector.create(dom_element);
                dom_element.mousedown(onMouseDown);
                jQuery("body").bind("keydown", onKey);
                jQuery("body").bind("keyup", onKey); 
                setMode(mode);               
                self.broadcast("loaded");             
            });
        };
        
        self.canZoomIn = function () {
            return viewport.canZoomIn();
        };
        
        self.zoomIn = function () {
            return viewport.zoomIn();
        };
        
        self.canZoomOut = function () {
            return viewport.canZoomOut();
        };
        
        self.zoomOut = function () {
            viewport.zoomOut();
        };
        
        self.zoomReset = function () {
            viewport.zoomReset();
        };
        
        self.setScale = function (scale) {
            viewport.setScale(scale);
        };
		
		return self;
    };
    
    makeSelector = function (viewer, viewport) {
        var self = makeControl({});
        
        var offset = null;
        var start = null;
        
        self.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_selector"
            });
            container.append(dom_element);
            dom_element.hide();
            return dom_element;
        };
        
        var onMouseMove = function (event) {
            self.dom_element.css({
                left:   Math.min(start.x, event.pageX) - offset.left,
                top:    Math.min(start.y, event.pageY) - offset.top,
                width:  Math.abs(event.pageX - start.x),
                height: Math.abs(event.pageY - start.y)
            });     
        };
        
        var onMouseUp = function (event) {
            viewer.dom_element.unbind("mousemove", onMouseMove);
            jQuery("body").unbind("mouseup", onMouseUp);  
            self.hide();
            
            var zoom_box = makeRectangle(
                Math.min(start.x, event.pageX) - offset.left,
                Math.min(start.y, event.pageY) - offset.top,
                Math.max(start.x, event.pageX) - offset.left,
                Math.max(start.y, event.pageY) - offset.top             
            );
            viewport.zoomBox(zoom_box);
        };
        
        self.select = function (start_point) {
            start = start_point;
            offset = viewer.dom_element.offset();
            var element = self.dom_element;
            element.css("left", start_point.x - offset.left);
            element.css("top", start_point.y - offset.top);
            element.css("width", 0);
            element.css("height", 0); 
            self.show();
            
            viewer.dom_element.bind("mousemove", onMouseMove);
            jQuery("body").bind("mouseup", onMouseUp);           
        };
        
        return self;
    };
    
});
