import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AttemptQuiz = () => {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`http://localhost:5258/api/assessments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAssessment(response.data);
      } catch (error) {
        console.error("API call failed. Loading static quiz.");
        // 🔁 STATIC FALLBACK DATA
        const staticAssessment = {
          assessmentId: "static-assess-001",
          title: "Sample React Quiz",
          questions: [
            {
              question: "What is JSX in React?",
              options: ["A compiler", "JS extension syntax", "Package manager", "CSS tool"],
            },
            {
              question: "Which hook is used for state management?",
              options: ["useEffect", "useState", "useReducer", "useRef"],
            },
          ],
        };
        setAssessment(staticAssessment);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleOptionChange = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      assessmentId: assessment.assessmentId,
      userId: localStorage.getItem("userId") || "static-user-001",
      answers: answers,
    };

    try {
      await axios.post("http://localhost:5258/api/assessments/submit", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Quiz submitted successfully!");
    } catch (error) {
      alert("Quiz submitted (static mode).");
      console.log("Simulated submission:", payload);
    }

    navigate("/results");
  };

  if (!assessment) return <div className="container mt-5">Loading quiz...</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">{assessment.title}</h3>
      <form onSubmit={handleSubmit}>
        {assessment.questions.map((q, index) => (
          <div className="mb-4" key={index}>
            <h5>{index + 1}. {q.question}</h5>
            {q.options.map((option, optIndex) => (
              <div className="form-check" key={optIndex}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => handleOptionChange(index, option)}
                  required
                />
                <label className="form-check-label">{option}</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Submit Quiz</button>
      </form>
    </div>
  );
};

export default AttemptQuiz;
