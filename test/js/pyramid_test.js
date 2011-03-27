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
 
module("pyramid_test.js");

eval(webact.imports("pyramid"));
eval(webact.imports("geometry"));

var approx = function (value, expected, digits) {
    var digits = digits || 6;
    var multiplier = Math.pow(10, digits);
    value = Math.round(value * multiplier) / multiplier;
    expected = Math.round(expected * multiplier) / multiplier;
    equal(value, expected);
}

test("layers", function () {
    var p1 = makePyramid(8 * 256, 8 * 256);
    equal(p1.layers(), 7);
});

test("layerForScale", function () {
    var p = makePyramid(8 * 256, 8 * 256);
    
    equal(p.layerForScale(1),     6);
    equal(p.layerForScale(1/2),   4);
    equal(p.layerForScale(1/4),   2);
    equal(p.layerForScale(1/8),   0);
    
    equal(p.layerForScale(0.90),  6);
    equal(p.layerForScale(0.72),  6);
    equal(p.layerForScale(0.70),  5);
    
    equal(p.layerForScale(1/8.1), 0);
    equal(p.layerForScale(1/32),  0);
});

test("scaleForLayer", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    approx(p.scaleForLayer(6), 1);
    approx(p.scaleForLayer(4), 1/2);
    approx(p.scaleForLayer(2), 1/4);
    approx(p.scaleForLayer(0), 1/8);
});

test("tileExtent", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    equal(p.tileExtent(6), 256);
    equal(p.tileExtent(4), 512);
    equal(p.tileExtent(2), 1024);
});

test("tileGridSize", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    ok(makeDimensions(8, 8).equals(p.tileGridSize(6)), 8);
    ok(makeDimensions(4, 4).equals(p.tileGridSize(4)), 4);
    ok(makeDimensions(2, 2).equals(p.tileGridSize(2)), 2);
});

test("tileSourceRectangle", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    ok(makeRectangleWidthHeight(0, 0, 256, 256).equals(
    	    p.tileSourceRectangle(0, 0, 6)), "R1");
    ok(makeRectangleWidthHeight(512, 512, 512, 512).equals(
    	    p.tileSourceRectangle(1, 1, 4)), "R2");
    ok(makeRectangleWidthHeight(2048, 2048, 1024, 1024).equals(
    	    p.tileSourceRectangle(2, 2, 2)), "R3");    
});

test("tileColumn", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    equal(p.tileColumn(0, 6),           0);
    equal(p.tileColumn(255, 6),         0);
    equal(p.tileColumn(256, 6),         1);
    equal(p.tileColumn(8 * 256 - 1, 6), 7);
    
    equal(p.tileColumn(0, 4),           0);
    equal(p.tileColumn(2 * 256 - 1, 4), 0);
    equal(p.tileColumn(2 * 256 + 1, 4), 1);
    equal(p.tileColumn(8 * 256 - 1, 4), 3);
});

test("tileRow", function () {
    var p = makePyramid(8 * 256, 8 * 256);

    equal(p.tileRow(0, 6),           0);
    equal(p.tileRow(255, 6),         0);
    equal(p.tileRow(256, 6),         1);
    equal(p.tileRow(8 * 256 - 1, 6), 7);
    
    equal(p.tileRow(0, 4),           0);
    equal(p.tileRow(2 * 256 - 1, 4), 0);
    equal(p.tileRow(2 * 256 + 1, 4), 1);
    equal(p.tileRow(8 * 256 - 1, 4), 3);
});

test("loadPyramid", function () {
    expect(3);
    stop();
    loadPyramid("_images/boston1888", function (p) {
        start();
        equal(p.width, 8672);
        equal(p.height, 10761);
        equal(p.layers(), 12);
    });
});


}) ();