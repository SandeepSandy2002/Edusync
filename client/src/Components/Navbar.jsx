import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/dashboard">EduSync</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {isLoggedIn && role === "Student" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/courses">Courses</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/results">Results</Link>
              </li>
            </>
          )}
          {isLoggedIn && role === "Instructor" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/upload-course">Upload Course</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/results">Student Results</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/instructor/courses">Courses</Link>
              </li>
            </>
          )}
        </ul>
        <ul className="navbar-nav ms-auto">
          {!isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
