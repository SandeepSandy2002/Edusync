import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InstructorCourses.css";

const CourseCard = memo(({ course, onClick }) => (
  <div className="course-card">
    <div className="card-content">
      <h3>{course.title}</h3>
      <p className="description">{course.description}</p>
      <button onClick={onClick} className="view-button">
        View Details
      </button>
    </div>
  </div>
));

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const response = await axios.get(
          "https://edusync-backend.azurewebsites.net/api/Courses/mycourses",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = response.data;
        const courseArray = Array.isArray(data) ? data : data.courses || [];

        const seen = new Set();
        const uniqueCourses = courseArray.filter((course) => {
          if (seen.has(course.title)) return false;
          seen.add(course.title);
          return true;
        });

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("Error fetching instructor courses", error);
        setError("Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, []);

  return (
    <div className="instructor-courses">
      <h2>My Courses</h2>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-message">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="no-courses">You haven't uploaded any courses yet.</div>
      ) : (
        <div className="courses-grid">
          {courses.map((course, index) => (
            <CourseCard
              key={`${course.title}-${index}`}
              course={course}
              onClick={() =>
                navigate(`/instructor/course/${encodeURIComponent(course.title)}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;