/*jslint newcap: false, onevar: false */
/*global webact: true, jQuery: false */

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
     File: geometry.js
     
     A package of geometric objects: Point, Dimensions, Line, Rectangle, 
     Polygon, and Transform.
 */

webact.in_package("geometry", function (geometry) {

    var line, makeRectangle, makePolygon;
 
    /*
        Class: Point
        
        Properties:
            x - x coordinate
            y - y coordinate
    */
    
    var point = {x: 0, y: 0};
    
    /*
        Constructor: makePoint
        
        Creates a new point.
        
        Parameters:
            x - x coordinate
            y - y coordinate
    */
    
    var makePoint = function (x, y) {
        return webact.create(point, {x: x, y: y});
    };
    geometry.makePoint = makePoint;
    
    /*
        Function: equals
        
        Tests for equality between points.
        
        Parameters:
            other - point to compare 
            
        Returns:
            true if points are equal, false otherwise
    */
    
    point.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    
    /*
        Function: pinInRectangle
        
        Computes a point with x and y coordinates changes so as to be within
        a specified rectangle. If the point is within the rectangle, it is 
        returned unchanged.
        
        Parameters:
            rectangle - rectangle in which to pin point
            
        Returns:
            Point translated so as to move in to the specified rectangle
    */
    
    point.pinInRectangle = function (rectangle) {
        return makePoint(
	        Math.max(rectangle.left, Math.min(this.x, rectangle.right)),
	        Math.max(rectangle.top,  Math.min(this.y, rectangle.bottom)));
    };
    
    /*
        Function: round
        
        Rounds both coordinates to a specified number of digits (default is 6)
        
        Parameters:
            digits - (optional) number of digits to round x and y coordinates
            
        Returns:
            Point with rounded coordinates
    */
    
    point.round = function (digits) {
        digits = digits || 6;
        var multiplier = Math.pow(10, digits);
        var x = Math.round(this.x * multiplier) / multiplier;
        var y = Math.round(this.y * multiplier) / multiplier;
        return makePoint(x, y);
    };
    
    /*
        Function: project
        
        Returns a point that us the result of multiplying the point by
        a 3 x 3 affine tranformation matrix.
        
        Parameters:
            transform - Tansform to apply to point
            
        Returns:
            Point result of projection
        
    */
    
    point.project = function (transform) {
        var x = this.x;
        var y = this.y;
        var matrix = transform.matrix;
        return makePoint(
            matrix[0] * x + matrix[1] * y + matrix[2],
            matrix[3] * x + matrix[4] * y + matrix[5]);
    };
    
    /*
        Function: to
        
        Constructs a line from two points. The distant point may be passed in
        as numeric x and y coordinates or as a Point object.
        
        Parameters:
            arg1 - x coordinate or distant point
            arg2 - y (optional) coordinate 
            
        Returns:
            Line connecting the two points
        
    */
    
    point.to = function (arg1, arg2) {
        var destination;
        if (typeof(arg2) === "number") {
            destination = makePoint(arg1, arg2);
        }
        else {
            destination = arg1;
        }
        return webact.create(line, {
            from_x: this.x, 
            from_y: this.y, 
            to_x:   destination.x, 
            to_y:   destination.y
        });
    };
    
    /*
        Function: toString
        
        Returns a string representation of the point.
            
        Returns:
            String representation
    */
    
    point.toString = function () {
        return "(" + this.x + ", " + this.y + ")";
    };
    
    /*
        Class: Dimensions
        
        Properties:
            width - dimensions width
            height - dimensions height 
    */
    
    var dimensions = {width: 0, height: 0};
    
    /*
        Constructor: makeDimensions
        
        Constructs a Dimensions from width and height
        
        Parameters:
            width  - width of Dimensions
            height - height of Dimensions 
            
        Returns:
            Dimensions with specified width and height
        
    */
    
    var makeDimensions = function (width, height) {
        return webact.create(dimensions, {width: width, height: height});
    };
    geometry.makeDimensions = makeDimensions;
    
    /*
        Function: equals
        
        Test for equality to another Dimensions.
        
        Parameters:
            other - Dimensions to test
            
        Returns:
            true if equal, false otherwise
    */
    
    dimensions.equals = function (other) {
        return this.width === other.width && this.height === other.height;
    };
    
    /*
        Function: scale
        
        Scales both width and height of a Dimensions.
        
        Parameters:
            multiplier - multiplier for dimensions (width, height)
            
        Returns:
            Dimensions with both width and height scaled
        
    */
    
    dimensions.scale = function (multiplier) {
        return makeDimensions(multiplier * this.width, multiplier * this.height);
    };
    
    /*
        Function: rectangle
        
        Creates a rectangle at the origin (0, 0) with the size specified by
        this dimensions.
            
        Returns:
            Rectangle
        
    */
    
    dimensions.rectangle = function () {
        return makeRectangle(0, 0, this.width, this.height);
    };
    
    /*
        Function: polygon
        
        Returns a rectangular polygon at the origin with the size specified by
        the Dimensions.
        
        Returns:
            Polygon
        
    */
    
    dimensions.polygon = function () { // TESTME
        return this.rectangle().polygon();
    };

    /*
        Function: toString
        
        Provides a string representation of a Dimensions
         
        Returns:
            String Representation.
        
    */
    
    dimensions.toString = function () {
        return "Dimensions(width=" + this.width + ", height=" + this.height + ")";
    };
    
    /*
        Class: Line
        
        Class of directed line segments specified by end points.
        
        Properties:
            from_x - x coordinate of start point
            from_y - y coordinate of start point
            to_x   - x coordinate of end point
            to_y   - y coordinate of end point
    */
    
    line = {from_x: 0, from_y: 0, to_x: 0, to_y: 0};
    
    /*
        Function: from
        
        Returns:
            the start point of the line segment
    */
    
    line.from = function () {
        return makePoint(this.from_x, this.from_y);
    };
    
    /*
        Function: to
        
        Returns:
            the end point of the line segment
    */
    
    line.to = function () {
        return makePoint(this.to_x, this.to_y);
    };
    
    /*
        Function: length
        
        Returns: 
            The length of the line segment
    */
    
    line.length = function () {
        var width = this.to_x - this.from_x;
        var height = this.to_y - this.from_y;
        return Math.sqrt(width * width + height * height);
    };
    
    /*
        Function: bounds
        
        Returns:
            A Rectangle tightly fitting the line segment
    */
    
    line.bounds = function () {
        return makeRectangle(
            Math.min(this.from_x, this.to_x), Math.min(this.from_y, this.to_y), 
            Math.max(this.from_x, this.to_x), Math.max(this.from_y, this.to_y));
    };
    
    /*
        Function: yForX
        
        Returns:
            A y value on the line for a given x or false if out of bounds. 
    */
    
    line.yForX = function (x) {
        var min_x = Math.min(this.from_x, this.to_x);
        var max_x = Math.max(this.from_x, this.to_x);
        if (x < min_x || x > max_x) {
            return false;
        }
            
        var slope = (this.to_y - this.from_y) / (this.to_x - this.from_x);
        var y = this.from_y + (x - this.from_x) * slope;
        return isNaN(y) ? this.from_y : y;
    };
    
    /*
        Function: xForY
        
        Returns:
            A x value on the line for a given y or false if out of bounds.
    */
    
    line.xForY = function (y) {  
        var min_y = Math.min(this.from_y, this.to_y);
        var max_y = Math.max(this.from_y, this.to_y);
        if (y < min_y || y > max_y) {
            return false;
        }
            
        var slope = (this.to_x - this.from_x) / (this.to_y - this.from_y);
        var x = this.from_x + (y - this.from_y) * slope;
        return isNaN(x) ? this.from_x : x;
    };
    
    /*
        Function: equals
        
        Determines if this line has the same coordinates as another line.
        
        Returns:
            True if the specified line segment has the same coordinates
    */
 
    line.equals = function (other) {
        return this.from_x === other.from_x && this.to_x === other.to_x &&
               this.from_y === other.from_y && this.to_y === other.to_y;
    };
    
    /*
        Function: toString
        
        Returns:
            A string representation of the line.
    */
    
    line.toString = function () {
        return this.from().toString() + ".to" + this.to().toString();
    };
    
    /*
        Class: Rectangle
        
        Class of rectangles represented as left-top and right-bottom points.
        
        Properties:
            left   - x coordinate of left edge
            top    - y coordinate of top edge
            right  - x coordinate of right edge
            bottom - y coordinate of bottom edge
    */
    
    var rectangle = {left: 0, top: 0, right: 0, bottom: 0};
    
    /*
        Constructor: makeRectangle
        
        Constructs a rectangle from the left, top, right, and bottom
        coordinates.
        
        Parameters:
            left   - left x coordinate
            top    - top y coordinate
            right  - right x coordinate
            bottom - bottom y coordinate
    */
    
    makeRectangle = function (left, top, right, bottom) {
        return webact.create(rectangle, {
            left: left, 
            top: top, 
            right: right, 
            bottom: bottom
        });
    };
    geometry.makeRectangle = makeRectangle;
    
    /*
        Constructor: makeRectangleWidthHeight
        
        Constructs a rectangle from left, top, width and height. 
        
        Parameters:
            left   - left x coordinate
            top    - top y coordinate  
            width  - width of rectangle
            height - height of rectangle      
    */
    
    var makeRectangleWidthHeight = function (left, top, width, height) {
        var right = left + width;
        var bottom = top + height;
        return webact.create(rectangle, {
            left: left, 
            top: top, 
            right: right, 
            bottom: bottom
        });        
    };
    geometry.makeRectangleWidthHeight = makeRectangleWidthHeight;
    
    /*
        Function: dimensions
        
        Returns:
            The size of the rectangle (width, height)
    */
    
    rectangle.dimensions = function () {
        return makeDimensions(
            this.right - this.left,  this.bottom - this.top);
    };
    
    /*
        Function: topLeft
        Returns:
            The top left point of the rectangle
    */
    
    rectangle.topLeft = function () {
        return makePoint(this.left, this.top);
    };
    
    /*
        Function: bottomRight
        Returns:
            The bottom right point of the rectangle
    */
    
    rectangle.bottomRight = function () {
        return makePoint(this.right, this.bottom);
    };
    
    /*
        Function: center
        Returns:
            The rectangle's center point
    */
    
    rectangle.center = function () {
        return makePoint((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    };
    
    /*
        Function: equals
        
        Determines if two rectangles are equal.
        
        Parameters:
            other - rectangle to compare with this rectangle
    */
    
    rectangle.equals = function (other) {
        return (this.left === other.left) && 
               (this.top === other.top) &&
               (this.right === other.right) &&
               (this.bottom === other.bottom);
    };
    
    /*
        Function: containsPoint
        
        Determines if this rectangle contains a specified point.
        
        Parameters:
            point - Point to test
        
        Returns:
            True if the rectangle contains point, false otherwise.
    */
    
    rectangle.containsPoint = function (point) {
        return point.x >= this.left && point.x < this.right &&
               point.y >= this.top && point.y < this.bottom;
    };
    
    /*
        Function: intersect
        
        Detemines if this rectangle overlaps another.
        
        Parameters:
            other - rectangle to test
            
        Returns:
            true if overlaps, false otherwise
    */
    
    rectangle.intersect = function (other) {
        var left = Math.max(this.left, other.left);
        var top = Math.max(this.top, other.top);
        var right = Math.min(this.right, other.right);
        var bottom = Math.min(this.bottom, other.bottom);
        return makeRectangle(left, top, right, bottom);
    };
    
    /*
        Function: inset
        
        Inset a rectangle by a specified with and height.
        
        Parameters:
            inset_width  - width to inset from left and right edge
            inset_height - height to inset from top and bottom edge
        
        Returns:
            A new rectangle inset by a specified width and height
    */
    
    rectangle.inset = function (inset_width, inset_height) {
        inset_height = inset_height || inset_width;
        inset_width = Math.min(inset_width, (this.right - this.left) / 2);
        inset_height = Math.min(inset_height, (this.bottom - this.top) / 2);
        return makeRectangle(
            this.left  + inset_width, this.top    + inset_height,
            this.right - inset_width, this.bottom - inset_height);
    };
    
    /*
        Function: scale
        
        Scales all of the coordinates in the rectangle by a specified
        multilier.
        
        Parameters:
            scale - scale to multiply
            
        Returns:
            Scaled rectangle
    */
    
    rectangle.scale = function (scale) {
        return makeRectangle(
            this.left * scale, this.top * scale, this.right * scale, this.bottom * scale);
    };
    
    /*
        Function: polygon
        
        Returns a Polygon containing all four points of this rectangle.
        
        Returns:
            Polygon
    */
    
    rectangle.polygon = function () {
        return makePolygon([
            makePoint(this.left, this.top), 
            makePoint(this.right, this.top),
            makePoint(this.right, this.bottom), 
            makePoint(this.left, this.bottom)
        ]);      
    };
    
    /*
        Function: toString
        
        Returns a string representation of the rectangle.
        
        Returns:
            String representing rectangle
    */
    
    rectangle.toString = function () {
        return "Rectangle(" + 
              "left="     + this.left +
              ", top="    + this.top +
              ", right="  + this.right + 
              ", bottom=" + this.bottom + ")";
    };
    
    /*
        Class: Polygon
        
        Polygons represented as a sequence of points.
        
        Properties:
            points - array of points on the perimiter of the rectangle
    */
    
    var polygon = {points: []};
    
    /*
        Constructor: makePolygon
        
        Creates a new Polygon from an array of points.
        
        Returns:
            A Polygon with the specified points
    */
    
    makePolygon = function (points) {
        return webact.create(polygon, {points: points});
    };
    geometry.makePolygon = makePolygon;
    
    /*
        Function: bounds
        
        Returns a boundry rectangle containing all points in the 
        polygon.
        
        Returns:
            Rectangle containing all points
    */
    
    polygon.bounds = function () {
        var points = this.points;
        if (points.length === 0) {
            throw new Error("Invalid operation");
        }
            
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
    };
    
    /*
        Function: containsPoint
        
        Uses a point-in-polygon algorithm to determine if a specified
        point is inside the rectangle.
        
        Parameters:
            test_point - point to test
            
        Returns:
            True if the point is inside the polygon, false otherwise
    */
    
    polygon.containsPoint = function (test_point) {
        var points, cross_count, is_odd;
        points = this.points;
        cross_count = 0;
        this.forLines(this, function (line) {
            var x = line.xForY(test_point.y);
            if (x !== false && x > test_point.x) {
                cross_count += 1;
            }
        });
        
        return (cross_count % 2) !== 0;
    };
    
    /*
        Function: project
        
        Applies an affine transformation to all points in the polygon.
        
        Parameters:
            transform - affine transformation to apply
            
        Returns:
            Polygon with all points projected
    */
    
    polygon.project = function (transform) {
        var points = this.points;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            new_points.push(points[index].project(transform));
        }
        return makePolygon(new_points);
    };
    
    /*
        Function: equals
        
        Determines if two polygons have the same points in order.
        (the initial point need not be the same)
        
        Parameters:
            other - polygon to compare
            
        Returns:
            true if the polygons are equal, false otherwise
    */
    
    polygon.equals = function (other) {
        var points = this.points;
        var other_points = other.points;
        if (points.length !== other_points.length) {
            return false;
        }
        var start = 0;
        while (start < points.length && !points[0].equals(other_points[start])) {
            start += 1;
        }
        if (start === points.length) {
            return false;
        }
        for (var index = 0; index < points.length; index += 1) {
            if (!points[index].equals(other_points[(index + start) % points.length])) {
                return false;
            }
        }
        return true;
    };
    
    /*
        Function: forPoints
        
        Applies a callback function (closure) on each point in the polygon.
        
        Parameters:
            binding  - (optional) the 'this' object when executing the callback
            callback - function (point, index)
    */
    
    polygon.forPoints = function (binding, callback) {
        if (callback === undefined) {
            callback = binding;
            binding = this;
        }
        var points = this.points;
        for (var index = 0; index < points.length; index += 1) {
            callback.call(binding, points[index], index);
        }
    };
    
    /*
        Function: forLines
        
        Applies a callback function (closure) to each pair of points, or
        edge in the polygon.
        
        Parameters:
            binding  - (optional) the 'this' object when executing the callback
            callback - function (line, index)
    */
    
    polygon.forLines = function (binding, callback) {
        if (callback === undefined) {
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
    };
    
    var clipTop = function (points, boundry) { 
        var top = boundry.top;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.y >= top) {
                new_points.push(from);
            }
            if (from.y < top && to.y >= top || from.y >= top && to.y < top) {
                var x = from.x + (top - from.y) * (to.x - from.x) / (to.y - from.y);
                new_points.push(makePoint(x, top));
            }
        }       
        return new_points;
    };
    
    var clipRight = function (points, boundry) { 
        var right = boundry.right;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.x <= right) {
                new_points.push(from);
            }
            if (from.x <= right && to.x > right || from.x > right && to.x <= right) {
                var y = from.y + (right - from.x) * (to.y - from.y) / (to.x - from.x);
                new_points.push(makePoint(right, y));
            }
        }       
        return new_points;
    };
    
    var clipBottom = function (points, boundry) { 
        var bottom = boundry.bottom;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.y <= bottom) {
                new_points.push(from);
            }
            if (from.y <= bottom && to.y > bottom || from.y > bottom && to.y <= bottom) {
                var x = from.x + (bottom - from.y) * (to.x - from.x) / (to.y - from.y);
                new_points.push(makePoint(x, bottom));
            }
        }       
        return new_points;
    };
    
    var clipLeft = function (points, boundry) { 
        var left = boundry.left;
        var new_points = [];
        for (var index = 0; index < points.length; index += 1) {
            var from = points[index];
            var to = points[(index + 1) % points.length];
            if (from.x >= left) {
                new_points.push(from);
            }
            if (from.x < left && to.x >= left || from.x >= left && to.x < left) {
                var y = from.y + (left - from.x) * (to.y - from.y) / (to.x - from.x);
                new_points.push(makePoint(left, y));
            }
        }       
        return new_points;
    };
    
    /*
        Function: clip
    
        Clips the Polygon so that all points are within a boundry
        rectangle.
        
        Parameters:
            boundry - boundry rectangle to clip against
            
        Returns:
            Polygon clipped against the boundry rectangle
    */
    
    polygon.clip = function (boundry) {
        var points = this.points;
        points = clipTop(points, boundry);
        points = clipRight(points, boundry);
        points = clipBottom(points, boundry);
        points = clipLeft(points, boundry);
        
        return makePolygon(points);
    };
    
    /*
        Function: toString
        
        Returns:
            A string representation of the polygon.
    */
    
    polygon.toString = function () {
        var out = [];
        var points = this.points;
        for (var index = 0; index < points.length; index += 1) {
            out.push(points[index].toString());
        }
        return "Polygon(points=[" + points.join(", ") + "])"; 
    };
    
    /*
        Class: Transform
        
        Classic 3 x 3 matrix for affine transformations on geometric
        objects including translate, scale, and rotate.
        
        Properties:
            matrix - nine element array of Real containing matrix values
    */
    
    var transform = {matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]};
    
    /*
        Constructor: makeTransform
        
        Creates an affine transformation object from a 3 x 3 matrix.
        
        Parameters:
            matrix - 3 x 3 matrix
            
        Returns:
            Transform for specified matrix
    */
    
    var makeTransform = function (matrix) {
        return webact.create(transform, {matrix: matrix});
    };
    
    /*
        Function: compose
        
        Compose two transforms by multiplying matrices.
        
        Parameters:
            transform - Transform to compose with this one
            
        Returns:
            Combined affine transformation
    */
    
    transform.compose = function (transform) {
        var a = this.matrix;
        var b = transform.matrix;
        
        var matrix = [
            a[0] * b[0] + a[1] * b[3] + a[2] * b[6], 
            a[0] * b[1] + a[1] * b[4] + a[2] * b[7], 
            a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
            
            a[3] * b[0] + a[4] * b[3] + a[5] * b[6], 
            a[3] * b[1] + a[4] * b[4] + a[5] * b[7], 
            a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
            
            a[6] * b[0] + a[7] * b[3] + a[8] * b[6], 
            a[6] * b[1] + a[7] * b[4] + a[8] * b[7], 
            a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
        ];
        
        return makeTransform(matrix);
    };
    
    /*
        Function: inverse
        
        Compute the inverse of the matrix to reverse the transform.
        
        Returns:
            Inverse affine transformation   
    */

    transform.inverse = function () {
        var a = this.matrix;
        var det = ( 
          a[0] * a[4] * a[8] - a[0] * a[5] * a[7] - a[1] * a[3] * a[8] +
          a[1] * a[5] * a[6] + a[2] * a[3] * a[7] - a[2] * a[4] * a[6]);
        
        var matrix = [
            (a[4] * a[8] - a[5] * a[7]) / det,             
            -(a[1] * a[8] - a[2] * a[7]) / det,
            (a[1] * a[5] - a[2] * a[4]) / det,
            
            -(a[3] * a[8] - a[5] * a[6]) / det,
            (a[0] * a[8] - a[2] * a[6]) / det,
            -(a[0] * a[5] - a[2] * a[3]) / det,
            
            (a[3] * a[7] - a[4] * a[6]) / det,
            -(a[0] * a[7] - a[1] * a[6]) / det,
            (a[0] * a[4] - a[1] * a[3]) / det 
        ];
        
        return makeTransform(matrix);
    };
    
    /*
        Function: toString
        
        Returns:
            A string representation of the 3 x 3 affine transformation matrix
    */
    
    transform.toString = function () {
        var matrix = this.matrix;
        var out = [];
        for (var index = 0; index < matrix.length; index += 1) {
            out.push(matrix[index]);
        }
        return "Transform([" + out.join(", ") + "])";
    };
    
    /*
        Constructor: makeIndentity
        
        Returns:
            An identity tranformation matrix.
    */
    
    geometry.makeIdentity = function () {
        return makeTransform(transform.matrix);
    };
    
    /*
        Constructor: makeTranslate
        
        Creates an tranformation object that translates points by
        a specified x and y offset.
        
        Parameters:
            offset_x - distance to offset x
            offset_y - distance to offset y
            
        Returns:
            A Transform for translating points
    */
    
    geometry.makeTranslate = function (offset_x, offset_y) {
        return makeTransform([1, 0, offset_x, 0, 1, offset_y, 0, 0, 1]);
    };
    
    /*
        Constructor: makeScale
        
        Creates an tranformation object that scales points by
        specified x and y multipliers.
        
        Parameters:
            scale_x - multiplier for x dimension
            scale_y - multiplier for y dimension
            
        Returns:
            A Transform for scaling points
    */
    
    geometry.makeScale = function (scale_x, scale_y) {
        return makeTransform([scale_x, 0, 0, 0, scale_y, 0, 0, 0, 1]);
    };
    
    /*
        Constructor: makeRotate
        
        Creates an tranformation object that rotates points by
        specified angle.
        
        Parameters:
            radians - rotation angle in radians
            
        Returns:
            A Transform for rotating points
    */
    
    geometry.makeRotate = function (radians) {
        var cos_angle = Math.cos(radians);
        var sin_angle = Math.sin(radians);
        return makeTransform([
            cos_angle, -sin_angle,         0, 
            sin_angle,  cos_angle,         0, 
            0,          0,                 1  
        ]);
    };
    
});
 