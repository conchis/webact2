/*jslint newcap: false, onevar: false, evil: true */
/*global webact: true, jQuery: false, makeControl: false, 
    makePoint: false, makeRectangle: false, makeDimensions: false, loadPyramid: false,
    makeViewport: false, makeTiledImage: false, SELECT_MODE: false, PAN_MODE: false */

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

webact.in_package("viewer_controls", function (viewer_controls) {

    eval(webact.imports("geometry"));
    eval(webact.imports("pyramid"));
    eval(webact.imports("viewport"));
    eval(webact.imports("controls"));
    eval(webact.imports("viewer"));
    
    var makeNavigator, makeZoomSlider, makeViewerButtons; 
        
    viewer_controls.makeViewerControls = function (viewer) {
        var self = makeControl({});
        
        var viewport = null;
        var image_url = null;
        
        var position = null;
        var size = null;
        var icon_size = null;
        
        var icon = null;
        var panel = null;
        
        var is_shown = true;
        
        var initialize = function () {
            viewer.addListener("loaded", self);
        }; 
        
        var onMouseMove;
        
        var showPanel = function () {
            if (!is_shown) {
                this.dom_element.css(position);
                icon.hide();
                panel.show();
                jQuery("body").bind("mousemove", onMouseMove);
                is_shown = true;
            }
        };
        
        var hidePanel = function () {
            if (is_shown) {
                var dom_element = this.dom_element;
                dom_element.css({
                    left: position.left + size.width - icon_size.width, 
                    top: position.top + size.height - icon_size.height
                });
                icon.show();
                panel.hide();
                jQuery("body").unbind("mousemove", onMouseMove);
                is_shown = false;
            }
        };
        
        var isMouseOver = function (event) {
            var offset = self.dom_element.offset();          
            var pageX = event.pageX;
            var pageY = event.pageY;
            return (pageX >= offset.left && pageX <= (offset.left + size.width) &&
                    pageY >= offset.top  && pageY <= (offset.top + size.height));
        };
        
        onMouseMove = function (event) {
            if (isMouseOver(event)) {
                showPanel();
            }
            else {
                hidePanel();
            }
        };
        
        self.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_controls"
            });  
            container.append(dom_element); 
            dom_element.bind("mousemove", onMouseMove); 
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
            
            var buttons = makeViewerButtons(viewer);
            buttons.create(panel);  
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
        };

        self.loaded = function () {
            var dom_element = self.dom_element;
            viewport = viewer.getViewport();
            image_url = viewer.getImageURL();
            
            var scene_size = viewport.getSceneSize();
            size = makeDimensions(187, scene_size.height * (150 / scene_size.width) + 20);
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
    viewer_controls.makeNavigator = makeNavigator;
    
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
    
    
    makeViewerButtons = function (viewer) {
        var self = makeControl({});
        
        var viewport = viewer.getViewport();
        
        var in_button = null;
        var out_button = null;
        var reset_button = null;
        
        var zoom_button = null;
        var pan_button = null;
        
        var initialize = function () {
            viewer.addListener("onModeChange", self);
            viewport.addListener("zoomed", self);
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
        
        var zoomMode = function (event) {
            event.stopPropagation();
            viewer.setMode(SELECT_MODE);
        };
        
        var panMode = function (event) {
            event.stopPropagation();
            viewer.setMode(PAN_MODE);
        };
        
        self.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_buttons"
            });
            container.append(dom_element);
            
            in_button = jQuery("<a/>", {"class": "wa_in_button"});
            dom_element.append(in_button);
            in_button.button({
                icons: {primary: "ui-icon-plus"},
                text: false,
                label: "Zoom In"
            });
            in_button.click(zoomIn);
            
            out_button = jQuery("<a/>", {"class": "wa_out_button"});
            dom_element.append(out_button);
            out_button.button({
                icons: {primary: "ui-icon-minus"},
                text: false,
                label: "Zoom Out"
            });
            out_button.click(zoomOut);
            
            reset_button = jQuery("<a/>", {"class": "wa_reset_button"});
            dom_element.append(reset_button);
            reset_button.button({
                icons: {primary: "ui-icon-refresh"},
                text: false,
                label: "Reset"
            });
            reset_button.click(zoomReset); 
            
            zoom_button = jQuery("<a/>", {"class": "wa_zoom_button"});
            dom_element.append(zoom_button);
            zoom_button.button({
                icons: {primary: "ui-icon-search"},
                text: false,
                label: "Zoom Mode" 
            });
            zoom_button.click(zoomMode); 
            
            pan_button = jQuery("<a/>", {"class": "wa_pan_button"});
            dom_element.append(pan_button);
            pan_button.button({
                icons: {primary: "ui-icon-arrow-4"},
                text: false,
                label: "Pan Mode"
            });
            pan_button.click(panMode); 
            
            self.zoomed();
            self.onModeChange();                    
            return dom_element;
        };
        
        self.zoomed = function () {
            in_button.button(viewport.canZoomIn() ? "enable" : "disable");
            out_button.button(viewport.canZoomOut() ? "enable" : "disable");
        };
        
        self.onModeChange = function () {
            var mode = viewer.getMode();
            if (mode === SELECT_MODE) {
                zoom_button.button("disable");
                pan_button.button("enable");
            }
            else {
                zoom_button.button("enable");
                pan_button.button("disable");
            }   
        };
        
        initialize();
        return self;
    };

});
