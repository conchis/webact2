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

class Tiler:
   """Creates or adds tiles to a tiled image"""
   
   def __init__(self, tiled_image):
      self.tiled_image = tiled_image
   
   def tileLayer(self, layer_number):
      """Generate all tiles in a specified tile layer"""
      raise "Implement in subclasses"