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
from point import *
from dimensions import *
from transform import *

class Rectangle:
   """Rectangle class. Assumes floating point coordinates.

   self.left - left edge
   self.top - top edge
   self.right - right edge
   self.bottom - bottom edge
   """
   
   def __init__(self, left = 0, top = 0, right = 0, bottom = 0):
      """Initialize a rectangle"""
      self.left = left
      self.top = top
      self.right = right
      self.bottom = bottom

   def getTopLeft(self):
      """Return top left point"""
      return Point(self.left, self.top)
   
   def setTopLeft(self, top_left):
      """Moves the rectangle to a new coordinate position"""
      x_offset = top_left.x - self.left
      y_offset = top_left.y - self.top
      self.left   += x_offset
      self.right  += x_offset
      self.top    += y_offset
      self.bottom += y_offset
   
   def getBottomRight(self):
      """Return bottom right point"""
      return Point(self.right, self.bottom)
   
   def getDimensions(self):
      """Return the dimensions (size) of the rectangle"""
      return Dimensions(self.right - self.left, self.bottom - self.top)
   
   def setDimensions(self, dimensions):
      """Resizes the rectangle to new dimensions"""
      self.right  = self.left + dimensions.width
      self.bottom = self.top  + dimensions.height
      
   def getCenter(self):
      """Return the center point"""
      return Point((self.left + self.right) / 2, (self.top + self.bottom) / 2)
   
   def contains(self, other):
      """Determines if this rectangle contains another rectangle"""
      return (     other.top    >= self.top
               and other.bottom <= self.bottom
               and other.left   >= self.left
               and other.right  <= self.right) 
   
   def overlaps(self, other):
      """Determines if a specified rectangle overlaps this rectangle"""
      return (     other.bottom >= self.top
               and other.top    <= self.bottom
               and other.right  >= self.left
               and other.left   <= self.right)
   
   def containsPoint(self, point):
      """Determine if a point is within this rectangle"""
      return (    point.x >= self.left and point.x <= self.right
              and point.y >= self.top  and point.y <= self.bottom)
   
   def project(self, transform):
      """Return a new rectangle with coordnates projected by a transform"""
      assert isinstance(transform, Transform)
      top_left = transform.project(self.getTopLeft())
      bottom_right = transform.project(self.getBottomRight())
      return Rectangle(top_left.x, top_left.y, bottom_right.x, bottom_right.y)
   
   def inset(self, dimensions):
      """Return a new rectangle with inset removed from edges"""
      inset_x = dimensions.width
      inset_y = dimensions.height
      return Rectangle(self.left  + inset_x, self.top    + inset_y,
                       self.right - inset_x, self.bottom - inset_y)
   
   def intersect(self, other):
      """Return the intersection of this with another rectangle"""
      assert isinstance(other, Rectangle)
      return Rectangle(max(self.left,  other.left ), max(self.top,    other.top   ),
                       min(self.right, other.right), min(self.bottom, other.bottom))
   
   def extend(self, other):
      """Return the smallest rectangle that contains this and another rectangle"""
      return Rectangle(min(self.left,  other.left ), min(self.top,    other.top   ),
                       max(self.right, other.right), max(self.bottom, other.bottom))

   def __eq__(self, other):
      """Determine if two rectangles and equal"""
      if not isinstance(other, Rectangle):
         return False
      return (self.left == other.left and self.top == other.top
                  and self.right == other.right and self.bottom == other.bottom)
   
   def __ne__(self, other):
      """Determine if two rectangles are not equal"""
      return not self == other
         
   def __repr__(self):
      """Return a string representation of the rectangle"""
      class_name = self.__class__.__name__
      return "%s(left=%s, top=%s, right=%s, bottom=%s)" % (class_name,
         self.left, self.top, self.right, self.bottom)