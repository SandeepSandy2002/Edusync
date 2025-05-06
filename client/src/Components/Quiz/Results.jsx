import React, { useEffect, useState } from "react";
import axios from "axios";

const Results = () => {
  const [results, setResults] = useState([]);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const url =
          role === "Instructor"
            ? "http://localhost:5258/api/results/all"
            : `http://localhost:5258/api/results/user/${userId}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setResults(response.data);
      } catch (error) {
        console.error("Error fetching results", error);

        // 🔁 STATIC FALLBACK DATA
        const staticResults = role === "Instructor"
          ? [
              {
                resultId: "r001",
                assessmentTitle: "React Basics",
                score: 9,
                maxScore: 10,
                attemptDate: new Date().toISOString(),
                studentName: "Alice Johnson",
              },
              {
                resultId: "r002",
                assessmentTitle: "JavaScript Core",
                score: 7,
                maxScore: 10,
                attemptDate: new Date().toISOString(),
                studentName: "Bob Smith",
              },
            ]
          : [
              {
                resultId: "r003",
                assessmentTitle: "React Basics",
                score: 8,
                maxScore: 10,
                attemptDate: new Date().toISOString(),
              },
              {
                resultId: "r004",
                assessmentTitle: "Azure Fundamentals",
                score: 6,
                maxScore: 10,
                attemptDate: new Date().toISOString(),
              },
            ];

        setResults(staticResults);
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
              <tr key={res.resultId}>
                <td>{index + 1}</td>
                <td>{res.assessmentTitle}</td>
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
