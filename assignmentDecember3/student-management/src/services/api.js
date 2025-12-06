import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all students
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single student
export const getStudent = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create student
export const createStudent = async (studentData) => {
  try {
    const response = await axios.post(`${API_URL}/students`, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await axios.put(`${API_URL}/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete student
export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
