import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const fetchCourseFiles = async () => {
      try {
        const response = await axios.get("https://edusync-server.azurewebsites.net/api/Courses/allcourses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const matchedFiles = response.data.filter(c =>
          c.title.toLowerCase() === decodeURIComponent(courseTitle).toLowerCase()
        );

        if (matchedFiles.length === 0) {
          alert("No files found for this course.");
          navigate("/courses");
          return;
        }

        const { title, instructorName, instructorEmail } = matchedFiles[0];

        const mediaFiles = matchedFiles.map(file => ({
          url: file.mediaUrl,
          fileName: file.mediaUrl.split("/").pop(),
          description: file.description
        }));

        setCourseInfo({
          title,
          instructorName,
          instructorEmail,
          mediaFiles
        });

      } catch (error) {
        console.error("Failed to fetch course files", error);
        alert("Something went wrong.");
      }
    };

    fetchCourseFiles();
  }, [courseTitle, navigate]);

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["mp4", "webm"].includes(ext)) return "🎬 Video";
    if (["pdf"].includes(ext)) return "📘 PDF";
    if (["txt", "md"].includes(ext)) return "📄 Text";
    if (["doc", "docx"].includes(ext)) return "📝 Document";
    return "📁 File";
  };

  if (!courseInfo) return <div className="container">Loading course details...</div>;

  return (
    <div className="course-detail-container">
      <div className="course-card">
        <h2>{courseInfo.title}</h2>
        <p><strong>Instructor:</strong> {courseInfo.instructorName}</p>
        <p><strong>Email:</strong> {courseInfo.instructorEmail}</p>

        <h4>📂 Course Files</h4>
        <div className="file-grid">
          {courseInfo.mediaFiles.map((file, index) => (
            <div className="file-card" key={index}>
              <p className="file-icon">{getFileIcon(file.fileName)}</p>
              <p className="file-description">{file.description}</p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-button"
              >
                View File
              </a>
            </div>
          ))}
        </div>

        <div className="quiz-button-container">
          <button
            className="quiz-button"
            onClick={() => navigate(`/attempt-quiz/${courseInfo.title}`)}
          >
            Take Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
