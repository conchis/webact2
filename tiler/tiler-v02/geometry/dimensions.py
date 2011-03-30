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

import types

class Dimensions:
   """Dimensions class.
   
   self.width - width value
   self.height - height value
   """
   
   def __init__(self, width = 0, height = 0):
      """Initialize dimensions"""
      self.width = width
      self.height = height 
      
   def __eq__(self, other):
      """Test if two dimensions objects are equal"""
      if not isinstance(other, Dimensions):
         return False
      if self.width != other.width or self.height != other.height:
         return False
      return True
   
   def __ne__(self, other):
      """Return true if not equal"""
      return not self == other
      
   def __repr__(self):
      """Return a string represenation"""
      return "Dimensions(width=%s, height=%s)" % (self.width, self.height)
   