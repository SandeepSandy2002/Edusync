import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const url =
          role === "Instructor"
            ? "https://edusync-server.azurewebsites.net/api/assessments/results/all"
            : `https://edusync-server.azurewebsites.net/api/assessments/results/user/${encodeURIComponent(userId)}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        let filteredResults = response.data;

        if (role === "Instructor") {
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
    <div className="results-container">
      <h2>My Quiz Results</h2>
      {results.length === 0 ? (
        <p className="no-results">No quiz results available yet.</p>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Out of</th>
                <th>Date</th>
                {role === "Instructor" && <th>Student</th>}
              </tr>
            </thead>
            <tbody>
              {results.map((res, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{res.courseId}</td>
                  <td className="score-cell">{res.score}</td>
                  <td>{res.maxScore || 100}</td>
                  <td>{new Date(res.attemptDate).toLocaleDateString()}</td>
                  {role === "Instructor" && <td>{res.studentName}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results;
