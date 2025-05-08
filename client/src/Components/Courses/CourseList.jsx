import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseCard = memo(({ course, onClick }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 shadow-sm border-0 transition">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 className="card-title text-primary">{course.title}</h5>
          <p className="card-text text-secondary">{course.description}</p>
        </div>
        <div className="mt-3 small text-muted">
          👨‍🏫 <strong>{course.instructorName}</strong>
          <br />
          📧 {course.instructorEmail}
        </div>
        <button
          className="btn btn-outline-primary mt-3"
          onClick={onClick}
        >
          View Details
        </button>
      </div>
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
        const response = await axios.get("https://edusync-backend.azurewebsites.net/api/Courses/allcourses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        // ✅ Deduplicate by course title
        const seen = new Set();
        const uniqueCourses = response.data.filter(course => {
          if (seen.has(course.title)) return false;
          seen.add(course.title);
          return true;
        });

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("❌ Error fetching courses", error);
        alert("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">📚 All Available Courses</h3>

      {loading ? (
        <div className="row">
          {[...Array(3)].map((_, idx) => (
            <div className="col-md-4 mb-4" key={idx}>
              <div className="card h-100 shadow-sm placeholder-glow p-4">
                <div className="placeholder col-8 mb-2"></div>
                <div className="placeholder col-10 mb-2"></div>
                <div className="placeholder col-6 mb-2"></div>
                <div className="placeholder col-5 mb-2"></div>
                <div className="btn btn-outline-secondary disabled placeholder col-6 mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted">No courses available.</div>
      ) : (
        <div className="row">
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
