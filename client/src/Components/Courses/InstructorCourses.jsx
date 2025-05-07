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
        <button
          className="btn btn-outline-primary mt-3 align-self-start"
          onClick={onClick}
        >
          View Details
        </button>
      </div>
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
        const response = await axios.get("http://localhost:5258/api/Courses/mycourses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = response.data;
        const courseArray = Array.isArray(data) ? data : data.courses || [];

        const seen = new Set();
        const uniqueCourses = courseArray.filter(course => {
          if (seen.has(course.title)) return false;
          seen.add(course.title);
          return true;
        });

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("❌ Error fetching instructor courses", error);
        setError("Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">🎓 Your Uploaded Courses</h3>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

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
        <div className="text-center text-muted">No courses uploaded by you yet.</div>
      ) : (
        <div className="row">
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
