import React from 'react';

const StudentList = ({ students, onEdit, onDelete }) => {
  if (!students || students.length === 0) {
    return <div className="no-data">No students found. Add your first student!</div>;
  }

  return (
    <div className="student-list">
      <h2>Student List ({students.length})</h2>
      <div className="table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Major</th>
              <th>GPA</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.age}</td>
                <td>{student.major}</td>
                <td>{student.gpa ? student.gpa.toFixed(2) : 'N/A'}</td>
                <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(student)}
                      className="btn btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(student._id)}
                      className="btn btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
