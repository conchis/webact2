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

import Image
import os.path
from math import *
from geometry import *
from tiler import Tiler

class SampleTiler(Tiler):
   """Tiles image layers by resampling already existing tiled image layers."""
   
   def __init__(self, tiled_image):
      from tiled_image import TiledImage
      assert isinstance(tiled_image, TiledImage);
      Tiler.__init__(self, tiled_image)
      
      self.tile_path  = tiled_image.image_path
      self.background = tiled_image.background
      
   def tileLayer(self, layer_number):
      """Generate tiles for a specified layer"""
      self.pyramid = self.tiled_image.pyramid
      pyramid = self.pyramid
      scale = pyramid.scaleForLayer(layer_number)
      grid_size = pyramid.tileGridSize(layer_number)
      print "generating layer%04i: %i x %i at scale = %1.5f" % (
               layer_number, grid_size.width, grid_size.height, scale)
      for row in xrange(grid_size.height):
         for column in xrange(grid_size.width):
               self.generateTile(column, row, layer_number)
                                 
   def generateTile(self, column, row, layer_number):
      """Generate and write an image tile"""
      pyramid = self.pyramid
      tile_size = pyramid.tile_size
      tiled_image = self.tiled_image
      
      file_path = self.tiled_image.tileFilePath(column, row, layer_number)
      if os.path.exists(file_path): return
      
      source_rectangle = self.tileSourceRectangle(column, row, layer_number) 
      
      scale = pyramid.scaleForLayer(layer_number)
      width  = int(ceil(scale * (source_rectangle.right  - source_rectangle.left)))
      height = int(ceil(scale * (source_rectangle.bottom - source_rectangle.top )))
      
      name = os.path.basename(file_path)
      print "\tl%s %s: %s x %s" % (layer_number, name, width, height)
      
      scaled_tile = tiled_image.getScaledImage(source_rectangle, scale, 
                                               layer_number + 1)
      tile = Image.new("RGB", (tile_size.width, tile_size.height), self.background)
      tile.paste(scaled_tile, (0, 0))
      tile.save(file_path, "jpeg")
         
   def tileSourceRectangle(self, column, row, layer_number):
      """Return area of source image to be put on tile"""
      pyramid = self.pyramid
      tile_extent = pyramid.tileExtent(layer_number)
      left   = tile_extent.width * column
      top    = tile_extent.height * row
      right  = min(left + tile_extent.width, pyramid.image_size.width)
      bottom = min(top + tile_extent.height, pyramid.image_size.height)
      return Rectangle(left, top, right, bottom)    