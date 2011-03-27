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
 
 webact.in_package("category_tree", function (category_tree) {
 
 	eval(webact.imports("controls"));
 
	category_tree.makeCategoryTree = function (options) {
		 
	 	var control = makeControl(options);
	 	
	 	var model = options.model;
	 	
	 	var selected = null;
	 	
	 	control.class_name = "CategoryTree";
	 	
		var toggleItem = function () {
			var item = jQuery(this).parent();
			if (item.hasClass("wa_ctree_close")) {
				item.removeClass("wa_ctree_close");
				item.addClass("wa_ctree_open");
			}
			else if (item.hasClass("wa_ctree_open")) {
				item.removeClass("wa_ctree_open");
				item.addClass("wa_ctree_close");
			}
			else if (item.hasClass("wa_ctree_selected")) {
				item.removeClass("wa_ctree_selected");
				selected = null;
			}
			else {
				if (selected)
					selected.removeClass("wa_ctree_selected");
				item.addClass("wa_ctree_selected");
				selected = item;
			}
		}
	 	
	 	var generateItem = function (container, node) {
	 		var children = node.getChildren();
	 		
	 		// Create item, attach node
	 		var css_class = 
	 			(children.length == 0) ? "wa_ctree_item" : "wa_ctree_open";	
			var item = jQuery("<li/>", { "class": css_class });
			container.append(item);
			item.data("_node", node);
						
			// Create label
			var label = jQuery("<span/>", {
				text: node.getTitle(), 
				"class": "wa_ctree_label",
				click: toggleItem
			});
			item.append(label);
			label.addClass("wa_ctree_" + Math.min(node.depth(), 5));
			
			generateList(item, children);	 		
	 	}
	 	
	 	var generateList = function (container, children) {
	 		if (children.length == 0) return;
	 		var list_element = jQuery("<ul/>", {"class": "wa_ctree_list"})
	 		container.append(list_element);
			for (var index = 0; index < children.length; index += 1)
				generateItem(list_element, children[index]);
//			list_element.sortable({
//				connectWith: ".wa_ctree_list",
//				axis: "y",
//				receive: function (event, ui) { 
//					var element = jQuery(ui.item);
//					var node = element.data("_node");
//					console.log(node.getTitle()); 
//					
//					var parent_element = element.parent().parent();
//					var parent = parent_element.data("_node"); 
//					console.log(parent.getTitle());
//				}
//			});
				
			list_element.sortable({
				connectWith: ".wa_cselect_categories", 
				scroll: false, 
				axis: "y",
				helper: "clone",
				appendTo: "body"});	 		
	 	}
	 	
	 	control.generate = function (container) {
	 		var dom_element = jQuery("<div/>", {
	 			id: this.getId(),
	 			"class": "wa_ctree"
	 		});
	 		container.append(dom_element);
	 		generateList(dom_element, model.getChildren());
	 		return dom_element;
	 	}
	 	
	 	return control;
	 }
 
 });