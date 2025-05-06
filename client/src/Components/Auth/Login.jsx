import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ STATIC USERS FOR TESTING
    const staticUsers = [
      {
        email: "student@edusync.com",
        password: "student123",
        name: "Student User",
        userId: "stu001",
        role: "Student",
      },
      {
        email: "instructor@edusync.com",
        password: "instructor123",
        name: "Instructor User",
        userId: "ins001",
        role: "Instructor",
      },
    ];

    const matchedUser = staticUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("name", matchedUser.name);
      localStorage.setItem("userId", matchedUser.userId);
      localStorage.setItem("role", matchedUser.role);
      navigate("/dashboard");
      return;
    }

    // 🌐 REAL API LOGIN WITHOUT ROLE INPUT
    try {
      const response = await axios.post("http://localhost:5258/api/Auth/login", {
        email,
        password,
      });

      const { token, name, userId, role } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role); // ✅ role returned from backend

      navigate("/dashboard");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">EduSync Login</h2>
      <form className="mx-auto" style={{ maxWidth: "400px" }} onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
        </div>
        {/* 🔁 Removed Role Selection – backend assigns it */}
        <button className="btn btn-primary w-100" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
