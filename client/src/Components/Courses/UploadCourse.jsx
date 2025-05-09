import React, { useState } from "react";
import axios from "axios";
import "./UploadCourse.css";

const UploadCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a course file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mediaFile", file);

    try {
      await axios.post("https://edusync-backend.azurewebsites.net/api/Courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert("Course uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload course. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-course-container">
      <h2>Upload New Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Course File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        
        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Course"}
        </button>
      </form>
    </div>
  );
};

export default UploadCourse;