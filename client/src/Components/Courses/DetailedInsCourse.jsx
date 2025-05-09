import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DetailedInsCourse.css";

const DetailedInsCourse = () => {
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const [courseFiles, setCourseFiles] = useState([]);
  const [courseMeta, setCourseMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newFile, setNewFile] = useState(null);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchMyCourseFiles();
  }, [courseTitle]);

  const fetchMyCourseFiles = async () => {
    try {
      const response = await axios.get(
        "https://edusync-backend.azurewebsites.net/api/Courses/mycourses",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const matched = response.data.filter(
        (c) => c.title.toLowerCase() === decodeURIComponent(courseTitle).toLowerCase()
      );

      if (matched.length === 0) {
        setCourseMeta({ title: decodeURIComponent(courseTitle) });
        setCourseFiles([]);
        return;
      }

      setCourseMeta({
        title: matched[0].title,
        instructorName: matched[0].instructorName,
        instructorEmail: matched[0].instructorEmail,
      });

      setCourseFiles(
        matched.map((file) => ({
          mediaUrl: file.mediaUrl,
          fileName: file.mediaUrl.split("/").pop(),
          description: file.description,
        }))
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newFile || !newDescription) {
      alert("Please select a file and enter a description.");
      return;
    }

    const formData = new FormData();
    formData.append("MediaFile", newFile);
    formData.append("Title", courseMeta.title);
    formData.append("Description", newDescription);

    try {
      await axios.post("https://edusync-backend.azurewebsites.net/api/Courses", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("File uploaded successfully!");
      setNewFile(null);
      setNewDescription("");
      fetchMyCourseFiles();
    } catch (err) {
      alert("Upload failed. Please try again.");
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(
        `https://edusync-backend.azurewebsites.net/api/Courses/delete-course-by-title/${encodeURIComponent(
          courseMeta.title
        )}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Course deleted successfully!");
      navigate("/instructor/courses");
    } catch {
      alert("Delete failed. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading course details...</div>;

  return (
    <div className="course-page">
      <div className="course-header">
        <h2>{courseMeta?.title}</h2>
        <p>Instructor: {courseMeta?.instructorName}</p>
        <p>Email: {courseMeta?.instructorEmail}</p>
      </div>

      <div className="upload-area">
        <h3>Add New File</h3>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="File description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <button type="submit">Upload File</button>
        </form>
      </div>

      <div className="files-list">
        <h3>Course Files</h3>
        {courseFiles.length === 0 ? (
          <p>No files available for this course yet.</p>
        ) : (
          <div className="files-grid">
            {courseFiles.map((file, i) => (
              <div key={i} className="file-item">
                <div className="file-info">
                  <span className="file-type">
                    {file.fileName.split(".").pop().toUpperCase()}
                  </span>
                  <p>{file.description}</p>
                </div>
                <a href={file.mediaUrl} target="_blank" rel="noreferrer">
                  View File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate("/instructor/courses")}>
          Back to Courses
        </button>
        <button className="delete-btn" onClick={handleDeleteCourse}>
          Delete Course
        </button>
      </div>
    </div>
  );
};

export default DetailedInsCourse;