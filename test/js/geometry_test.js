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
 
(function (_) {
 
module("geometry_test.js");

eval(webact.imports("geometry"));

// Point

test("make point", function () {
    var p1 = makePoint(3, 4);
    equal(p1.x, 3);
    equal(p1.y, 4);
    equal(p1.toString(), "(3, 4)");
});

test("point equals", function () {
    var p1 = makePoint(2, 3);
    var p2 = makePoint(2, 3);
    var p3 = makePoint(2, 4);
    var p4 = makePoint(3, 3);
  
    equal(p1.equals(p2), true);
    equal(p1.equals(p3), false);
    equal(p1.equals(p4), false);
});

test("point identity", function () {
    var identity = makeIdentity();
    var p1 = makePoint(7, 23).project(identity);
    equal(p1.x, 7);
    equal(p1.y, 23);
});

test("point translate", function () {
    var translate = makeTranslate(10, 20);
    var p1 = makePoint(1, 2).project(translate);
    equal(p1.x, 11);
    equal(p1.y, 22);
});

test("point scale", function () {
    var scale = makeScale(2, 4);
    var p1 = makePoint(2, 1).project(scale);
    equal(p1.x, 4);
    equal(p1.y, 4);
});

test("point rotate", function () {
    var rotate = makeRotate(Math.PI / 2.0);
    var p1 = makePoint(1, 0).project(rotate).round();
    ok(p1.equals(makePoint(0, 1)), p1.toString());
});

test("point pin in rectangle", function () {
    var bounds = makeRectangle(100, 100, 200, 200);
    var p1 = makePoint(0, 0).pinInRectangle(bounds);
    equal(p1.x, 100);
    equal(p1.y, 100);
    
    var p2 = makePoint(0, 500).pinInRectangle(bounds);
    equal(p2.x, 100);
    equal(p2.y, 200);
    
    var p3 = makePoint(500, 500).pinInRectangle(bounds);
    equal(p3.x, 200);
    equal(p3.y, 200);
    
    var p4 = makePoint(500, 0).pinInRectangle(bounds);
    equal(p4.x, 200);
    equal(p4.y, 100);
});

// Dimensions

test("make dimensions", function () {
    var d1 = makeDimensions(4, 10);
    equal(d1.width, 4);
    equal(d1.height, 10);
    equal(d1.toString(), "Dimensions(width=4, height=10)");
});

test("dimensions scale", function () {
    var d1 = makeDimensions(1024, 512);
    var d2 = d1.scale(0.5);
    equal(d2.width, 512);
    equal(d2.height, 256);
});

test("dimensions rectangle", function () {
    var r1 = makeDimensions(128, 64).rectangle();
    ok(makeRectangle(0, 0, 128, 64).equals(r1), r1);
});

test("dimensions polygon", function () {
    var p1 = makeDimensions(128, 64).polygon();
    equal(p1.points.length, 4);
    var r1 = p1.bounds();
    ok(makeRectangle(0, 0, 128, 64).equals(r1), r1);
});

test("dimensions equals", function () {
    var d1 = makeDimensions(2, 3);
    var d2 = makeDimensions(2, 3);
    var d3 = makeDimensions(2, 8);
    var d4 = makeDimensions(3, 3);
    
    equal(d1.equals(d2), true);
    equal(d1.equals(d3), false);
    equal(d1.equals(d4), false); 
});

// Line

test("make line 1", function () {
    var l1 = makePoint(80, 5).to(makePoint(105, 180));
    equal(l1.from_x, 80);
    equal(l1.from_y, 5);
    equal(l1.to_x, 105);
    equal(l1.to_y, 180);
});

test("make line 2", function () {
    var l1 = makePoint(80, 5).to(105, 180);
    equal(l1.from_x, 80);
    equal(l1.from_y, 5);
    equal(l1.to_x, 105);
    equal(l1.to_y, 180);
});

test("line from, to", function () {
    var l1 = makePoint(80, 5).to(105, 180);
    var p1 = l1.from();
    var p2 = l1.to();
    ok(makePoint(80, 5).equals(p1), p1);
    ok(makePoint(105, 180).equals(p2), p2);
});

test("line length", function () {
    var l1 = makePoint(0, 0).to(300, 400);
    equals(l1.length(), 500);
});

test("line bounds recangle", function () {
    var l1 = makePoint(0, 20).to(100, 105);
    var r1 = l1.bounds();
    ok(makeRectangle(0, 20, 100, 105).equals(r1), r1);
    
    var l2 = makePoint(100, 105).to(0, 20);
    var r2 = l2.bounds();
    ok(makeRectangle(0, 20, 100, 105).equals(r2), r2);
    
    var l3 = makePoint(100, 20).to(0, 105);
    var r3 = l3.bounds();
    ok(makeRectangle(0, 20, 100, 105).equals(r3), r3);
});

test("line yForX", function () {
    var l1 = makePoint(0, 0).to(100, 100);
    equal(l1.yForX(0), 0);
    equal(l1.yForX(100), 100);
    equal(l1.yForX(50), 50);
    
    equal(l1.yForX(-0.0001), false);
    equal(l1.yForX(100.0001), false);
    
    var l2 = makePoint(0, 100).to(100, 0);
    equal(l2.yForX(0), 100);
    equal(l2.yForX(100), 0);
    equal(l2.yForX(50), 50);
    
    var l3 = makePoint(100, 0).to(0, 100);
    equal(l3.yForX(0), 100);
    equal(l3.yForX(100), 0);
    equal(l3.yForX(50), 50);
    
    var l4 = makePoint(50, 10).to(50, 100);
    equal(l4.yForX(50), 10);
    equal(l4.yForX(50.0001), false);
    equal(l4.yForX(49.9999), false);
});

test("line xForY", function () {
    var l1 = makePoint(0, 0).to(100, 100);
    equal(l1.xForY(0), 0);
    equal(l1.xForY(100), 100);
    equal(l1.xForY(50), 50);
    
    equal(l1.xForY(-0.0001), false);
    equal(l1.xForY(100.0001), false);
    
    var l2 = makePoint(0, 100).to(100, 0);
    equal(l2.xForY(0), 100);
    equal(l2.xForY(100), 0);
    equal(l2.xForY(50), 50);
    
    var l3 = makePoint(100, 0).to(0, 100);
    equal(l3.xForY(0), 100);
    equal(l3.xForY(100), 0);
    equal(l3.xForY(50), 50);
    
    var l4 = makePoint(10, 50).to(100, 50);
    equal(l4.xForY(50), 10);
    equal(l4.xForY(50.0001), false);
    equal(l4.xForY(49.9999), false);
});

test("line equals", function () {
    var l1 = makePoint(0, 0).to(300, 400);
    var l2 = makePoint(5, 0).to(305, 400);
    var l3 = makePoint(300, 400).to(0, 0);
    var l4 = makePoint(0, 0).to(300, 400);
    
    ok(l1.equals(l4), l4);
    ok(!l1.equals(l2), l2);  
    ok(!l1.equals(l3), l3);      
});

// Rectangle

test("make rectangle", function () {
    var r1 = makeRectangle(0, 20, 100, 80);
    equal(r1.left, 0);
    equal(r1.top, 20);
    equal(r1.right, 100);
    equal(r1.bottom, 80);
    equal(r1.toString(), "Rectangle(left=0, top=20, right=100, bottom=80)");
    
});

test("rectangle dimensions", function () {
    var r1 = makeRectangle(0, 20, 100, 80);
    var d1 = r1.dimensions();
    equal(d1.width, 100);
    equal(d1.height, 60);
});

test("rectangle top left", function () {
    var r1 = makeRectangle(0, 20, 100, 80);
    var p1 = r1.topLeft();
    equal(p1.x, 0);
    equal(p1.y, 20);
});

test("rectangle bottom right", function () {
    var r1 = makeRectangle(0, 20, 100, 80);
    var p1 = r1.bottomRight();
    equal(p1.x, 100);
    equal(p1.y, 80);
});

test("rectangle containsPoint", function () {
    var r1 = makeRectangle(0, 0, 20, 40);
    
    var p1 = makePoint(0, 0);
    ok(r1.containsPoint(p1), p1);

    var p2 = makePoint(10, 10);
    ok(r1.containsPoint(p2), p2);
    
    var p3 = makePoint(25, 10);
    ok(!r1.containsPoint(p3), p3);   
    
    var p4 = makePoint(10, 41);
    ok(!r1.containsPoint(p4), p4);
    
    var p5 = makePoint(-1, 10);
    ok(!r1.containsPoint(p5), p5);
    
    var p6 = makePoint(10, -1);
    ok(!r1.containsPoint(p6), p6);     
});

test("rectangle intersect", function () {
    var r1 = makeRectangle(0, 0, 100, 100);
    var r2 = makeRectangle(10, -5, 90, 75);
    
    var r12 = r1.intersect(r2);
    ok(r12.equals(makeRectangle(10, 0, 90, 75)), r12);
});

test("rectangle inset", function () {
    var r1 = makeRectangle(0, 0, 100, 100);
    var r2 = r1.inset(10);
    ok(makeRectangle(10, 10, 90, 90).equals(r2), r2);
    
    var r3 = r1.inset(10, 20);
    ok(makeRectangle(10, 20, 90, 80).equals(r3), r3);    
});

test("rectangle polygon", function () {
    var r1 = makeRectangle(0, 20, 100, 80);
    var p1 = r1.polygon();
    
    var points = p1.points;
    equal(points.length, 4);
    ok(makePoint(  0, 20).equals(points[0]), points[0]);  
    ok(makePoint(100, 20).equals(points[1]), points[1]);  
    ok(makePoint(100, 80).equals(points[2]), points[2]);  
    ok(makePoint(  0, 80).equals(points[3]), points[3]);    
});

test("make rectangle width height", function () {
    var r1 = makeRectangleWidthHeight(10, 3, 80, 40);
    ok(makeDimensions(80, 40).equals(r1.dimensions()), r1);
    ok(makePoint(10, 3).equals(r1.topLeft()), r1.topLeft());
});

// Polygon

test("make polygon", function () {
    var p1 = makePolygon([
        makePoint(0, 0),     makePoint(100, 0), 
        makePoint(100, 100), makePoint(0, 100) ]);
    var points = p1.points;
    equal(points.length, 4);
    ok(makePoint(  0,   0).equals(points[0]), points[0]);
    ok(makePoint(100,   0).equals(points[1]), points[1]);
    ok(makePoint(100, 100).equals(points[2]), points[2]);
    ok(makePoint(  0, 100).equals(points[3]), points[3]);
});

test("polygon bounds", function () {
    var p1 = makePolygon([
        makePoint(-10, 0),     makePoint(100, 0), 
        makePoint(120, 100), makePoint(0, 100) ]); 
    var r1 = p1.bounds();
    equal(r1.left, -10);
    equal(r1.right, 120);
    equal(r1.top, 0);
    equal(r1.bottom, 100);   
});

test("polygon containsPoint 1", function () {
    var poly1 = makeRectangle(0, 0, 100, 100).polygon();
    
    var p1 = makePoint(0, 0);
    ok(poly1.containsPoint(p1), p1);
    
    var p2 = makePoint(50, 50);
    ok(poly1.containsPoint(p2), p2);
    
    var p3 = makePoint(-1, 50);
    ok(!poly1.containsPoint(p3), p3);

    var p4 = makePoint(50, -1);
    ok(!poly1.containsPoint(p4), p4);
});

test("polygon containsPoint 2", function () {
    var poly1 = makePolygon([
        makePoint(0, 0), makePoint(3, 2), makePoint(6, 0), 
        makePoint(6, 4), makePoint(0, 4)
    ]);
    
    var p1 = makePoint(1, 3);
    ok(poly1.containsPoint(p1), p1);
    
    var p2 = makePoint(5, 3);
    ok(poly1.containsPoint(p2), p2);
    
    var p3 = makePoint(1, 1.5);
    ok(poly1.containsPoint(p3), p3);
    
    var p4 = makePoint(-1, 1);
    ok(!poly1.containsPoint(p4), p4);    
    
    
});

test("polygon equals", function () {
    var p1 = makePolygon([makePoint( 0, 0), makePoint( 1, 1), makePoint(-1, 1)]);
    var p2 = makePolygon([makePoint( 0, 0), makePoint( 1, 1), makePoint(-1, 1)]);
    var p3 = makePolygon([makePoint( 1, 1), makePoint(-1, 1), makePoint( 0, 0)]);
    var p4 = makePolygon([makePoint(-1, 1), makePoint( 0, 0), makePoint( 1, 1)]);
    var p5 = makePolygon([makePoint( 0, 0), makePoint( 1, 1), makePoint(-1, 0)]);
    var p6 = makePolygon([makePoint( 0, 0), makePoint( 0, 1), makePoint(-1, 1)]);
    
    ok(p1.equals(p2), p2);
    ok(p1.equals(p3), p3);
    ok(p1.equals(p4), p4);
    ok(!p1.equals(p5), p5);
    ok(!p1.equals(p6), p6);
});

test("polygon clip 1", function () {
    var p1 = makePolygon([
        makePoint(0, 0), makePoint(3, 2), makePoint(6, 0), 
        makePoint(6, 4), makePoint(0, 4)
    ]);
    var r1 = makeRectangle(0, 1, 10, 11);
    var p2 = p1.clip(r1);
    ok(makePolygon([makePoint(0, 1), makePoint(1.5, 1), makePoint(3, 2), 
        makePoint(4.5, 1), makePoint(6, 1), makePoint(6, 4), makePoint(0, 4)
    ]).equals(p2), p2);
    console.log("cliped 1:", p2.toString());
});

test("polygon clip 2", function () {
    var p1 = makePolygon([
        makePoint(0, 0), makePoint(6, 0),
        makePoint(6, 6), makePoint(3, 4), makePoint(0, 6)
    ]);
    var r1 = makeRectangle(0, 0, 10, 5);
    var p2 = p1.clip(r1);
    ok(makePolygon([makePoint(0, 0), makePoint(6, 0), 
        makePoint(6, 5), makePoint(4.5, 5), makePoint(3, 4), makePoint(1.5, 5), makePoint(0, 5)
    ]).equals(p2), p2);
    console.log("cliped 2:", p2.toString());
});

test("polygon clip 3", function () {
    var p1 = makePolygon([
        makePoint(0, 0), makePoint(6, 0), makePoint(6, 6),
        makePoint(0, 6), makePoint(2, 3)
    ]);
    var r1 = makeRectangle(1, 0, 10, 10);
    var p2 = p1.clip(r1);
    ok(makePolygon([
        makePoint(1, 0), makePoint(6, 0),   makePoint(6, 6), 
        makePoint(1, 6), makePoint(1, 4.5), makePoint(2, 3), makePoint(1, 1.5)
    ]).equals(p2), p2);
    console.log("cliped 3:", p2.toString());
});

test("polygon clip 4", function () {
    var p1 = makePolygon([
        makePoint(0, 0), makePoint(6, 0), 
        makePoint(4, 3), makePoint(6, 6), makePoint(0, 6)
    ]);
    var r1 = makeRectangle(0, 0, 5, 8);
    var p2 = p1.clip(r1);
    ok(makePolygon([
        makePoint(0, 0), makePoint(5, 0), 
        makePoint(5, 1.5), makePoint(4, 3), makePoint(5, 4.5), makePoint(5, 6),
        makePoint(0, 6)
    ]).equals(p2), p2);
    console.log("cliped 4:", p2.toString());
});

test("polygon forPoints 1", function () {
    var p1 = makePolygon([makePoint(0, 0), makePoint(3, 4), makePoint(-3, 4)]);
    var points = [];
    p1.forPoints(function (p, index) {
        equal(index, points.length);
        points.push(p);
    });
    equal(points.length, 3);
    ok(makePoint( 0, 0).equals(points[0]), points[0]);
    ok(makePoint( 3, 4).equals(points[1]), points[1]);
    ok(makePoint(-3, 4).equals(points[2]), points[2]);
});

test("polygon forPoints 2", function () {
    var p1 = makePolygon([makePoint(0, 0), makePoint(3, 4), makePoint(-3, 4)]);
    var target = {me: 1};
    var points = [];
    p1.forPoints(target, function (p, index) {
        equal(this, target);
        equal(index, points.length);
        points.push(p);
    });
    equal(points.length, 3);
    ok(makePoint( 0, 0).equals(points[0]), points[0]);
    ok(makePoint( 3, 4).equals(points[1]), points[1]);
    ok(makePoint(-3, 4).equals(points[2]), points[2]);
});

test("polygon forLines 1", function () {
    var p1 = makePolygon([makePoint(0, 0), makePoint(3, 4), makePoint(-3, 4)]);
    var lines = [];
    p1.forLines(function (lx, index) {
        equal(index, lines.length);
        lines.push(lx);
    });
    equal(lines.length, 3); 
    ok(makePoint( 0, 0).to( 3, 4).equals(lines[0]), lines[0]); 
    ok(makePoint( 3, 4).to(-3, 4).equals(lines[1]), lines[1]);   
    ok(makePoint(-3, 4).to( 0, 0).equals(lines[2]), lines[2]);     
});

test("polygon forLines 2", function () {
    var p1 = makePolygon([makePoint(0, 0), makePoint(3, 4), makePoint(-3, 4)]);
    var target = {me: 2};
    var lines = [];
    p1.forLines(target, function (lx, index) {
        equal(this, target);
        equal(index, lines.length);
        lines.push(lx);
    });
    equal(lines.length, 3); 
    ok(makePoint( 0, 0).to( 3, 4).equals(lines[0]), lines[0]); 
    ok(makePoint( 3, 4).to(-3, 4).equals(lines[1]), lines[1]);   
    ok(makePoint(-3, 4).to( 0, 0).equals(lines[2]), lines[2]);     
});

// Transform

test("transform compose 1", function () {
    var t1 = makeTranslate(5, -5);
    var t2 = makeTranslate(-5, 5);
    var t3 = t1.compose(t2);
    
    var p1 = makePoint(3, 4).project(t3);
    equal(p1.x, 3);
    equal(p1.y, 4);
});

test("transform compose 2", function () {
    var t1 = makeScale(10, 10);
    var t2 = makeRotate(Math.PI / 2);
    var t3 = t1.compose(t2);
    
    var p1 = makePoint(1, 0).project(t3).round();
    ok(p1.equals(makePoint(0, 10)), p1.toString());    
});

test("transform inverse 1", function () {
    var t1 = makeTranslate(5, -5);
    var t2 = t1.inverse();
    var p1 = makePoint(3, 4).project(t1).project(t2).round();
    ok(p1.equals(makePoint(3, 4)), p1.toString());  
});

test("transform inverse 2", function () {
    var t1 = makeScale(10, 0.5);
    var t2 = t1.inverse();
    var p1 = makePoint(4, 1).project(t1).project(t2).round();
    ok(p1.equals(makePoint(4, 1)), p1.toString());  
});

test("transform inverse 3", function () {
    var t1 = makeRotate(Math.PI / 5);
    var t2 = t1.inverse();
    var p1 = makePoint(4, 1).project(t1).project(t2).round();
    ok(p1.equals(makePoint(4, 1)), p1.toString());
});

}) ();
