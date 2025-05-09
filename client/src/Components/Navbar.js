import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">EduSync</Link>
      </div>
      
      <div className="navbar-links">
        {isLoggedIn && role === "Student" && (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/results">Results</Link>
          </>
        )}
        {isLoggedIn && role === "Instructor" && (
          <>
            <Link to="/upload-course">Upload Course</Link>
            <Link to="/results">Student Results</Link>
            <Link to="/instructor/courses">Courses</Link>
          </>
        )}
      </div>

      <div className="navbar-auth">
        {!isLoggedIn ? (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;