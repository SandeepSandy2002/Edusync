import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import CourseList from "./Components/Courses/CourseList";
import UploadCourse from "./Components/Courses/UploadCourse";
import AttemptQuiz from "./Components/Quiz/AttemptQuiz";
import Results from "./Components/Quiz/Results";
import Navbar from "./Components/Navbar";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/courses" element={
          <PrivateRoute><CourseList /></PrivateRoute>
        } />
        <Route path="/upload-course" element={
          <PrivateRoute><UploadCourse /></PrivateRoute>
        } />
        <Route path="/attempt-quiz/:id" element={
          <PrivateRoute><AttemptQuiz /></PrivateRoute>
        } />
        <Route path="/results" element={
          <PrivateRoute><Results /></PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
