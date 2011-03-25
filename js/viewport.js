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
 * @version 9 March 2011
 */

webact.in_package("viewport", function (package) {

    eval(webact.imports("observers"));
    eval(webact.imports("geometry"));
    
    var makeViewAnimator = function (viewport) {
        var animator = {};
        
        var is_animating = false;
        
        var target_scale = 0;
        
        var target_scroll = null;
        
        var steps = 0;
        
        var step_count = 0;
        
        animator.isAnimating = function () {
            return is_animating;
        }
        
        animator.zoomTo = function (scale, scroll) {
            scroll = scroll || null;
            target_scale = scale;
            target_scroll = scroll;
            is_animating = true;
        }
        
        animator.step = function () {
        }
        
        return animator;
    }
    
    package.makeViewport = function (scene_size, view_size) {
        var viewport = makeBroadcaster();
        
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
        
        var initialize = function () {
            initializeCoordinates();
            update();
        }
        
        var initializeCoordinates = function () {
            var horizontal_scale = view_size.width / scene_size.width;
            var vertical_scale = view_size.height / scene_size.height; 
            minimum_scale = Math.min(horizontal_scale, vertical_scale);
            visible_size = view_size.scale(1/ minimum_scale);
            scale = minimum_scale;
            center = makePoint(visible_size.width / 2, visible_size.height / 2);
        }
        
        var update = function () {
            var view_extent = view_size.scale(1 / scale);
            var half_extent = view_extent.scale(1 / 2);
            	
            limits = scene_size.rectangle().inset(half_extent.width, half_extent.height);
            center = center.pinInRectangle(limits);
            
            view_transform = makeTranslate(view_size.width/2, view_size.height/2)
            	.compose(makeScale(scale, scale))
            	.compose(makeRotate(rotation))
            	.compose(makeTranslate(-center.x, -center.y));         	
            scene_transform = view_transform.inverse();
            
            view_polygon = view_size.polygon().project(scene_transform);	
            clipped_view_polygon = view_polygon.clip(scene_size.rectangle());
        }
        
        // ** Accessors
        
        viewport.getViewSize = function () {
            return view_size;
        }
        
        viewport.getSceneSize = function () {
            return scene_size;
        }
        
        viewport.getScale = function () {
            return scale;
        }
        
        viewport.getRotation = function () { 
            return rotation;
        }
        
        viewport.getCenter = function () { 
            return scroll_center; 
        }
        
        viewport.getView = function () {
            return view_polygon;
        }
        
        viewport.getClippedView = function () {
            return clipped_view_polygon;
        }
        
        viewport.getViewTransform = function () {
            return view_transform;
        }
        
        viewport.getSceneTransform = function () {
            return scene_transform;
        }
        
        // ** Set Rotation and Scale
        
        viewport.setScale = function (new_scale) {
            new_scale = Math.min(1.0, Math.max(new_scale, minimum_scale));
            if (scale != new_scale) {
                scale = new_scale;
                update();
                this.broadcast("changed");
            }
        }
        
        viewport.setRotation = function (new_rotation) {
            if (new_rotation < 0)
                new_rotation += 2 * Math.PI;
            if (rotation != new_rotation) {
                rotation = new_rotation;
                update();
                this.broadcast("changed");
            }
        }
        
        // ** View
        
        viewport.centerOn = function (scene_center) {
            if (center.equals(scene_center)) return;
            center = scene_center.pinInRectangle(limits);
            update();
            viewport.broadcast("changed");    
        }
        
        viewport.viewBox = function (area) {
        }
        
        // ** Zoom
        
        viewport.canZoomIn = function () {
            return scale < 1.0;
        }
        
        // center is optional
        viewport.zoomIn = function (center) {
            if (scale < 1.0)
                viewport.setScale(scale * ZOOM_STEP);
        }
        
        viewport.canZoomOut = function () {
            return scale > minimum_scale;
        }
        
        // center is optional
        viewport.zoomOut = function (center) {
            if (scale >= minimum_scale)
                viewport.setScale(scale / ZOOM_STEP);
        }
        
        viewport.zoomReset = function () {
            viewport.setScale(minimum_scale)
        }
        
        viewport.startZoom = function () {
        }
        
        viewport.endZoom = function () {
        }
        
        // ** Pan
        
        viewport.startPan = function (new_pan_start) {
            pan_start = new_pan_start;
            pan_center = center;   
        }
        
        viewport.isPanning = function () {
            return pan_start != null;
        }
        
        viewport.pan = function (view_point) {
            if (pan_center == null) return;
            
            var offset_x = (pan_start.x - view_point.x) / scale;
            var offset_y = (pan_start.y - view_point.y) / scale;
            
            center = makePoint(pan_center.x + offset_x, pan_center.y + offset_y);
            center = center.pinInRectangle(limits);
            
            update();
            viewport.broadcast("changed");
        }
        
        viewport.endPan = function () {
            pan_center = null;
            pan_start = null;
        }
        
        viewport.cancelPan = function () {
            center = pan_center;
            pan_center = null;
            update();
            viewport.broadcast("changed");
        }
        
        // ** String Representation
        
        viewport.toString = function () {
            return (
                "Viewport("
                    + "scale="  + scale + ", "
                    + "center=" + center + ", "
                    + "scene_size="  + scene_size
                + ")"
            );
            return out.join("");
        }
        
        initialize();
        return viewport;
    }   

});