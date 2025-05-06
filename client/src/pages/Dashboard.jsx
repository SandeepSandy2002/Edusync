import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2>Welcome, {name}!</h2>
        <p className="lead">Role: <strong>{role}</strong></p>
      </div>

      {role === "Student" && (
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-primary mb-3 w-50" onClick={() => navigate("/courses")}>
            📘 View Courses
          </button>
          <button className="btn btn-secondary mb-3 w-50" onClick={() => navigate("/results")}>
            📊 View Quiz Results
          </button>
        </div>
      )}

      {role === "Instructor" && (
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-success mb-3 w-50" onClick={() => navigate("/upload-course")}>
            ⬆️ Upload New Course
          </button>
          <button className="btn btn-warning mb-3 w-50" onClick={() => navigate("/results")}>
            📈 View Student Results
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
