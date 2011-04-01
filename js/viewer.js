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
        
        var setMode = function (new_mode) {
            if (new_mode === undefined) {
                new_mode = (mode === SELECT_MODE) ? PAN_MODE : SELECT_MODE;
            }
            mode = new_mode;
            if (mode === PAN_MODE) {
                self.dom_element.css("cursor", "move");
            }
            else {
                self.dom_element.css("cursor", "default");
            }
        };
        
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
    
    viewer.makeViewerControls = function (viewer) {
        var self = makeControl({});
        
        var viewport = null;
        var image_url = null;
        
        var position = null;
        var size = null;
        var icon_size = null;
        
        var icon = null;
        var panel = null;
        
        var initialize = function () {
            viewer.addListener("loaded", self);
        }; 
        
        var showPanel = function () {
            this.dom_element.css(position);
            icon.hide();
            panel.show();
        };
        
        var hidePanel = function () {
            //panel.hide("fade", 100);
            var dom_element = this.dom_element;
            dom_element.css({
                left: position.left + size.width - icon_size.width, 
                top: position.top + size.height - icon_size.height
            });
            icon.show();
            panel.hide();
        };

        var onMouseOver = function (event) {
            showPanel();
        };
        
        var onMouseOut = function (event) {
            var offset = self.dom_element.offset();
            
            var pageX = event.pageX;
            var pageY = event.pageY;
            if (pageX >= offset.left && pageX <= (offset.left + size.width) &&
                pageY >= offset.top  && pageY <= (offset.top + size.height)) {
                return;
            }
            
            hidePanel();
        };
        
        self.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_controls"
            });  
            container.append(dom_element);  
            return dom_element;
        };
        
        var generatePanel = function (dom_element) {
            panel = jQuery("<div/>", {
                "class": "wa_image_panel"
            });
            dom_element.append(panel);
            this.dom_element = dom_element;
            
            panel.css({width: size.width - 2, height: size.height - 2});
            
            var navigator = makeNavigator(viewport, image_url);
            navigator.create(panel);
            
            var slider = makeZoomSlider(viewport);
            slider.create(panel);
            
            var buttons = makeViewerButtons(viewport);
            buttons.create(panel);
            
            panel.bind("mouseout", onMouseOut);
        };
        
        var generateIcon = function (dom_element) {
            var scene_size = viewport.getSceneSize();
            var width = 64;
            var height = scene_size.height * width / scene_size.width;
            icon_size = makeDimensions(width, height);
            
            icon = jQuery("<div/>", {
                "class": "wa_image_icon"
            });
            dom_element.append(icon);
            //icon.css({left: size.width - width - 5, top: size.height - height - 5});
            icon.css({left: 0, top: 0});
            
            var shadow = jQuery("<img/>", {
                "src": "../../images/semishadow.png"
            });
            shadow.css({left: 5, top: 5, width: width, height: height});
            icon.append(shadow);
        
            var image = jQuery("<img/>", {
                "src": image_url + "/thumbnail.jpg",
                "class": "wa_image_small"
            });
            image.css("width", width);
            icon.append(image);
            
            icon.bind("mouseover", onMouseOver);
        };

        self.loaded = function () {
            var dom_element = self.dom_element;
            viewport = viewer.getViewport();
            image_url = viewer.getImageURL();
            
            var scene_size = viewport.getSceneSize();
            size = makeDimensions(200, scene_size.height * (150 / scene_size.width) + 20);
            dom_element.css({width: size.width, height: size.height});
            
            position = dom_element.offset();
            
            generateIcon(dom_element);
            generatePanel(dom_element);
            hidePanel();
        };
          
        initialize();
        return self;
    };
    
    makeNavigator = function (viewport, image_url) {
        var navigator = makeControl({});
        
        var top = 0;
        var left = 0;
        var width = 150;
        var height = 0;
        
        var scale = 0;
        
        var indicator = null;
        
        var is_tracking = false;
        
        var initialize = function () {
            var scene_size = viewport.getSceneSize();
            scale = width / scene_size.width;

            height = Math.round(scene_size.height * scale);
            viewport.addListener("changed", navigator);
            viewport.addListener("zoomed", navigator, "changed");
            
        };
        
        var track = function (event) {
            if (!is_tracking) {
                return;
            }
            event.stopPropagation();
            var center = makePoint(
                Math.round((event.pageX - left) / scale), 
                Math.round((event.pageY - top) / scale));
            viewport.centerOn(center);
        };
        
        var startTracking = function (event) {
            event.preventDefault(true);
            event.stopPropagation();
            var offset = navigator.dom_element.offset();
            left = offset.left;
            top = offset.top;
            is_tracking = true;
            track(event);
        };
        
        var stopTracking = function (event) {
            event.stopPropagation();
            is_tracking = false;
        };

        var attachEvents = function (dom_element) {
            dom_element.mousedown(startTracking);    
            dom_element.mousemove(track); 
            dom_element.mouseup(stopTracking);
        };
        
        navigator.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_navigator"
            });  
            container.append(dom_element);
            
            var thumbnail = jQuery("<img/>", {
                'src': image_url + "/thumbnail.jpg",
                'class': "wa_image_thumbnail",
                'draggable': false,
                'width': width,
                'height': height
            });
            dom_element.append(thumbnail);  
            
            indicator = jQuery("<div/>", {
                "class": "wa_image_indicator",
                "width": width - 2,
                "height": height - 2
            });
            dom_element.append(indicator);
            
            attachEvents(dom_element);          
            return dom_element;
        };
                
        navigator.changed = function () {
            var rectangle = viewport.getView().bounds().scale(scale);
            var dimensions = rectangle.dimensions(); 
              
            var position = {
                "left":   Math.max(Math.round(rectangle.left), 0),
                "top":    Math.max(Math.round(rectangle.top), 0),
                "width":  Math.min(Math.round(dimensions.width), width) - 2,
                "height": Math.min(Math.round(dimensions.height), height) - 2
            };
            indicator.css(position);
        };
        
        initialize();
        return navigator;
    };
    viewer.makeNavigator = makeNavigator;
    
    makeZoomSlider = function (viewport) {
        var slider = makeControl({});
        
        var initialize = function () {
            viewport.addListener("zoomed", slider);
        };
        
        var adjustZoom = function (event, ui) {
            viewport.setScale(ui.value / 100.0);
        };
                
        slider.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_slider"
            });
            container.append(dom_element);
            
            dom_element.slider({
                orientation: 'vertical',
                slide: adjustZoom
            });
            
            return dom_element;
        };
        
        slider.zoomed = function () {
            var dom_element = slider.dom_element;
            dom_element.slider("option", "value", 
                Math.round(100 * viewport.getScale()));
        };
        
        initialize();
        return slider;
    };
    
    
    makeViewerButtons = function (viewport) {
        var buttons = makeControl({});
        
        var in_button = null;
        var out_button = null;
        var reset_button = null;
        
        var initialize = function () {
            viewport.addListener("zoomed", buttons);
        };
        
        var zoomIn = function (event) {
            event.stopPropagation();
            viewport.zoomIn();
        };
        
        var zoomOut = function (event) {
            event.stopPropagation();
            viewport.zoomOut();
        };
        
        var zoomReset = function (event) {
            event.stopPropagation();
            viewport.zoomReset();
        };
        
        buttons.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_buttons"
            });
            container.append(dom_element);
            
            in_button = jQuery("<a/>");
            dom_element.append(in_button);
            in_button.button({
                icons: {primary: "ui-icon-plus"},
                text: false,
                label: "Zoom In"
            });
            in_button.click(zoomIn);
            
            out_button = jQuery("<a/>");
            dom_element.append(out_button);
            out_button.button({
                icons: {primary: "ui-icon-minus"},
                text: false,
                label: "Zoom Out",
                click: zoomOut
            });
            out_button.click(zoomOut);
            
            reset_button = jQuery("<a/>");
            dom_element.append(reset_button);
            reset_button.button({
                icons: {primary: "ui-icon-refresh"},
                text: false,
                label: "Reset",
                click: zoomReset
            });
            reset_button.click(zoomReset); 
            
            buttons.zoomed();                    
            return dom_element;
        };
        
        buttons.zoomed = function () {
            in_button.button(viewport.canZoomIn() ? "enable" : "disable");
            out_button.button(viewport.canZoomOut() ? "enable" : "disable");
        };
        
        initialize();
        return buttons;
    };

});
