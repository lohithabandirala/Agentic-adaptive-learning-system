import { Router } from 'express';
import { Class } from '../db/models';
import { authenticateToken, requireTeacher, requireStudent, AuthRequest } from '../middleware/auth';

const router = Router();

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Teacher creates a class
router.post('/create', authenticateToken, requireTeacher, async (req: AuthRequest, res) => {
  try {
    const { className, description } = req.body || {};
    const teacherId = req.user!.userId;
    const teacherName = req.user!.username;
    
    if (!className) {
      return res.status(400).json({ error: 'className required' });
    }

    // Generate unique class code
    let classCode = generateClassCode();
    let exists = await Class.findOne({ classCode });
    
    // Ensure unique code
    while (exists) {
      classCode = generateClassCode();
      exists = await Class.findOne({ classCode });
    }
    
    const classId = `class_${Date.now()}_${teacherId}`;
    
    const newClass = new Class({
      name: className,
      description: description || '',
      classCode,
      teacherId,
      students: [],
      tests: [],
    });

    await newClass.save();

    console.log(`📚 Class created by ${teacherName}: ${className} (Code: ${classCode})`);

    res.json({ 
      classId: newClass._id,
      classCode, 
      className,
      message: `Class "${className}" created! Share code: ${classCode}` 
    });
  } catch (error) {
    console.error('❌ Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Student joins a class using code
router.post('/join', authenticateToken, requireStudent, async (req: AuthRequest, res) => {
  try {
    const { classCode } = req.body || {};
    const studentId = req.user!.userId;
    const studentName = req.user!.username;
    
    if (!classCode) {
      return res.status(400).json({ error: 'classCode required' });
    }

    // Find class by code
    const classEntry = await Class.findOne({ classCode: classCode.toUpperCase() });
    if (!classEntry) {
      return res.status(404).json({ error: 'Invalid class code' });
    }

    // Check if already joined
    if (classEntry.students.includes(studentId)) {
      return res.json({ 
        message: 'Already enrolled in this class', 
        class: {
          id: classEntry._id,
          name: classEntry.name,
          description: classEntry.description,
          classCode: classEntry.classCode,
          studentCount: classEntry.students.length,
        }
      });
    }

    // Add student to class
    classEntry.students.push(studentId);
    await classEntry.save();

    console.log(`👨‍🎓 Student ${studentName} joined class: ${classEntry.name} (${classEntry.classCode})`);

    res.json({ 
      message: `Successfully joined ${classEntry.name}!`, 
      class: {
        id: classEntry._id,
        name: classEntry.name,
        description: classEntry.description,
        classCode: classEntry.classCode,
        studentCount: classEntry.students.length,
      }
    });
  } catch (error) {
    console.error('❌ Error joining class:', error);
    res.status(500).json({ error: 'Failed to join class' });
  }
});

// Get all classes for current user (teacher or student)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let classes;
    
    if (role === 'teacher') {
      // Get classes created by this teacher
      classes = await Class.find({ teacherId: userId });
      
      const classesData = classes.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        classCode: c.classCode,
        studentCount: c.students.length,
        testCount: c.tests.length,
        createdAt: c.createdAt,
      }));

      return res.json({ classes: classesData });
    } else if (role === 'student') {
      // Get classes where this student is enrolled
      classes = await Class.find({ students: userId });
      
      const classesData = classes.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        classCode: c.classCode,
        studentCount: c.students.length,
        testCount: c.tests.length,
      }));

      return res.json({ classes: classesData });
    } else {
      // Admin gets all classes
      classes = await Class.find({});
      
      const classesData = classes.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        classCode: c.classCode,
        teacherId: c.teacherId,
        studentCount: c.students.length,
        testCount: c.tests.length,
        createdAt: c.createdAt,
      }));

      return res.json({ classes: classesData });
    }
  } catch (error) {
    console.error('❌ Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get teacher's classes
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const classes = await Class.find({ teacherId });
    
    const classesData = classes.map(c => ({
      id: c._id,
      name: c.name,
      description: c.description,
      classCode: c.classCode,
      studentCount: c.students.length,
      students: c.students,
      testCount: c.tests.length,
      tests: c.tests,
      createdAt: c.createdAt,
    }));

    res.json({ classes: classesData });
  } catch (error) {
    console.error('❌ Error fetching teacher classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get student's classes
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const classes = await Class.find({ students: studentId });
    
    const classesData = classes.map(c => ({
      id: c._id,
      name: c.name,
      description: c.description,
      classCode: c.classCode,
      studentCount: c.students.length,
      testCount: c.tests.length,
      createdAt: c.createdAt,
    }));

    res.json({ classes: classesData });
  } catch (error) {
    console.error('❌ Error fetching student classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get class details
router.get('/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ 
      class: {
        id: classData._id,
        name: classData.name,
        description: classData.description,
        classCode: classData.classCode,
        teacherId: classData.teacherId,
        studentCount: classData.students.length,
        students: classData.students,
        testCount: classData.tests.length,
        tests: classData.tests,
        createdAt: classData.createdAt,
      }
    });
  } catch (error) {
    console.error('❌ Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Add test to class
router.post('/:classId/tests', authenticateToken, requireTeacher, async (req: AuthRequest, res) => {
  try {
    const { classId } = req.params;
    const { testId } = req.body || {};
    const teacherId = req.user!.userId;
    
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Verify teacher owns this class
    if (classData.teacherId !== teacherId) {
      return res.status(403).json({ error: 'You can only add tests to your own classes' });
    }
    
    if (!classData.tests.includes(testId)) {
      classData.tests.push(testId);
      await classData.save();
    }
    
    res.json({ message: 'Test added to class', class: classData });
  } catch (error) {
    console.error('❌ Error adding test to class:', error);
    res.status(500).json({ error: 'Failed to add test' });
  }
});

export default router;
