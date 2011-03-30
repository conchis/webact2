import unittest
from ispace.geometry import *

class PointTest(unittest.TestCase):
   
   def testPoint(self):
      p1 = Point(x = 1, y = 2)
      self.assertEqual(1, p1.x)
      self.assertEqual(2, p1.y)
      
   def testProject(self):
      t = Transform.makeTranslate(10, 10).compose(Transform.makeScale(2, 2))
      p1 = Point(5, 5)
      self.assertEqual(Point(20, 20), p1.project(t))
      
   def testEquals(self):
      p1 = Point(2, 3)
      p2 = Point(3, 4)
      p3 = Point(2, 3)
      self.assertEqual(p1, p3)
      self.assertNotEqual(p1, p2)
      
def suite():
   return unittest.makeSuite(PointTest)
   
if __name__ == "__main__":
   unittest.TextTestRunner(verbosity=2).run(suite())
   
   