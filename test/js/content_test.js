/**
 * Copyright 2010 Jonathan A. Smith.
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
 * @version 1 August 2010
 */
 
(function (_) {
 
module("content_test.js");

eval(webact.imports("content"));

test("document from json", function () {
    var d1 = fromJSON({name: "d1"});
    ok(!d1.isFolder(), "should be false");
});

test("folder from json", function () {
    var d2 = fromJSON({name: "d2", children: []});
    ok(d2.isFolder(), "should be true");
});

})();