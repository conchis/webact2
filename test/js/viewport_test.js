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

(function () {

module("viewport_test.js");

eval(webact.imports("viewport"));
eval(webact.imports("geometry"));

test("something", function () {
    var vp = makeViewport(makeDimensions(1024, 1024), makeDimensions(128, 128));
    console.log(vp.toString());
    ok(true);
});

})();