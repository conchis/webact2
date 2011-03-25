/**
 * Copyright 2011 Jonathan A. Smith.
 *
 * Licensed under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *    http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * @author Jonathan A. Smith
 * @version 5 March 2011
 */

webact.in_package("viewer", function (package) {

    eval(webact.imports("geometry"));
    eval(webact.imports("pyramid"));
    eval(webact.imports("viewport"));
    eval(webact.imports("tiled_image"));
    eval(webact.imports("controls"));
    
    package.makeViewer = function (options) {
     
		var viewer = makeControl(options);
		
		var width  = options.width;
		var height = options.height;
		
		var image_url = options.image_url;
		var image     = null;
		var viewport  = null;
		
		var is_panning = false;
		
        viewer.generate = function (container) {
            var dom_element = jQuery("<div/>", {
            	"class": "wa_image_viewer"
            });
            dom_element.css("width", width);
            dom_element.css("height", height);
            container.append(dom_element);
            if (options.css)
            	dom_element.addClass(options.css);
            dom_element.data("_control", this);
            viewer.load(image_url, dom_element);
            return dom_element;
        }
        
        var generateControls = function (dom_element) {
            var navigator = makeNavigator(viewport, image_url);
            navigator.create(dom_element);
            
            var slider = makeZoomSlider(viewport);
            slider.create(dom_element);
            
            var buttons = makeViewerButtons(viewport);
            buttons.create(dom_element);
        }

        viewer.load = function (image_url, dom_element) {
            loadPyramid(image_url, function (pyramid) {
                viewport = makeViewport(pyramid.dimensions(), 
                    makeDimensions(width, height)); 
                image = makeTiledImage(image_url, pyramid, viewport);       
                image.generate(dom_element, dom_element);
                attachEvents(dom_element);               
                generateControls(dom_element);
            });
        }
        
        var attachEvents = function (element) {    
            
            element.mousedown(function (event) {
                is_panning = true;
                var mouse_point = makePoint(event.pageX, event.pageY);
                viewport.startPan(mouse_point);
            });
            
            element.mousemove(function (event) {
                if (!is_panning) return;
                var mouse_point = makePoint(event.pageX, event.pageY);
                viewport.pan(mouse_point);
            });
            
            element.mouseup(function () {
                is_panning = false;
                viewport.endPan();
            });
        }
        
        viewer.canZoomIn = function () {
            return viewport.canZoomIn();
        }
        
        viewer.zoomIn = function () {
            return viewport.zoomIn();
        }
        
        viewer.canZoomOut = function () {
            return viewport.canZoomOut();
        }
        
        viewer.zoomOut = function () {
            viewport.zoomOut();
        }
        
        viewer.zoomReset = function () {
            viewport.zoomReset();
        }
        
        viewer.setScale = function (scale) {
            viewport.setScale(scale);
        }
		
		return viewer;
    };
    
    var makeNavigator = function (viewport, image_url) {
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
        }
        
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
        }
        
        var attachEvents = function (dom_element) {
            dom_element.mousedown(function (event) {
                event.preventDefault(true);
                event.stopPropagation();
                var offset = dom_element.offset();
                left = offset.left;
                top = offset.top;
                is_tracking = true;
            });
            
            dom_element.mousemove(function (event) {
                if (!is_tracking) return;
                event.preventDefault(true);
                event.stopPropagation();
                var center = makePoint(
                    Math.round((event.pageX - left) / scale), 
                    Math.round((event.pageY - top ) / scale));
                viewport.centerOn(center);
            });
            
            dom_element.mouseup(function (event) {
                event.preventDefault(true);
                event.stopPropagation();
                is_tracking = false;
            });
        }
        
        navigator.changed = function () {
            var rectangle = viewport.getView().bounds().scale(scale);
            var dimensions = rectangle.dimensions();           
            indicator.css("left",   Math.round(rectangle.left       ));
            indicator.css("top",    Math.round(rectangle.top        ));
            indicator.css("width",  Math.round(dimensions.width - 2 ));
            indicator.css("height", Math.round(dimensions.height - 2));
        }
        
        initialize();
        return navigator;
    }
    package.makeNavigator = makeNavigator;
    
    var makeZoomSlider = function (viewport) {
        var slider = makeControl({});
        
        var initialize = function () {
            viewport.addListener("changed", slider);
        }
        
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
        }
        
        var adjustZoom = function (event, ui) {
            viewport.setScale(ui.value / 100.0);
        }
        
        slider.changed = function () {
            var dom_element = slider.dom_element;
            dom_element.slider("option", "value", 
                Math.round(100 * viewport.getScale()));
        }
        
        initialize();
        return slider;
    }
    
    
    var makeViewerButtons = function (viewport) {
        var buttons = makeControl({});
        
        var in_button = null;
        var out_button = null;
        var reset_button = null;
        
        var initialize = function () {
            viewport.addListener("changed", buttons);
        }
        
        var zoomIn = function () {
            viewport.zoomIn();
        }
        
        var zoomOut = function () {
            viewport.zoomOut();
        }
        
        var zoomReset = function () {
            viewport.zoomReset();
        }
        
        buttons.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_image_buttons"
            });
            container.append(dom_element);
            
            in_button = jQuery("<a/>");
            dom_element.append(in_button);
            in_button.button({
                icons: {primary: "ui-icon-zoomin"},
                text: false,
                label: "Zoom In"
            });
            in_button.click(zoomIn);
            
            out_button = jQuery("<a/>");
            dom_element.append(out_button);
            out_button.button({
                icons: {primary: "ui-icon-zoomout"},
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
            
            buttons.changed();                    
            return dom_element;
        }
        
        buttons.changed = function () {
            in_button.button( viewport.canZoomIn()  ? "enable" : "disable");
            out_button.button(viewport.canZoomOut() ? "enable" : "disable");
        }
        
        initialize();
        return buttons;
    }

});
