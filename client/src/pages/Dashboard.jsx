import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // We'll create this CSS file

const Dashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {name}!</h2>
        <p>You are logged in as: <span className="role-badge">{role}</span></p>
      </div>

      <div className="dashboard-buttons">
        {role === "Student" && (
          <>
            <button onClick={() => navigate("/courses")}>
              View Courses
            </button>
            <button onClick={() => navigate("/results")}>
              View Quiz Results
            </button>
          </>
        )}

        {role === "Instructor" && (
          <>
            <button onClick={() => navigate("/upload-course")}>
              Upload New Course
            </button>
            <button onClick={() => navigate("/results")}>
              View Student Results
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;