import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CourseList.css";

const CourseCard = memo(({ course, onClick }) => (
  <div className="course-card">
    <div className="card-content">
      <h3>{course.title}</h3>
      <p className="description">{course.description}</p>
      <div className="instructor-info">
        <p>Teacher: {course.instructorName}</p>
        <p>Email: {course.instructorEmail}</p>
      </div>
      <button onClick={onClick} className="view-button">
        View Details
      </button>
    </div>
  </div>
));

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "https://edusync-server.azurewebsites.net/api/Courses/allcourses",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const seen = new Set();
        const uniqueCourses = response.data.filter((course) => {
          if (seen.has(course.title)) return false;
          seen.add(course.title);
          return true;
        });

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("Error fetching courses", error);
        alert("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="course-list-container">
      <h2>Available Courses</h2>

      {loading ? (
        <div className="loading-courses">
          <p>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <p className="no-courses">No courses available right now.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course, index) => (
            <CourseCard
              key={`${course.title}-${index}`}
              course={course}
              onClick={() => navigate(`/course/${encodeURIComponent(course.title)}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
