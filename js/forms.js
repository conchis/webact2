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
 
 webact.in_package("forms", function (forms) {
 
    eval(webact.imports("controls"));
    
    // Class Form
    
    forms.makeForm = function (options) {
    
        var form = makeControl(options);
        form.class_name = "Form";
        
        // Item that last displayed a message
        var marked_item = null;
    
        form.generate = function (container) {
            var dom_element = jQuery("<form/>", {"class": "wa_form"});
            container.append(dom_element);
            dom_element.data("_form", this);
            return dom_element;
        }
        
    	// *** Navigation
        
        // Executes a callback for each form item that has generated html
        // anywhere in the form's dom_element.
        
        form.eachItem = function (callback, binding) {
            binding = binding || form;
            var count = 0;
            this.dom_element.find("*").each(function (index, element) {
                var item = jQuery(element).data("_item");
                if (item) {
                    callback.apply(binding, [item, count]);
                    count += 1;
                }
            });
        }
           
        // *** Data
        
        // Set data in form items.
        
        form.setData = function (data) {
            this.eachItem(function (item, index) {
                var field = item.field;
                if (field)
                    item.set(data[field]);
            });
        }
        
        // Get and return all item values. Provide a 'data' object if values 
        // are to be set in that object.
        
        form.getData = function (data) {  
            data = data || {};          
            this.eachItem(function (item, index) {
                var field = item.field;
                if (field)
                    data[field] = item.get();
            });
            return data;
        }
        
        // *** Messages
        
    	// Finds the item in this form that is marked as the message item.
        
        var getMessageItem = function () {
            var message_element = jQuery(".wa_form_message", this.dom_element);
            if (message_element.length > 0)
                return message_element.data("_item");
            else
                throw new Error("Program error: message item not found.");
        }
        
        // Displays a message, and mark the form item that initiated the
        // message.
        
        form.display = function (item, message) { 
            if (marked_item != null)
                marked_item.mark();
            var message_item = getMessageItem();
            marked_item = item;
            if (message_item != null) {
                message_item.display(message);
                item.mark(true);
            }
        }
        
        // Clear the message and item mark.
        
        form.clearDisplay = function () { 
            if (marked_item != null)
                marked_item.mark();
            marked_item = null;
            var message_item = getMessageItem();
            if (message_item != null)
                message_item.clear();
        }
        
        // *** Validation
        
        // Validate all form items. Returns true only if all items
        // are valid.
        
        form.validate = function () {
            form.clearDisplay();
            var status = true;
            form.eachItem(function (item, index) {
                status  = status && item.validate();
            });
            return status;
        }
        
        // *** Submit / Cancel
        
        // Called when the form is submitted. Typically called by a SubmitItem.
        
        form.submit = function () {
            if (form.validate())
                form.broadcast("submit");
            else
                form.broadcast("invalid");
        }
        
        // Called when the form is canceled.
        
        form.cancel = function () {
            this.broadcast("canceled");
        }
             
        return form;
    }
    
    // Class FormItem - base class of controls that are nested in a Form
    
    var makeFormItem = function (options) {
        var item = makeControl(options);
        item.class_name = "FormItem";
 
        var label    = options["label"]  || null;
        var title    = options["title"]  || null;
        var allowed  = options["allow"]  || null;
        var accept   = options["accept"] || null;
        var check    = options["check"]  || null;
        
        var required = options["required"]; 
        if (required === undefined) required = true;
        
        item.field = options["field"];
		if (item.field == null && item.label != null)
		  this.field = label.toLowerCase();
    		  
        var form = null;
        var mark_element = null;
        var value = null;
        
        // *** Navigation
        
        // Find the form that contains this item. Note that the value
        // is cached, so it is found once.
        
        item.getForm = function () {
            if (form != null)
                return form;
            var examine = this.dom_element;
            while (examine.length > 0) {
                var data = examine.data("_form");
                if (data != null) {
                    form = data;
                    return form;
                }
                examine = examine.parent();
            }
        }
        
        // *** Values
        
        // Checks, and if value is allowed, sets the value of the item.
        
        item.set = function (new_value) {
            var prior_value = value;
            if (new_value != prior_value && this.allow(new_value)) {
                this.value = new_value;
                this.update();
                this.broadcast("changed", this.value, prior_value);
                return true;
            }
            else {
                this.update();
                return false;
            }
        }
        
        // Returns the value of the item.
        
        item.get = function () { return this.value; }
        
        // Determines if a value is allowed as a value of this item. The set
        // method replaces the item's value only if allow(value) returns true.
        
        item.allow = function (new_value) {
            return allowed == null || allowed(new_value);
        }
        
        // *** HTML Generation
        
        // Overrides the method that creates a dom element. Accociates this
        // control with the HTML element generated by this control.
        
        item.createDomElement = function (parent_element) {
            var dom_element = this.base(parent_element);
            dom_element.data("_item", this);
            return dom_element;       
        }
        
        // Genertes HTML for a form label.
    	
    	item.generateLabel = function (dom_element) {
            var id = this.getId(); 
            if (label != null) {
                var label_element = jQuery("<label/>", {
                    text: label + ":", 
                    "for": id, 
                    "class": "wa_form_label"
                });
                if (title != null)
                    label_element.attr("title", title);
                dom_element.append(label_element);
            }
    	}
    	
    	// Generates HTML needed to display a "mark" associated with an
    	// object (typically when the value is invalid.)
    	
    	item.generateMark = function (dom_element) {
            this.mark_element = jQuery("<span/>", {"class": "wa_form_mark"});
            dom_element.append(this.mark_element);
    	}
    	
    	// *** Messages and Marks
    	
        // Display a message to the user via this item's form.
        
        item.say = function (text) {
            var form = this.getForm();
            form.display(this, text);
        }
        
        // Mark this item for user attention
    	
        item.mark = function (is_marked) {
            is_marked = is_marked || false;
            if (mark_element) {
                if (is_marked)
                    mark_element.html("&larr;");
                else
                    mark_element.empty();
            }
        }
        
        // *** Validation
        
        // Determines if the item is present if required. Displays a message
        // if the value is missing.
        
         var checkRequired = function () {
            if (!required) 
                return true;
            var value = item.get();
            if (value == null || value == "") {
                item.say(label + " is required");
                return false;
            }
            return true;
        }
        
        // Determines if the current value is valid by calling an 
        // accept function (typically a regular expression).
        
        var checkAccept = function () {
            var accept = this.accept;
            if (accept == null)
                return true;
            var value = this.get();
            if (!accept(value)) {
                this.say("Invalid value: " + value);
                return false;
            }
            return true;
        }
        
        // Override checkValue to add additional validation criteria.
            
        item.checkValue = function () {
            return true;
        }
        
        // Validate the value of this control.
        
        item.validate = function () {
            if (!item.checkValue())
                return false;
            if (!checkRequired())
                return false;
            if (!checkAccept())
                return false;
            return true;
        }
        
        // *** Update
        
        item.update = function () {
            throw new Error("Implement in subclasses: update");
        }
            
        return item;
    }
    
    // Class MesageItem -- Displays error messages to user.
    
    forms.makeMessageItem = function (options) {
        var item = makeFormItem(options);
        item.class_name = "MessageItem";
        
        item.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_form_message"
            });
            container.append(dom_element);
            dom_element.data("_message", this);           
            return dom_element;
        }
        
        item.display = function (message) {
            this.dom_element.text(message);
        }
        
        item.clear = function () {
            this.dom_element.empty();
        }
        
        item.update = function () {};
        
        return item;
    }
    
    forms.makeSubmitItem = function (options) {
        var item = makeFormItem(options);
        item.class_name = "SubmitItem";
        
        var label = options["label"] || "Save";
        var cancel = options["cancel"] != undefined ? options["cancel"] : true;
            
        var submit = function () {
            item.getForm().submit();
        }
        
        var cancel = function () {
            item.getForm().cancel();
        }
        
        item.generate = function (container) {
            var dom_element = jQuery("<div/>", {
                "class": "wa_form_submit"
            });
            container.append(dom_element);
            
            if (cancel) {
                var cancel_button = makeButton({label: "Cancel"});
                cancel_button.addListener("changed", cancel);
                cancel_button.create(dom_element);
            }
        
            var submit_button = makeButton({label: label});
            submit_button.addListener("changed", submit);
            submit_button.create(dom_element);
            
            return dom_element;
        }
        
        item.update = function () {};
        
        return item;
    }
    
    // Class TextItem -- Text input and areas
    
    forms.makeTextItem = function (options) {
        var item = makeFormItem(options);
        item.class_name = "TextField";
        
        var label = options["label"] || null;    
        var title = options["title"] || null;
        var rows  = options["rows"]  || 1;
        
        var input_field = null;
        
    	// *** Respond to changes
    	
    	// Called when the item's value changes. Sets a new value if it is
    	// allowed.
    	
    	var onChanged = function () {
            item.set(input_field.val());
    	}
    	
    	// Called when the item's field looses focus.
    	
    	var onBlur = function () {
    	   item.set(input_field.val()); 
    	   item.validate();  
    	}
    	
    	// *** Generate HTML
        
    	var generateInput = function (dom_element) {
            var id = item.getId();
            input_field = jQuery("<input/>", {
                type: "text", 
                "class": "wa_form_text_field",
                "name": id
            });
            if (title != null)
                input_field.attr("title", title);
            dom_element.append(input_field);
            input_field.keyup(onChanged);
            input_field.blur(onBlur);
    	}
    	
    	var generateTextArea = function (dom_element) {
            var id = item.getId(); 
            input_field = jQuery("<textarea/>", { 
                "class": "wa_form_text_area",
                "rows": rows,
                "name": id
            });
            if (title != null)
                input_field.attr("title", title);
            dom_element.append(input_field);
            input_field.keyup(onChanged);
            input_field.blur(onBlur);    	
        }
        
    	item.generate = function (container) {
    	   var dom_element = jQuery("<div/>", {
    	       "class": "wa_form_text"
    	   });
    	   container.append(dom_element);
    	   dom_element.data("_item", this);
    	
            item.generateLabel(dom_element);    
            if (rows > 1)
                generateTextArea(dom_element);
            else
                generateInput(dom_element);
            item.generateMark(dom_element);
            return dom_element;
    	}
    	
    	// ** Updates
    	
    	// Updates the form item;s field value.
    	
    	item.update = function () {
    	   input_field.val(item.get());
    	}
    	
    	return item;
    }
 
 });