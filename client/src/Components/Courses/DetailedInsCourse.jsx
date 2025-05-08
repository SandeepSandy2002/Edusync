import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DetailedInsCourse = () => {
    const { courseTitle } = useParams();
    const navigate = useNavigate();
    const modalRef = useRef(null);
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
            const response = await axios.get("https://edusync-backend.azurewebsites.net/api/Courses/mycourses", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const data = response.data;
            const matched = Array.isArray(data) ? data.filter(
                c => c.title.toLowerCase() === decodeURIComponent(courseTitle).toLowerCase()
            ) : [];

            if (matched.length === 0) {
                setCourseMeta({ title: decodeURIComponent(courseTitle) });
                setCourseFiles([]);
                return;
            }

            setCourseMeta({
                title: matched[0].title,
                instructorName: matched[0].instructorName,
                instructorEmail: matched[0].instructorEmail
            });

            setCourseFiles(
                matched.map(file => ({
                    mediaUrl: file.mediaUrl,
                    fileName: file.mediaUrl.split('/').pop(),
                    description: file.description,
                    inputRef: React.createRef()
                }))
            );
        } catch (err) {
            console.error("Error loading course files:", err);
            setCourseMeta({ title: decodeURIComponent(courseTitle) });
            setCourseFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (["mp4", "webm"].includes(ext)) return "🎬 Video";
        if (["pdf"].includes(ext)) return "📘 PDF";
        if (["txt", "md"].includes(ext)) return "📄 Text";
        if (["doc", "docx"].includes(ext)) return "📝 Document";
        return "📁 File";
    };

    const handleFileUpload = async (e) => {
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
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            alert("File uploaded successfully.");
            setNewFile(null);
            setNewDescription("");
            fetchMyCourseFiles();
            modalRef.current.click();
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload file.");
        }
    };

    const handleReplaceFile = async (e, mediaUrl, fileObj) => {
        const replacementFile = e.target.files[0];
        if (!replacementFile) return;

        const formData = new FormData();
        formData.append("MediaFile", replacementFile);
        formData.append("ExistingMediaUrl", mediaUrl);

        try {
            await axios.put("https://edusync-backend.azurewebsites.net/api/Courses/replace", formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            alert("File replaced successfully.");
            fetchMyCourseFiles();
            if (fileObj.inputRef?.current) fileObj.inputRef.current.value = "";
        } catch (err) {
            console.error("Replace failed:", err);
            alert("Failed to replace file.");
        }
    };

    const handleDescriptionEdit = async (mediaUrl, updatedDescription) => {
        try {
            await axios.put("https://edusync-backend.azurewebsites.net/api/Courses/update-description", {
                mediaUrl,
                description: updatedDescription
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update description.");
        }
    };

    const handleDeleteFile = async (mediaUrl) => {
        try {
            await axios.delete("https://edusync-backend.azurewebsites.net/api/Courses/delete-file", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                data: { mediaUrl }
            });
            alert("File deleted.");
            fetchMyCourseFiles();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete file.");
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm("Are you sure you want to delete the entire course?")) return;
        try {
            await axios.delete(`https://edusync-backend.azurewebsites.net/api/Courses/delete-course-by-title/${encodeURIComponent(courseMeta.title)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            alert("Course deleted successfully.");
            navigate("/instructor/courses");
        } catch (err) {
            console.error("Course delete failed:", err);
            alert("Failed to delete course.");
        }
    };

    if (loading) return <div className="container mt-5">Loading course details...</div>;

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="mb-0">{courseMeta?.title}</h2>
                    <div>
                        <button className="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#uploadModal">➕ Upload File</button>
                        <button className="btn btn-danger" onClick={handleDeleteCourse}>🗑 Delete Course</button>
                    </div>
                </div>

                <h5 className="mt-4">📂 Course Files:</h5>
                {courseFiles.length === 0 && (
                    <p className="text-muted fst-italic">No files uploaded for this course yet.</p>
                )}

                <div className="row">
                    {courseFiles.map((file, index) => (
                        <div className="col-md-6 col-lg-4 mb-3" key={index}>
                            <div className="card h-100 border-info shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-title">{getFileIcon(file.fileName)}</h6>
                                    <textarea
                                        className="form-control form-control-sm mb-2"
                                        defaultValue={file.description}
                                        onBlur={(e) => handleDescriptionEdit(file.mediaUrl, e.target.value)}
                                    />
                                    <a href={file.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm w-100 mb-2">
                                        🔍 View File
                                    </a>
                                    <label className="form-label small mt-2">Optional: Replace File</label>
                                    <input
                                        type="file"
                                        ref={file.inputRef}
                                        className="form-control form-control-sm mb-2"
                                        onChange={(e) => handleReplaceFile(e, file.mediaUrl, file)}
                                    />
                                    <button onClick={() => handleDeleteFile(file.mediaUrl)} className="btn btn-outline-danger btn-sm w-100">
                                        🗑 Delete File
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-end mt-4">
                    <button className="btn btn-secondary" onClick={() => navigate("/instructor/courses")}>⬅ Back to My Courses</button>
                </div>
            </div>

            <div className="modal fade" id="uploadModal" tabIndex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleFileUpload}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="uploadModalLabel">Upload New File</h5>
                                <button type="button" ref={modalRef} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <input type="file" className="form-control mb-3" onChange={(e) => setNewFile(e.target.files[0])} />
                                <input type="text" className="form-control" placeholder="Enter description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-success">Upload</button>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedInsCourse;
