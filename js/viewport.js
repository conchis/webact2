/*jslint newcap: false, onevar: false, evil: true */
/*global webact: true, jQuery: false, makeBroadcaster: false, makePoint: false,
    makeRectangle: false, makeScale: false, makeTranslate: false, makeRotate: false,
    setTimeout: false */

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
    File: viewport.js
    
    Model for tracking and altering a view into a (scaled, rotated) scene 
    coordinate space.
*/

webact.in_package("viewport", function (viewport) {

    eval(webact.imports("observers"));
    eval(webact.imports("geometry"));
    
    var makeZoomAnimator;
    
    viewport.makeViewport = function (scene_size, view_size) {
        var self = makeBroadcaster();
        
        // Zoom steps (not locked, just used for snapping)
        var ZOOM_STEP = Math.SQRT2;
        
        // Dimensions
        var visible_size;
        
        // Float in 0.0 .. 1.0, scale = 1.0 when scene = view
        var scale = 0;
        
        // Float in 0.0 to 1.0, zoom out limit
        var minimum_scale;
        
        // Radians rotation
        var rotation = 0;
        
        // Point center of view
        var center;
        
        // Rectangle limit for scroll center
        var limits;
        
        // Transform from scene -> view coordinates
        var view_transform;
        
        // Transform from view -> scene coordinates
        var scene_transform;
        
        // Polygon representing rotated view
        var view_polygon;
        
        // View polygon clipped by scene rectangle
        var clipped_view_polygon;
        
        // Point center when pan begins in scene coordinates
        var pan_center = null;
        
        // Point start of pan in view coordinates
        var pan_start = null;
        
        // Saved point while centering
        var center_start = null;
        
        // Animator animates zoom and center changes over time
        var animator = makeZoomAnimator(self);
        
        var initializeCoordinates = function () {
            var horizontal_scale = view_size.width / scene_size.width;
            var vertical_scale = view_size.height / scene_size.height; 
            minimum_scale = Math.min(horizontal_scale, vertical_scale);
            visible_size = view_size.scale(1 / minimum_scale);
            scale = minimum_scale;
            center = makePoint(visible_size.width / 2, visible_size.height / 2);
        };
        
        var update = function () {
            var view_extent = view_size.scale(1 / scale);
            var half_extent = view_extent.scale(1 / 2);
            
            limits = scene_size.rectangle().inset(half_extent.width, half_extent.height);
            center = center.pinInRectangle(limits);
            
            view_transform = makeTranslate(view_size.width /  2, view_size.height / 2)
                .compose(makeScale(scale, scale))
                .compose(makeRotate(rotation))
                .compose(makeTranslate(-center.x, -center.y));
            scene_transform = view_transform.inverse();
            
            view_polygon = view_size.polygon().project(scene_transform);	
            clipped_view_polygon = view_polygon.clip(scene_size.rectangle());
        };
        
        var initialize = function () {
            initializeCoordinates();
            update();
        };
    
        self.updateView = function (new_scale, new_center) {
            scale = new_scale;
            center = new_center;
            update();
        };
        
        // ** Accessors
        
        self.getViewSize = function () {
            return view_size;
        };
        
        self.getSceneSize = function () {
            return scene_size;
        };
        
        self.getScale = function () {
            return scale;
        };
        
        self.getRotation = function () { 
            return rotation;
        };
        
        self.getCenter = function () { 
            return center; 
        };
        
        self.getView = function () {
            return view_polygon;
        };
        
        self.getClippedView = function () {
            return clipped_view_polygon;
        };
        
        self.getViewTransform = function () {
            return view_transform;
        };
        
        self.getSceneTransform = function () {
            return scene_transform;
        };
        
        // ** Set Rotation and Scale
        
        self.setScale = function (new_scale) {
            new_scale = Math.min(1.0, Math.max(new_scale, minimum_scale));
            if (scale !== new_scale) {
                scale = new_scale;
                update();
                this.broadcast("zoomed");
            }
        };
   
        self.setRotation = function (new_rotation) {
            if (new_rotation < 0) {
                new_rotation += 2 * Math.PI;
            }
            if (rotation !== new_rotation) {
                rotation = new_rotation;
                update();
                this.broadcast("changed");
            }
        };
        
        // ** Zoom
        
        var snapToLayer = function (scale) {
            var level = Math.ceil(Math.log(scale) / Math.log(ZOOM_STEP));
            var raw_scale = Math.pow(ZOOM_STEP, level);
            return Math.max(minimum_scale, Math.min(raw_scale, 1.0));
        };
        
        var boxScale = function (box) {
            var dimensions = box.dimensions();  
            var horizontal_scale = view_size.width * scale / dimensions.width;
            var vertical_scale = view_size.height * scale / dimensions.height; 
            return snapToLayer(Math.min(horizontal_scale, vertical_scale));
        };
        
        self.canZoomIn = function () {
            return scale < 1.0;
        };
        
        // center is optional
        self.zoomIn = function (center) {
            var new_scale = snapToLayer(scale * ZOOM_STEP);
            if (new_scale >= 1.0) {
                return;
            }
            animator.zoomTo(new_scale, center);
            //self.setScale(new_scale);
        };
        
        self.canZoomOut = function () {
            return scale > minimum_scale;
        };
        
        // center is optional
        self.zoomOut = function (center) {
            var new_scale = snapToLayer(scale / ZOOM_STEP);
            if (new_scale < minimum_scale) {
                return;
            }
            animator.zoomTo(new_scale, center);
        };
        
        self.zoomReset = function () {
            animator.zoomTo(minimum_scale, center);
        };
        
        self.zoomBox = function (view_box) {
            var target_center = view_box.center().project(scene_transform);
            
            var dimensions = view_box.dimensions();
            var target_scale = 0;
            if (dimensions.width > 2 && dimensions.height > 2) {
                target_scale = boxScale(view_box);
            }
            else {
                target_scale = snapToLayer(scale * ZOOM_STEP);
            }
            
            animator.zoomTo(target_scale, target_center);
        };
        
        // ** Pan
        
        self.startPan = function (new_pan_start) {
            pan_start = new_pan_start;
            pan_center = center;   
        };
        
        self.isPanning = function () {
            return pan_start !== null;
        };
        
        self.pan = function (view_point) {
            if (pan_center === null) {
                return;
            }
            
            var offset_x = (pan_start.x - view_point.x) / scale;
            var offset_y = (pan_start.y - view_point.y) / scale;
            
            center = makePoint(pan_center.x + offset_x, pan_center.y + offset_y);
            center = center.pinInRectangle(limits);
            
            update();
            self.broadcast("refreshed");
        };
        
        self.endPan = function () {
            pan_center = null;
            pan_start = null;
            self.broadcast("changed");
        };
        
        self.cancelPan = function () {
            center = pan_center;
            pan_center = null;
            update();
            self.broadcast("changed");
        };
        
        // ** Centering
        
        self.startCenter = function (scene_center) {
            center_start = scene_center;
            self.centerOn(scene_center);
        };
        
        self.centerOn = function (scene_center) {
            if (center.equals(scene_center)) {
                return;
            }
            center = scene_center.pinInRectangle(limits);
            update();
            self.broadcast("refreshed");    
        };  
        
        self.endCenter = function () {
            center_start = null;
            self.broadcast("changed");
        };     
        
        // ** String Representation
        
        self.toString = function () {
            return (
                "Viewport(" +
                    "scale=" + scale + ", " +
                    "center=" + center + ", " +
                    "scene_size="  + scene_size +
                ")"
            );
        };
        
        initialize();
        return self;
    };  
    
    makeZoomAnimator = function (viewport) {
        var self = {};
        
        var DELAY = 1; // Milliseconds
        
        var timer = null;
        
        var target_scale = null;
        
        var target_center = null;
        
        var steps = 0;
        
        var step_count = 0;
        
        var finish = function () {
            viewport.updateView(target_scale, target_center);
            viewport.broadcast("zoomed");
        }; 
        
        var update = function () {
            var scale = viewport.getScale();
            var new_scale = (target_scale + scale) / 2;
            
            var center = viewport.getCenter();
            var new_center = makePoint(
                center.x + (target_center.x - center.x) / 2,
                center.y + (target_center.y - center.y) / 2
            );
            
            viewport.updateView(new_scale, new_center);
            viewport.broadcast("refreshed"); 
        };

        var step = function () {
            step_count += 1;
            if (step_count < steps) {
                update();
                timer = setTimeout(step, DELAY);
            }
            else {
                finish();
                timer = null;
            }  
        };
        
        var start = function () {
            // Start only if animation is not underway
            if (timer !== null) {
                return;
            }
            
            // Compute number of steps
            var scale = viewport.getScale();
            var level = Math.ceil(Math.log(scale) / Math.log(Math.SQRT2));	
            var goal_level = Math.ceil(Math.log(target_scale) / Math.log(Math.SQRT2));
            steps = Math.abs(level - goal_level) + 2; 
            step_count = 0;
                     
             // Initiate Timer
            timer = setTimeout(step, DELAY);            
        };
        
        self.zoomTo = function (new_scale, new_center) {
            target_scale = new_scale || viewport.getScale();
            target_center = new_center || viewport.getCenter();
            start();
        };

        
        return self;
    };

});