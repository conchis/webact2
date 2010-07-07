(function () {

module("observers_test.js");

eval(webact.imports("observers"));

test("make broadcaster", function () {
	var b = makeBroadcaster();
	var caught = false;
	b.addListener("onChange", function () { caught = true; });
	ok(!caught, "!caught");
	b.broadcast("onChange");
	ok(caught, "caught");
});

test("method_call", function () {
	var caught = false;
	
	var listener = {
	    caught: false,
	    
	    onChange: function () {
		    this.caught = true;
	    }
	};

	var b = makeBroadcaster();
	b.addListener("onChange", listener);

	ok(!listener.caught, "!caught");

	b.broadcast("onChange");
	ok(listener.caught, "caught");
});

test("named_method_call", function () {
    var listener = {
        caught: false,
        
        respond: function () {
    	    this.caught = true;
        }
    };
	var b = makeBroadcaster();
	b.addListener("onChange", listener, "respond");

	ok(!listener.caught, "!caught");

	b.broadcast("onChange");
	ok(listener.caught, "caught");
});

test("has listener / remove listener", function () {
	var caught = false;
	var fn = function () { caught = true; };

	var b = makeBroadcaster();
	b.addListener("onChange", fn);

	ok(b.hasListener("onChange", fn), "has");

	b.removeListener("onChange", fn);

	ok(!b.hasListener("onChange", fn), "!has");
});

})();