import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AttemptQuiz = () => {
  const { id } = useParams(); // courseTitle
  const navigate = useNavigate();
  const [instructorEmail, setInstructorEmail] = useState("");
  const [assessment, setAssessment] = useState({
    assessmentId: id,
    title: "Sample React Quiz",
    questions: [
      { question: "What is JSX in React?", options: ["A compiler", "JS extension syntax", "Package manager", "CSS tool"] },
      { question: "Which hook is used for state management?", options: ["useEffect", "useState", "useReducer", "useRef"] },
      { question: "What is the virtual DOM?", options: ["UI library", "In-memory DOM", "Real DOM", "Browser API"] },
      { question: "How do you pass data to child components?", options: ["State", "Props", "Events", "Hooks"] },
      { question: "Which hook runs after every render?", options: ["useEffect", "useMemo", "useReducer", "useLayoutEffect"] },
      { question: "How do you create a component in React?", options: ["Function/Class", "HTML", "CSS", "Script"] },
      { question: "Which is a valid React event?", options: ["onClick", "click", "mouseClick", "press"] },
      { question: "What does useRef return?", options: ["Mutable ref object", "Immutable state", "DOM node", "Boolean"] },
      { question: "What is the purpose of keys in lists?", options: ["Performance", "Identification", "Styling", "Validation"] },
      { question: "What is useEffect used for?", options: ["Side effects", "Props", "Styles", "DOM manipulation"] },
      { question: "How do you initialize state?", options: ["useState", "useInit", "useStore", "React.init"] },
      { question: "What is React.Fragment used for?", options: ["Group elements", "Styling", "Ref", "Event Binding"] },
      { question: "Which file contains component logic?", options: [".js/.jsx", ".html", ".css", ".json"] },
      { question: "What does useMemo do?", options: ["Memoize result", "Manage state", "Render component", "DOM changes"] },
      { question: "Which is not a valid React feature?", options: ["Two-way binding", "JSX", "Hooks", "Virtual DOM"] }
    ]
  });
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchInstructorEmail = async () => {
      try {
        const response = await axios.get("http://localhost:5258/api/Courses/allcourses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const courseMatch = response.data.find(c => c.title.toLowerCase() === decodeURIComponent(id).toLowerCase());
        if (courseMatch) setInstructorEmail(courseMatch.instructorEmail);
      } catch (error) {
        console.error("Error fetching instructor email", error);
      }
    };
    fetchInstructorEmail();
  }, [id]);

  const correctAnswers = {
    0: "JS extension syntax",
    1: "useState",
    2: "In-memory DOM",
    3: "Props",
    4: "useEffect",
    5: "Function/Class",
    6: "onClick",
    7: "Mutable ref object",
    8: "Identification",
    9: "Side effects",
    10: "useState",
    11: "Group elements",
    12: ".js/.jsx",
    13: "Memoize result",
    14: "Two-way binding"
  };

  const handleOptionChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let score = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (correctAnswers[index] === answer) score++;
    });
    const epochId = `assess-${Date.now()}`;

    const payload = {
      assessmentId: epochId,
      userId: localStorage.getItem("userId"),
      courseId: assessment.assessmentId,
      instructorEmail,
      answers,
      score
    };

    try {
      await axios.post("http://localhost:5258/api/assessments/submit", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("Quiz submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Quiz submission failed.");
    }

    navigate("/results");
  };

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
