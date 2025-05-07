import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CourseDetail = () => {
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const fetchCourseFiles = async () => {
      try {
        const response = await axios.get("https://edusync-backend.azurewebsites.net/api/Courses/allcourses", {
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
          fileName: file.mediaUrl.split('/').pop(),
          description: file.description // ✅ Add this field
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
    const ext = fileName.split('.').pop().toLowerCase();
    if (["mp4", "webm"].includes(ext)) return "🎬 Video";
    if (["pdf"].includes(ext)) return "📘 PDF";
    if (["txt", "md"].includes(ext)) return "📄 Text";
    if (["doc", "docx"].includes(ext)) return "📝 Document";
    return "📁 File";
  };

  if (!courseInfo) return <div className="container mt-5">Loading course details...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="mb-2">{courseInfo.title}</h2>
        <div className="mb-3">
          <strong>Instructor:</strong> {courseInfo.instructorName} <br />
          <strong>Email:</strong> {courseInfo.instructorEmail}
        </div>

        <h5 className="mt-4">📂 Course Files:</h5>
        <div className="row">
          {courseInfo.mediaFiles.map((file, index) => (
            <div className="col-md-6 col-lg-4 mb-3" key={index}>
              <div className="card h-100 border-info shadow-sm">
                <div className="card-body">
                  <h6 className="card-title">{getFileIcon(file.fileName)}</h6>
                  <p className="card-text text-truncate">{file.description}</p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View File
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-end mt-4">
          <button
            className="btn btn-success"
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
