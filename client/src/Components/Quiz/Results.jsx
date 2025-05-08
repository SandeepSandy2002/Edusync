import React, { useEffect, useState } from "react";
import axios from "axios";

const Results = () => {
  const [results, setResults] = useState([]);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId"); // Email of the user

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const url =
          role === "Instructor"
            ? "https://edusync-backend.azurewebsites.net/api/assessments/results/all"
            : `https://edusync-backend.azurewebsites.net/api/assessments/results/user/${encodeURIComponent(userId)}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        let filteredResults = response.data;

        if (role === "Instructor") {
          // Only include results for this instructor's courses
          filteredResults = response.data.filter(
            (r) => r.instructorEmail?.toLowerCase() === userId.toLowerCase()
          );
        }

        setResults(filteredResults);
      } catch (error) {
        console.error("Error fetching results", error);
      }
    };

    fetchResults();
  }, [role, userId]);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">📊 Quiz Results</h3>
      {results.length === 0 ? (
        <p>No quiz results available yet.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Quiz Title</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Attempt Date</th>
              {role === "Instructor" && <th>Student Name</th>}
            </tr>
          </thead>
          <tbody>
            {results.map((res, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{res.courseId}</td>
                <td>{res.score}</td>
                <td>{res.maxScore || 100}</td>
                <td>{new Date(res.attemptDate).toLocaleString()}</td>
                {role === "Instructor" && <td>{res.studentName}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Results;
