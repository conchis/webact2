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
from geometry import Dimensions

class Pyramid:
    """Coordinate model of a tiled image."""

    def __init__(self, image_size, tile_size=Dimensions(256, 256), 
                 resolution_multiplier=sqrt(2)):
        """Initializes a Pyramid model."""
        self.image_size = image_size
        self.tile_size = tile_size
        self.resolution_multiplier = resolution_multiplier
        self.initializeLayerCount()
        
    def initializeLayerCount(self):
        """Computes the number of layers in an image pyramid"""
        image_size = self.image_size
        tile_size = self.tile_size
        log_multiplier = log(self.resolution_multiplier)
        width_layers = (log(image_size.width) - log(tile_size.width)) / log_multiplier
        height_layers = (log(image_size.height) - log(tile_size.height)) / log_multiplier
        self.layer_count = int(ceil(max(width_layers, height_layers)) + 1)
        
    def scaleForLayer(self, layer_number):
        """Returns the image scale at the specified layer"""
        layer_index = self.layer_count - layer_number - 1
        return 1 / self.resolution_multiplier ** layer_index
        
    def layerForScale(self, scale):
        """Returns the layer number at or just above the specified scale"""
        last_layer = self.layer_count - 1;
        level = log(scale) / -log(self.resolution_multiplier)
        return max(last_layer - floor(level + 0.0000001), 0)
        
    def tileExtent(self, layer_number):
        """Returns the (width, height) of the image area covered by a tile"""
        tile_size = self.tile_size
        layer_index = self.layer_count - layer_number - 1
        scale = self.resolution_multiplier ** layer_index
        return Dimensions(int(tile_size.width * scale), 
                          int(tile_size.height * scale))
        
    def tileGridSize(self, layer_number):
        """Returns the number of tile (columns, rows) in a layer"""
        image_size = self.image_size
        extent = self.tileExtent(layer_number)
        return Dimensions(int(ceil(float(image_size.width)  / extent.width)),
                          int(ceil(float(image_size.height) / extent.height)) )
                 
    def tileColumn(self, x, layer_number):
        """Returns the tile column corresponding to x on layer_number"""
        tile_width = self.tile_size.width
        layer_index = self.layer_count - layer_number - 1
        extent = tile_width * (self.resolution_multiplier ** layer_index)
        return int(floor(x / extent))
        
    def tileRow(self, y, layer_number):
        """Returns the tile row corresponding to y on layer layer_number"""
        tile_height = self.tile_size.height
        layer_index = self.layer_count - layer_number - 1
        extent = tile_height * (self.resolution_multiplier ** layer_index)
        return int(floor(y / extent))