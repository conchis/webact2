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
    File: observers.js
    
    Implements the observer pattern so as to support MVC architecture
    for JavaScript client applications.
*/

webact.in_package("observers", function (observers) {

    // Borrowing the slice method for function arguments
    
    var slice = Array.prototype.slice;
    
    /*
        Class: MixinBroadcaster
    
        Mixes in broadcaster parts. This implementation of the observer pattern 
        is designed to allow a listener to relay a broadcast to other listeners.
    */
    
    observers.mixinBroadcaster = function (self) {
    
        var listener_map = {};
        
        /*
            Function: addListener
    
            Adds a listener associated with a specified selector and listener
            method. The listener argument may be either a function to be called
            when a broadcast is received, or an object. If the listener argument
            is an object, a broadcast will cause the named method to be called
            on the object. If no method_name is specified, a method with the same
            same as the selector will be called.
            
            Parameters:
                selector - identifies broadcasts that are to be listened to
                listener - object to receive broadcasts or function to invoke
                method_name - (optional) name of method to call on listener object
        */
    
        self.addListener = function (selector, listener, method_name) {
            // Get listeners array for the selector. If none found,
            // create a new one.
            var listeners = listener_map[selector];
            if (listeners === undefined) {
                listeners = [];
                listener_map[selector] = listeners;
            }
    
            // Add listener function
            if (typeof(listener) === "function") {
                listeners.push(listener);
            }
            else {
                if (method_name === undefined) {
                    method_name = selector;
                }
                listeners.push(function () {
                    listener[method_name].apply(listener, arguments);
                });
            }
        };
        
        /*
            Function: removeListener
    
            Removes a specified listener.
            
            Parameters:
                select   - selector of listener
                listener - listener object or function
                
            Returns:
                True if listener removed, false otherwise.
        */
    
        self.removeListener = function (selector, listener) {
        
            var listeners = listener_map[selector];
            if (listeners === undefined) {
                return false;
            }
    
            var index = listeners.indexOf(listener);
            if (index < 0) {
                return false;
            }
    
            listeners.splice(index, 1);
            return true;
        };
        
        /*
            Function hasListener
            Returns:
                True if self has the specified listener, false otherwise.
        */
    
        self.hasListener = function (selector, listener) {
            // Get listeners for selector
            var listeners = listener_map[selector];
            if (listeners === undefined) {
                return false;
            }
    
            // Find listener in array
            return listeners.indexOf(listener) >= 0;
        };
        
        /*
            Function: sendBroadcast
            
            Broadcasts a message to all listeners by calling a designated function.
            The broadcaster identifies the selector used to select the listeners
            that should receive the broadcast. A broadcast may be sent with an
            array of arguments that are to be passed to each listener function.
            
            Parameters:
                selector      - indentifies the broadcast
                argument_list - (optional) array of arguments to pass to listener functions
                source        - (optional) original source of broadcast
        */
    
        self.sendBroadcast = function (selector, argument_list, source) {
            // Set default source
            if (source === undefined) {
                source = this;
            }
    
            // Inform listeners for the specified selector
            var listeners = listener_map[selector];
            if (listeners === undefined) {
                return;
            }
            
            var listener_arguments = argument_list.slice();
            listener_arguments.push(source);
            for (var index = 0; index < listeners.length; index += 1) {
                listeners[index].apply(null, listener_arguments);
            }
        };
        
        /*
            Function: broadcast
    
            Broadcasts a message to all listeners. Unlike sendBroadcast, any
            arguments that are to be passed to listener functions are passed
            directly to the broadcast method.
            
            Parameters:
                selector - indentifies the broadcast
                ...      - arguments to pass to listener functions
        */
    
        self.broadcast = function (selector) { // Other arguments            
            self.sendBroadcast(selector, slice.call(arguments, 1));
        };
    
    };
    
    /*
        Class: Broadcaster
    
        A class (non-mixin) version of the MixinBroadcaster
    */
    
    observers.makeBroadcaster = function () {
        var self = {};
        observers.mixinBroadcaster(self);
        return self;
    };
    
});