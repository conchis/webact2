# Copyright 2009, 2010, 2011 Northwestern Univrsity and Jonathan A. Smith
# Licensed under the Educational Community License, Version 2.0 (the "License"); 
# you may not use this file except in compliance with the License. You may
# obtain a copy of the License at
#
# http://www.osedu.org/licenses/ECL-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
# or implied. See the License for the specific language governing
# permissions and limitations under the License.
#
# Author: Jonathan A, Smith

from math import *
import xml.dom, xml.dom.minidom
from geometry import Dimensions


class ImageInformation:
   """Tiled image information - converted to and from XML"""
      
   def __init__(self):
      self.layer_count = 0
      self.resolution_multiplier = sqrt(2)
      self.bgcolor = 0xFFFFFF
      self.image_size = Dimensions(0, 0)
      self.tile_size = Dimensions(255, 255)
   
   def initializeFrom(self, document):
      """Initializes ImageInformation by parsing an XML document"""
      image_element = document.documentElement
      assert isinstance(image_element, xml.dom.minidom.Element)
      assert image_element.tagName == "ppad:tiled-image"
      self.layer_count = int(image_element.getAttribute("layers"))
      self.resolution_multiplier = float(
         image_element.getAttribute("resolution_multiplier"))
      self.bgcolor = eval(image_element.getAttribute("bgcolor"))
      self.initializeDimensions(image_element)
      
   def initializeDimensions(self, element):
      """Initialize tile_size and image_size from dimensions elements"""
      for child in element.childNodes:
         if (isinstance(child, xml.dom.minidom.Element) and
             child.tagName == "ppad:dimensions"):
            property = child.getAttribute("property")
            if property == "image_size":
               self.image_size = self.parseDimensions(child)
            elif property == "tile_size":
               self.tile_size = self.parseDimensions(child)
               
   def parseDimensions(self, element):
      """Returns Dimensions from an XML represenation"""
      width  = int(element.getAttribute("width"))
      height = int(element.getAttribute("height"))
      return Dimensions(width, height)
      
   def toXML(self):
      """Returns an XML document describing this coordinate system"""
      implementation = xml.dom.getDOMImplementation()
      document = implementation.createDocument(
         "http://dewey.at.northwestern.edu/ppad-defs.xml#", 
         "ppad:tiled-image", None)
      element = document.documentElement
      element.setAttribute("xmlns:ppad",
                           "http://dewey.at.northwestern.edu/ppad-defs.xml#")
      element.setAttribute("tile_format", "jpg")
      element.setAttribute("layers", str(self.layer_count))
      element.setAttribute("resolution_multiplier",
                           str(self.resolution_multiplier))
      element.setAttribute("bgcolor", "0x%X" % self.bgcolor)
      
      self.generateSizeXML(document, element)
      self.generateTileXML(document, element)
      self.generateTransformXML(document, element)
      
      return document
         
   def generateSizeXML(self, document, element):
      """Generate XML for image dimensions"""
      size_element = document.createElement("ppad:dimensions")
      element.appendChild(size_element)
      size_element.setAttribute("property", "image_size")
      size_element.setAttribute("width", str(self.image_size.width))
      size_element.setAttribute("height", str(self.image_size.height))
      
   def generateTileXML(self, document, element):
      """Generate XML for tile dimensions"""
      tile_element = document.createElement("ppad:dimensions")
      element.appendChild(tile_element)
      tile_element.setAttribute("property", "tile_size")
      tile_element.setAttribute("width", str(self.tile_size.width))
      tile_element.setAttribute("height", str(self.tile_size.height)) 
      
   def generateTransformXML(self, document, element):
      """Generate XML for transform matrix"""
      transform_element = document.createElement("ppad:transform")
      element.appendChild(transform_element)
      transform_element.setAttribute("property", "transform")
      transform_element.appendChild(
         document.createTextNode("\n\t1 0 0\n\t0 1 0\n\t0 0 1\n"))