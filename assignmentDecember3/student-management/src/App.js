import React, { useState, useEffect } from 'react';
import './App.css';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import { getAllStudents, createStudent, updateStudent, deleteStudent } from './services/api';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllStudents();
      setStudents(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      setError(null);
      const response = await createStudent(studentData);
      setStudents([response.data, ...students]);
      setShowForm(false);
      showSuccessMessage('Student added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add student');
      console.error('Error adding student:', err);
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      setError(null);
      const response = await updateStudent(editingStudent._id, studentData);
      setStudents(students.map(s => 
        s._id === editingStudent._id ? response.data : s
      ));
      setEditingStudent(null);
      setShowForm(false);
      showSuccessMessage('Student updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update student');
      console.error('Error updating student:', err);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      setError(null);
      await deleteStudent(id);
      setStudents(students.filter(s => s._id !== id));
      showSuccessMessage('Student deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete student');
      console.error('Error deleting student:', err);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎓 Student Management System</h1>
        <p>MERN Stack Application</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="alert alert-error">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span>✅ {successMessage}</span>
          </div>
        )}

        {!showForm && (
          <div className="action-bar">
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary btn-large"
            >
              ➕ Add New Student
            </button>
            <button 
              onClick={fetchStudents} 
              className="btn btn-secondary"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {showForm ? (
          <StudentForm
            student={editingStudent}
            onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
            onCancel={handleCancelForm}
          />
        ) : loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <StudentList
            students={students}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Student Management System | Built with MERN Stack</p>
      </footer>
    </div>
  );
}

export default App;

