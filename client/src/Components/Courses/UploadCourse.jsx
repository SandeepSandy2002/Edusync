import React, { useState } from "react";
import axios from "axios";

const UploadCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a course file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mediaFile", file);

    try {
      const response = await axios.post("http://localhost:5258/api/Courses", formData, {
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
      alert("Failed to upload course.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4 text-center">📤 Upload New Course</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Course Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required />
        </div>
        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required />
        </div>
        <div className="mb-3">
          <label>Course Media File</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
            accept="*/*"
            required />
        </div>
        <button className="btn btn-success w-100" type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadCourse;
