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

webact.in_package("geometry", function (geometry) {
 
    // *** Point
    
    var point = {x: 0, y: 0};
    
    var makePoint = function (x, y) {
        return webact.create(point, {x: x, y: y});
    }
    geometry.makePoint = makePoint;
    
    point.equals = function (other) {
        return this.x == other.x && this.y == other.y
    }
    
    point.pinInRectangle = function (rectangle) {
        return makePoint(
	        Math.max(rectangle.left, Math.min(this.x, rectangle.right)),
	        Math.max(rectangle.top,  Math.min(this.y, rectangle.bottom)) );
    }
    
    point.round = function (digits) {
        digits = digits || 6;
        var multiplier = Math.pow(10, digits);
        var x = Math.round(this.x * multiplier) / multiplier;
        var y = Math.round(this.y * multiplier) / multiplier;
        return makePoint(x, y);
    }
    
    point.project = function (transform) {
        var x = this.x;
        var y = this.y;
        var matrix = transform.matrix;
        return makePoint(
            matrix[0] * x + matrix[1] * y + matrix[2],
            matrix[3] * x + matrix[4] * y + matrix[5]);
    }
    
    point.to = function (arg1, arg2) {
        var destination;
        if (typeof(arg2) == "number")
            destination = makePoint(arg1, arg2);
        else
            destination = arg1;
        return webact.create(line, {
            from_x: this.x, 
            from_y: this.y, 
            to_x:   destination.x, 
            to_y:   destination.y
        });
    }
    
    point.toString = function () {
        return "(" + this.x + ", " + this.y + ")";
    }
    
    // *** Dimensions
    
    var dimensions = {width: 0, height: 0};
    
    var makeDimensions = function (width, height) {
        return webact.create(dimensions, {width: width, height: height});
    }
    geometry.makeDimensions = makeDimensions;
    
    dimensions.equals = function (other) {
        return this.width == other.width && this.height == other.height;
    }
    
    dimensions.scale = function (multiplier) {
        return makeDimensions(multiplier * this.width, multiplier * this.height);
    }
    
    dimensions.rectangle = function () {
        return makeRectangle(0, 0, this.width, this.height);
    }
    
    dimensions.polygon = function () { // TESTME
        return this.rectangle().polygon();
    }
    
    dimensions.toString = function () {
        return "Dimensions(width=" + this.width + ", height=" + this.height + ")";
    }
    
    // *** Line (Segment)
    
    var line = {from_x: 0, from_y: 0, to_x: 0, to_y: 0};
    
    line.from = function () {
        return makePoint(this.from_x, this.from_y);
    }
    
    line.to = function () {
        return makePoint(this.to_x, this.to_y);
    }
    
    line.length = function () {
        var width = this.to_x - this.from_x;
        var height = this.to_y - this.from_y;
        return Math.sqrt(width * width + height * height);
    }
    
    line.bounds = function () {
        return makeRectangle(
            Math.min(this.from_x, this.to_x), Math.min(this.from_y, this.to_y), 
            Math.max(this.from_x, this.to_x), Math.max(this.from_y, this.to_y));
    }
    
    line.yForX = function (x) {
        var min_x = Math.min(this.from_x, this.to_x);
        var max_x = Math.max(this.from_x, this.to_x);
        if (x < min_x || x > max_x) return false;
            
        var slope = (this.to_y - this.from_y) / (this.to_x - this.from_x);
        var y = this.from_y + (x - this.from_x) * slope;
        return isNaN(y) ? this.from_y : y;
    }
    
    line.xForY = function (y) {  
        var min_y = Math.min(this.from_y, this.to_y);
        var max_y = Math.max(this.from_y, this.to_y);
        if (y < min_y || y > max_y) return false;
            
        var slope = (this.to_x - this.from_x) / (this.to_y - this.from_y);
        var x = this.from_x + (y - this.from_y) * slope;
        return isNaN(x) ? this.from_x : x;
    }
 
    line.equals = function (other) {
        return this.from_x == other.from_x && this.to_x == other.to_x 
            && this.from_y == other.from_y && this.to_y == other.to_y;
    }
    
    line.toString = function () {
        return this.from().toString() + ".to" + this.to().toString();
    }
    
    // Rectangle
    
    var rectangle = {left: 0, top: 0, right: 0, bottom: 0};
    
    var makeRectangle = function (left, top, right, bottom) {
        return webact.create(rectangle, {
            left: left, top: top, right: right, bottom: bottom
        });
    }
    geometry.makeRectangle = makeRectangle;
    
    var makeRectangleWidthHeight = function (left, top, width, height) {
        var right = left + width;
        var bottom = top + height;
        return webact.create(rectangle, {
            left: left, top: top, right: right, bottom: bottom
        });        
    }
    geometry.makeRectangleWidthHeight = makeRectangleWidthHeight;
    
    rectangle.dimensions = function () {
        return makeDimensions(
            this.right - this.left,  this.bottom - this.top);
    }
    
    rectangle.topLeft = function () {
        return makePoint(this.left, this.top);
    }
    
    rectangle.bottomRight = function () {
        return makePoint(this.right, this.bottom);
    }
    
    rectangle.center = function () {
        return makePoint((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }
    
    rectangle.equals = function (other) {
        return (this.left   == other.left  ) 
            && (this.top    == other.top   )
            && (this.right  == other.right )
            && (this.bottom == other.bottom);
    }
    
    rectangle.containsPoint = function (point) {
        return point.x >= this.left && point.x < this.right
            && point.y >= this.top  && point.y < this.bottom;
    }
    
    rectangle.intersect = function (other) {
        var left   = Math.max(this.left,   other.left );
        var top    = Math.max(this.top,    other.top  );
        var right  = Math.min(this.right,  other.right);
        var bottom = Math.min(this.bottom, other.bottom);
        return makeRectangle(left, top, right, bottom);
    }
    
    rectangle.inset = function (inset_width, inset_height) {
        inset_height = inset_height || inset_width;
        inset_width = Math.min(inset_width, (this.right - this.left) / 2);
        inset_height = Math.min(inset_height, (this.bottom - this.top) / 2);
        return makeRectangle(
            this.left  + inset_width, this.top    + inset_height,
            this.right - inset_width, this.bottom - inset_height);
    }
    
    rectangle.scale = function (scale) {
        return makeRectangle(
            this.left * scale, this.top * scale, this.right * scale, this.bottom * scale);
    }
    
    rectangle.polygon = function () {
        return makePolygon([
            makePoint(this.left,  this.top    ), 
            makePoint(this.right, this.top    ),
            makePoint(this.right, this.bottom ), 
            makePoint(this.left,  this.bottom )
        ]);      
    }
    
    rectangle.toString = function () {
        return "Rectangle(" + 
              "left="     + this.left 
            + ", top="    + this.top 
            + ", right="  + this.right 
            + ", bottom=" + this.bottom + ")";
    }
    
    // Polygon
    
    var polygon = {points: []};
    
    var makePolygon = function (points) {
        return webact.create(polygon, {points: points});
    }
    geometry.makePolygon = makePolygon;
    
    polygon.toString = function () {
        var out = [];
        var points = this.points;
        for (var index = 0; index < points.length; index += 1)
            out.push(points[index].toString());
        return "Polygon(points=[" + points.join(", ") + "])"; 
    }
    
    polygon.bounds = function () {
        var points = this.points;
        if (points.length == 0)
            throw new Error("Invalid operation");
            
        var first_point = points[0];
        var left   = first_point.x;
        var right  = left;
        var top    = first_point.y;
        var bottom = top;
        
        for (var index = 0; index < points.length; index += 1) {
            var point = points[index];
            left   = Math.min(left,   point.x);
            right  = Math.max(right,  point.x);
            top    = Math.min(top,    point.y);
            bottom = Math.max(bottom, point.y); 
        }
        
        return makeRectangle(left, top, right, bottom);
    }
    
    polygon.containsPoint = function (test_point) {
        var points = this.points;
        var cross_count = 0;
        this.forLines(this, function (line) {
            var x = line.xForY(test_point.y);
            if (x !== false && x > test_point.x)
                cross_count += 1;
        });
        return (cross_count & 1) != 0;
    }
    
    polygon.project = function (transform) {
        var points = this.points;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1)
            new_points.push(points[index].project(transform));
        return makePolygon(new_points);
    }
    
    polygon.equals = function (other) {
        var points = this.points;
        var other_points = other.points;
        if (points.length != other_points.length)
            return false;
        var start = 0;
        while (start < points.length && !points[0].equals(other_points[start]))
            start += 1;
        if (start == points.length)
            return false;
        for (var index = 0; index < points.length; index += 1) {
            if (!points[index].equals(other_points[(index + start) % points.length]))
                return false;
        }
        return true;
    }
    
    polygon.forPoints = function (binding, callback) {
        if (callback == undefined) {
            callback = binding;
            binding = this;
        }
        var points = this.points;
        for (var index = 0; index < points.length; index += 1)
            callback.call(binding, points[index], index);
    }
    
    polygon.forLines = function (binding, callback) {
        if (callback == undefined) {
            callback = binding;
            binding = this;
        }
        var points = this.points;
        var limit = points.length - 1;
        for (var index = 0; index < limit; index += 1) {
            var line = points[index].to(points[index + 1]);
            callback.call(binding, line, index);
        }
        if (limit > 0) {
            var close = points[limit].to(points[0]);
            callback.call(binding, close, limit);
        }
    }
    
    var clipTop = function (points, boundry) { 
        var top = boundry.top;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.y >= top)
                new_points.push(from);
            if (from.y < top && to.y >= top || from.y >= top && to.y < top) {
                var x = from.x + (top - from.y) * (to.x - from.x) / (to.y - from.y);
                new_points.push(makePoint(x, top));
            }
        }       
        return new_points;
    }
    
    var clipRight = function (points, boundry) { 
        var right = boundry.right;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.x <= right)
                new_points.push(from);
            if (from.x <= right && to.x > right || from.x > right && to.x <= right) {
                var y = from.y + (right - from.x) * (to.y - from.y) / (to.x - from.x);
                new_points.push(makePoint(right, y));
            }
        }       
        return new_points;
    }
    
    var clipBottom = function (points, boundry) { 
        var bottom = boundry.bottom;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.y <= bottom)
                new_points.push(from);
            if (from.y <= bottom && to.y > bottom || from.y > bottom && to.y <= bottom) {
                var x = from.x + (bottom - from.y) * (to.x - from.x) / (to.y - from.y);
                new_points.push(makePoint(x, bottom));
            }
        }       
        return new_points;
    }
    
    var clipLeft = function (points, boundry) { 
        var left = boundry.left;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.x >= left)
                new_points.push(from);
            if (from.x < left && to.x >= left || from.x >= left && to.x < left) {
                var y = from.y + (left - from.x) * (to.y - from.y) / (to.x - from.x);
                new_points.push(makePoint(left, y));
            }
        }       
        return new_points;
    }
    
    // Clips the Polygon so that all points are within a boundry
    // rectangle.
    
    polygon.clip = function (boundry) {
        var points = this.points;
        points = clipTop   (points, boundry);
        points = clipRight (points, boundry);
        points = clipBottom(points, boundry);
        points = clipLeft  (points, boundry);
        
        return makePolygon(points);
    }
    
    // Transform
    
    var transform = {matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]};
    
    var makeTransform = function (matrix) {
        return webact.create(transform, {matrix: matrix});
    }
    
    // Combine two transforms by multiplying matrices
    
    transform.compose = function (transform) {
        var a = this.matrix;
        var b = transform.matrix;
        
        var matrix = [
            a[0]*b[0] + a[1]*b[3] + a[2]*b[6], 
            a[0]*b[1] + a[1]*b[4] + a[2]*b[7], 
            a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
            
            a[3]*b[0] + a[4]*b[3] + a[5]*b[6], 
            a[3]*b[1] + a[4]*b[4] + a[5]*b[7], 
            a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
            
            a[6]*b[0] + a[7]*b[3] + a[8]*b[6], 
            a[6]*b[1] + a[7]*b[4] + a[8]*b[7], 
            a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
        ];
        
        return makeTransform(matrix);
    }
    
    // Compute the inverse of the matrix to reverse the transform

    transform.inverse = function () {
        var a = this.matrix;
        var det = (  
          a[0]*a[4]*a[8] - a[0]*a[5]*a[7] - a[1]*a[3]*a[8] 
        + a[1]*a[5]*a[6] + a[2]*a[3]*a[7] - a[2]*a[4]*a[6] );
        
        var matrix = [
            ( a[4]*a[8] - a[5]*a[7]) / det,             
            -(a[1]*a[8] - a[2]*a[7]) / det,
            ( a[1]*a[5] - a[2]*a[4]) / det,
            
            -(a[3]*a[8] - a[5]*a[6]) / det,
            ( a[0]*a[8] - a[2]*a[6]) / det,
            -(a[0]*a[5] - a[2]*a[3]) / det,
            
            ( a[3]*a[7] - a[4]*a[6]) / det,
            -(a[0]*a[7] - a[1]*a[6]) / det,
            ( a[0]*a[4] - a[1]*a[3]) / det ];
        
        return makeTransform(matrix);
    }
    
    transform.toString = function () {
        var matrix = this.matrix;
        var out = [];
        for (var index = 0; index < matrix.length; index += 1)
            out.push(matrix[index]);
        return "Transform([" + out.join(", ") + "])"
    }
    
    geometry.makeIdentity = function () {
        return makeTransform(transform.matrix);
    }
    
    geometry.makeTranslate = function (offset_x, offset_y) {
        return makeTransform([1, 0, offset_x, 0, 1, offset_y, 0, 0, 1]);
    }
    
    geometry.makeScale = function (scale_x, scale_y) {
        return makeTransform([scale_x, 0, 0, 0, scale_y, 0, 0, 0, 1]);
    }
    
    geometry.makeRotate = function (radians) {
        var cos_angle = Math.cos(radians);
        var sin_angle = Math.sin(radians);
        return makeTransform([
            cos_angle, -sin_angle,         0, 
            sin_angle,  cos_angle,         0, 
                    0,          0,         1  ]);
    }
    
});
 