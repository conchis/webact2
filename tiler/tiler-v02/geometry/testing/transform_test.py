import unittest, math
from ispace.geometry import *

class TransformTest(unittest.TestCase):
   
   def testIdentity(self):
      t = Transform.makeIdentity()
      self.assertEqual(Point(6, 11), t.project(Point(6, 11)))
      self.assertEqual(Point(10, 10), t.project(Point(10, 10)))
      self.assertEqual(Point(0, 0), t.project(Point(0, -0)))
      
   def testTranslate(self):
      t = Transform.makeTranslate(5, 10)
      self.assertEqual(Point(6, 11), t.project(Point(1, 1)))
      self.assertEqual(Point(10, 10), t.project(Point(5, 0)))
      self.assertEqual(Point(0, 0), t.project(Point(-5, -10)))
      
   def testScale(self):
      t1 = Transform.makeScale(0.5, 0.5)
      self.assertEqual(Point(5, 5), t1.project(Point(10, 10)))
      t2 = Transform.makeScale(0.5, 1.0)  
      self.assertEqual(Point(5, 10), t2.project(Point(10, 10)))
      t3 = Transform.makeScale(2, 2)  
      self.assertEqual(Point(20, 20), t3.project(Point(10, 10)))   
      
   def testRotate(self):
      t1 = Transform.makeRotate(math.pi / 2)   
      p2 = t1.project(Point(2, 0))
      self.assertAlmostEqual(0, p2.x)
      self.assertAlmostEqual(2, p2.y)
      t2 = Transform.makeRotate(math.pi)   
      p3 = t2.project(Point(2, 0))
      self.assertAlmostEqual(-2, p3.x)
      self.assertAlmostEqual( 0, p3.y)   
      
   def testCompose1(self):
      t1 = Transform.makeTranslate(1, 1)
      t2 = Transform.makeTranslate(4, 5)
      t3 = t1.compose(t2)
      self.assertEqual(Point(10, 10), t3.project(Point(5, 4)))
      
   def testCompose2(self):
      t1 = Transform.makeRotate(math.pi / 2)   
      t2 = Transform.makeTranslate(1, 1)
      t3 = t1.compose(t2)
      p1 = t3.project(Point(5, 0))
      self.assertAlmostEqual(-1, p1.x)
      self.assertAlmostEqual( 6, p1.y)
      
   def testCompose3(self):
      t1 = Transform.makeTranslate(1, 1)
      t2 = Transform.makeRotate(math.pi / 2)   
      t3 = t1.compose(t2)
      p1 = t3.project(Point(5, 0))
      self.assertAlmostEqual(1, p1.x)
      self.assertAlmostEqual(6, p1.y)
      
   def testInverse1(self):
      t1 = Transform.makeTranslate(1, 1)
      t2 = t1.inverse()
      p1 = Point(3, 4)
      p2 = t2.project(t1.project(p1))
      self.assertAlmostEqual(p1.x, p2.x)
      self.assertAlmostEqual(p1.y, p2.y)
      
   def testInverse2(self):
      t1 = Transform.makeRotate(math.pi / 3) 
      t2 = t1.inverse()
      p1 = Point(3, 4)
      p2 = t2.project(t1.project(p1))
      self.assertAlmostEqual(p1.x, p2.x)
      self.assertAlmostEqual(p1.y, p2.y)
      
   def testInverse3(self):
      t1 = Transform.makeRotate(math.pi / 3).compose(Transform.makeTranslate(4, 3))
      t2 = t1.inverse()
      p1 = Point(3, 4)
      p2 = t2.project(t1.project(p1))
      self.assertAlmostEqual(p1.x, p2.x)
      self.assertAlmostEqual(p1.y, p2.y)
      
   def testInverse4(self):
      t1 = Transform.makeScale(0.5, 0.25)
      t2 = t1.inverse()
      p1 = Point(3, 4)
      p2 = t2.project(t1.project(p1))
      self.assertAlmostEqual(p1.x, p2.x)
      self.assertAlmostEqual(p1.y, p2.y)
      
   def testEqual(self):
       t1 = Transform.makeTranslate(1, 1)
       t2 = Transform.makeTranslate(1, 1)
       t3 = Transform.makeTranslate(1, 0)
       t4 = Transform.makeScale(2, 2)
       t5 = Transform.makeScale(2, 2)
       self.assertEqual(t1, t1)
       self.assertEqual(t1, t2)
       self.assertEqual(t2, t1)
       self.assertNotEqual(t1, t3)
       self.assertEqual(t4, t5)
       self.assertNotEqual(t4, t1)
 
def suite():
   return unittest.makeSuite(TransformTest)
   
if __name__ == "__main__":
   unittest.TextTestRunner(verbosity=2).run(suite())
      