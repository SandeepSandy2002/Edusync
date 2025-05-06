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
import CourseDetail from "./Components/Courses/CourseDetail";
import InstructorCourses from "./Components/Courses/InstructorCourses";
import DetailedInsCourse from "./Components/Courses/DetailedInsCourse";
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
        <Route path="/course/:courseTitle" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
        <Route path="/instructor/courses" element={<PrivateRoute><InstructorCourses /></PrivateRoute>} />
        <Route path="/instructor/course/:courseTitle" element={<PrivateRoute><DetailedInsCourse /></PrivateRoute>} />


      </Routes>
    </Router>
  );
}

export default App;
