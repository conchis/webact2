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

import os, os.path, xml.dom
import Image
from math import *
from geometry import *
from image_information import ImageInformation
from pyramid import Pyramid

from source_tiler import SourceTiler
from sample_tiler import SampleTiler

IMAGE_TEMPLATE = "tile%04in%04i.jpg"
LAYER_TEMPLATE = "layer%04i"

class TiledImage(ImageInformation):
   """Represents a tiled image on disk."""
   
   @classmethod
   def fromDirectory(self, image_path):
      """Creates ImageInformation by reading an XML file."""
      
      contents_path = os.path.join(image_path, "contents.xml")
      contents_file = open(contents_path, "r")
      contents_document = xml.dom.minidom.parse(contents_file)
      contents_file.close()
      
      tiled_image = TiledImage(image_path)
      tiled_image.initializeFromXML(contents_document)
      return tiled_image
   
   @classmethod
   def fromSourceImage(self, source_path, image_path = None):
      
      # If no image_path specified, use default
      if image_path == None:
        (directory, file_name) = os.path.split(source_path)
        (name, ext) = os.path.splitext(file_name)
        image_path = os.path.join(directory, "_images", name)
        
      # Create and initialize image from source image
      tiled_image = TiledImage(image_path)
      tiled_image.initializeFromSource(source_path)
      return tiled_image
   
   def __init__(self, image_path):
      ImageInformation.__init__(self)
      self.image_path = image_path
      self.background = (255, 255, 255)
      
   def initializeFromXML(self, document):
      """Initialize this tiled image from a contents.xml document"""
      ImageInformation.initializeFrom(self, document)
      self.pyramid = Pyramid(self.image_size)
      
   def initializeFromSource(self, source_path):
      """Initialize this image from a source image: tiling the image"""
      source_tiler = SourceTiler(self, source_path)
      image_size = source_tiler.getImageSize()
      
      self.image_size = image_size
      self.pyramid = Pyramid(image_size)
      self.layer_count = self.pyramid.layer_count
      self.generateContentsXML()
   
      sample_tiler = SampleTiler(self)
      
      layer_count = self.layer_count
      for layer_number in xrange(layer_count - 1, -1, -1):
         if layer_number >= (layer_count - 2):
            source_tiler.tileLayer(layer_number)
         else:
            sample_tiler.tileLayer(layer_number)
            
      self.generateThumbnail()
      self.copyResources()
      
   def generateContentsXML(self):
      """Write a contents.xml file with a description of the image"""
      document = self.toXML()
      if not os.path.exists(self.image_path):
         os.makedirs(self.image_path)
      contents_file = os.path.join(self.image_path, "contents.xml")
      out = open(contents_file, "w")
      print >>out, document.toxml("UTF-8")
      out.close()
      
   def generateThumbnail(self):
      """Generate an image thumbnail"""
      image_size = self.image_size
      scale = 150.0 / image_size.width
      thumbnail_height = scale * image_size.height
      bounds = Rectangle(0, 0, image_size.width - 1, image_size.height - 1)
      thumbnail = self.getScaledImage(bounds, scale)
      thumbnail_file = os.path.join(self.image_path, "thumbnail.jpg")
      thumbnail.save(thumbnail_file, "jpeg")
      
   def copyResources(self):
      """Copy resources into the image folder"""
      resource_folder = os.path.join(os.path.curdir, "resources")
      for name in os.listdir(resource_folder):
         print "installing %s" % name
         in_file = open(os.path.join(resource_folder, name), "r")
         data = in_file.read()
         in_file.close
         out = open(os.path.join(self.image_path, name), "w")
         out.write(data)
         out.close()
      
   def getScaledImage(self, request_area, scale, layer_number = None):
      """Get an image covering the request_area at a specified scale."""
      assert isinstance(request_area, Rectangle)
      pyramid = self.pyramid
      if layer_number == None:
         layer_number = pyramid.layerForScale(scale)
      
      tile_section = self.getTileSection(request_area, layer_number)
      tile_section = self.cropTileSection(tile_section, request_area, layer_number) 
      
      result_width  = int(ceil((request_area.right  - request_area.left) * scale))
      result_height = int(ceil((request_area.bottom - request_area.top ) * scale))
      
      return tile_section.resize((result_width, result_height), Image.ANTIALIAS)
      
   def getTileSection(self, request_area, layer_number):
      """Return an image on tile boundries that covers a requested area."""
      pyramid = self.pyramid
      tile_size = pyramid.tile_size
            
      left_column  = pyramid.tileColumn(request_area.left,   layer_number)
      right_column = pyramid.tileColumn(request_area.right,  layer_number)
      top_row      = pyramid.tileRow   (request_area.top,    layer_number)
      bottom_row   = pyramid.tileRow   (request_area.bottom, layer_number)
      
      tile_size = pyramid.tile_size
      section_width  = ((right_column - left_column + 1) * tile_size.width )
      section_height = ((bottom_row   - top_row     + 1) * tile_size.height)
      section_size = (section_width, section_height)
      section_image = Image.new("RGB", section_size, self.background)
      
      for row in xrange(top_row, bottom_row + 1):
         for column in xrange(left_column, right_column + 1):
            tile_image = self.getTileImage(column, row, layer_number)
            paste_left = (column - left_column) * tile_size.width
            paste_top  = (row - top_row) * tile_size.height
            section_image.paste(tile_image, (paste_left, paste_top))

      return section_image
   
   def cropTileSection(self, section, request_area, layer_number):
      """Crop section image (at a specified layer) to fit the request area."""
      pyramid = self.pyramid
      scale = pyramid.scaleForLayer(layer_number)
      tile_size = pyramid.tile_size
      left   = int(round(request_area.left * scale)) % tile_size.width
      top    = int(round(request_area.top  * scale)) % tile_size.height
      right  = left + int(round((request_area.right  - request_area.left) * scale))
      bottom = top  + int(round((request_area.bottom - request_area.top ) * scale))
      return section.crop((left, top, right, bottom))
      
   def getTileImage(self, column, row, layer_number):
      """Return a tile for a specified column, row, and layer number"""
      tile_path = self.tileFilePath(column, row, layer_number)
      return Image.open(tile_path)
      
   def tileFilePath(self, column, row, layer_number):
      """Returns a file path string with the file name for a specific tile"""
      layer_name = LAYER_TEMPLATE % layer_number
      file_name = IMAGE_TEMPLATE % (row, column)        
      path = os.path.join(self.image_path, layer_name, file_name)
      directory = os.path.dirname(path)
      if not os.path.exists(directory):
         os.makedirs(directory)  
      return path