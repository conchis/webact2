(function (_) {

module("paths_test.js");

var paths = webact.paths;

test("join1", function () {
    equals(paths.join("one", "two", "three"), "one/two/three");
    equals(paths.join("one/", "two/", "three"), "one/two/three");
    equals(paths.join("/one", "two/", "three"), "/one/two/three");
    equals(paths.join("/", "one", "two/", "three"), "/one/two/three");
    equals(paths.join("", "one", "two/", "three"), "/one/two/three");
});

test("split1", function () {
    equals(paths.split("one/two/three"), "one,two,three");
    equals(paths.split("one/two/three").length, 3);
    equals(paths.split("/one/two/three"), ",one,two,three");
    equals(paths.split("/one/two/three").length, 4);
});

test("normalize", function () {
    equals(paths.normalize("/one/two/three"), "/one/two/three");
    equals(paths.normalize("/one//two/three"), "/one/two/three");
    equals(paths.normalize("//one//two//three"), "//one/two/three");
    equals(paths.normalize("one/two/three"), "one/two/three");
    equals(paths.normalize("one/two/three/"), "one/two/three");
});

})();
