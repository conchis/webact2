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
 
 webact.in_package("content", function (content) {
 
     content.makeSession = function (base_url) {
         var session = {base_url: base_url};
         
         session.load = function (path, callback) {
         }
         
         return session; 
     }
     
     // Return True only if property value is allowed
     
     var isPropertyValue = function (value) {
         switch (typeof value) {
             case "string":
             case "boolean":
             case "number":
                 return true;
             default:
                 if (value instanceof Date)
                     return true;
                 return false;
         }
     }
     
     // Copy (and check) all property values
     
     var copyProperties = function (source, destination) {
         var properties = destination || {}; 
         for (var name in source) {
             var value = source[name];
             if (!isPropertyValue(value))
                 throw new Error("Invalid property value named: " 
                     + name + ", value: " + value);
                 properties[name] = value;
             }
         }
         return properties;   
     }
     
     var copyFields = function (source, names, type, destination) {
         type = type || null;
         destination = destination || {};
         for (var index = 0; index < names.length; index += 1) {
             var name = names[index];
         }
     }
 
     var makeContent = function (options) {  
         var content = options || {};
         
         content.name = options.name;
         if (that.name == undefined || that.name == null 
                 || (typeof that.name) != "string")
             throw new Error("Unnamed content object");
             
         content.title = options.title;  
         content.description = options.description;
         content.mime_type = options.mime_type;
         content.url = options.url;
                
         content.type = options.type || "document";
                  
         content.properties = 
                 copyProperties(options.properties || {});      
         
         return content;
     }
     
     var makeDocument = function (options) {
         var document = makeContent(options);  
           
         document.isFolder = function () {
             return false;
         }
            
         return document;
     }
     
     var makeFolder = function (options) {
         var folder = makeContent(options);
         folder.expanded = options.expanded || false;
         if (options.bundled == true)
             folder.bundled = true;
             
         folder.isFolder = function () {
             return true;
         }
         
         folder.each = function (callback, binding) {
         }
         
         folder.isExpanded = function () {
             return false;
         }
         
         folder.expand = function (callback) {
         }
         
         folder.find = function (path, callback) {
         }
         
         return folder;
     }
     
     content.fromJSON = function (json_object) {
         var children = json_object["children"];
         if (children !== undefined)
             return makeFolder(json_object);
         else
             return makeDocument(json_object);
     };
      
 });
 