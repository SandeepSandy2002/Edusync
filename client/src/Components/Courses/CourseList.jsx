import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5258/api/Courses/allcourses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);

        // 🌐 Fallback to static sample data
        const fallbackCourses = [
          {
            courseId: "c101",
            title: "Introduction to React",
            description: "Learn the basics of React and build dynamic UIs.",
          },
          {
            courseId: "c102",
            title: "Azure Fundamentals",
            description: "Understand cloud computing concepts with Azure.",
          },
          {
            courseId: "c103",
            title: "JavaScript Essentials",
            description: "Master core JavaScript concepts and syntax.",
          },
        ];

        setCourses(fallbackCourses);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">📚 Available Courses</h3>
      <div className="row">
        {courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          courses.map(course => (
            <div className="col-md-4 mb-3" key={course.courseId}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/attempt-quiz/${course.courseId}`)}
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseList;
