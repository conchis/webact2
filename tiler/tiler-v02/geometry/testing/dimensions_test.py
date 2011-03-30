import unittest
from ispace.geometry.dimensions import *

class DimensionsTest(unittest.TestCase):
   
   def testPoint(self):
      p1 = Dimensions(width = 1, height = 2)
      self.assertEqual(1, p1.width)
      self.assertEqual(2, p1.height)
      
   def testEquals(self):
      d1 = Dimensions(2, 3)
      d2 = Dimensions(3, 4)
      d3 = Dimensions(2, 3)
      self.assertEqual(d1, d3)
      self.assertNotEqual(d1, d2)
   
def suite():
   return unittest.makeSuite(DimensionsTest)
   
if __name__ == "__main__":
   unittest.TextTestRunner(verbosity=2).run(suite())
   
   