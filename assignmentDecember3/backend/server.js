const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentDB';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  gpa: {
    type: Number,
    required: false,
    min: 0,
    max: 4,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

// Routes

// GET all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
});

// GET single student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
});

// POST create new student
app.post('/api/students', async (req, res) => {
  try {
    const { studentId, name, email, age, major, gpa } = req.body;
    
    // Validation
    if (!studentId || !name || !email || !age || !major) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const newStudent = new Student({
      studentId,
      name,
      email,
      age,
      major,
      gpa: gpa || null,
    });

    await newStudent.save();
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message,
    });
  }
});

// PUT update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { studentId, name, email, age, major, gpa } = req.body;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { studentId, name, email, age, major, gpa },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
