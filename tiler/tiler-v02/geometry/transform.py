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

from cStringIO import StringIO
import string, math
from point import *

class Transform:
   """An affine tranform matrix for translating from one coordinate system to another.
      
   self.matrix - 3 x 3 tranformation matrix stored as a list of nine values.
   """
   
   # **** Constructors
   
   def __init__(self):
      """Default matrix is the identity matrix"""
      self.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
      
   @classmethod
   def makeIdentity(self):
      """Return the identity transform"""
      return Transform()
   
   @classmethod
   def makeTranslate(self, offset_x, offset_y):
      """Return a transform for translation"""
      transform = Transform()
      transform.matrix = [1, 0, offset_x, 0, 1, offset_y, 0, 0, 1]
      return transform
   
   @classmethod
   def makeScale(self, scale_x, scale_y):
      """Return a transform for scaling"""
      transform = Transform()
      transform.matrix = [scale_x, 0, 0, 0, scale_y, 0, 0, 0, 1]
      return transform
   
   @classmethod
   def makeRotate(self, radians):
      """Return a transform for rotation"""
      cos_angle = math.cos(radians)
      sin_angle = math.sin(radians)
      transform = Transform()
      transform.matrix = [cos_angle, -sin_angle, 0, sin_angle, cos_angle, 0, 0, 0, 1]
      return transform 
   
   # **** Projection
   
   def project(self, point):
      """Convert a point into the coordinate system described by this 
         transform"""
      matrix = self.matrix
      return Point(matrix[0] * point.x + matrix[1] * point.y + matrix[2],
                   matrix[3] * point.x + matrix[4] * point.y + matrix[5])
   
   # **** Composition and Inverse
   
   def compose(self, transform):
      """Combine two transforms by multiplying matrices."""
      a = self.matrix
      b = transform.matrix
      result = Transform()
      result.matrix = [
         a[0]*b[0] + a[1]*b[3] + a[2]*b[6], 
         a[0]*b[1] + a[1]*b[4] + a[2]*b[7], 
         a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
         
         a[3]*b[0] + a[4]*b[3] + a[5]*b[6], 
         a[3]*b[1] + a[4]*b[4] + a[5]*b[7], 
         a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
         
         a[6]*b[0] + a[7]*b[3] + a[8]*b[6], 
         a[6]*b[1] + a[7]*b[4] + a[8]*b[7], 
         a[6]*b[2] + a[7]*b[5] + a[8]*b[8]]

      return result
   
   def inverse(self):
      """Compute the inverse of the matrix to reverse the transform"""
      a = self.matrix
      det = (  a[0]*a[4]*a[8] - a[0]*a[5]*a[7] - a[1]*a[3]*a[8] 
             + a[1]*a[5]*a[6] + a[2]*a[3]*a[7] - a[2]*a[4]*a[6] )
   
      result = Transform()
      result.matrix = [
         ( a[4]*a[8] - a[5]*a[7]) / det,             
         -(a[1]*a[8] - a[2]*a[7]) / det,
         ( a[1]*a[5] - a[2]*a[4]) / det,
         
         -(a[3]*a[8] - a[5]*a[6]) / det,
         ( a[0]*a[8] - a[2]*a[6]) / det,
         -(a[0]*a[5] - a[2]*a[3]) / det,
         
         ( a[3]*a[7] - a[4]*a[6]) / det,
         -(a[0]*a[7] - a[1]*a[6]) / det,
         ( a[0]*a[4] - a[1]*a[3]) / det ]
      
      return result
   
   # **** Equals
   
   def __eq__(self, other):
      """Determine if two transforms are equal"""
      if not isinstance(other, Transform):
         return False
      return self.matrix == other.matrix
   
   def __ne__(self, other):
      """Return True if not equal"""
      return not self == other
   
   # **** String Representation
   
   def __repr__(self):
      """Return a string represenation of the transform matrix"""
      
      strings = [string.strip("%30.4f" % item) for item in self.matrix]
      item_size = apply(max, [len(item_string) for item_string in strings])
      strings = [string.rjust(item_string, item_size) for item_string in strings]
      
      out = StringIO()
      for start in xrange(0, 9, 3):
         print >>out, "[", string.join(strings[start:start + 3], ", "), "]"
      return out.getvalue()
      