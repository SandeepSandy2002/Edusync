import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // 🌐 REAL API LOGIN WITHOUT ROLE INPUT
    try {
      const response = await axios.post("http://localhost:5258/api/Auth/login", {
        email,
        password,
      });

      const { jwt, name, role } = response.data;

      localStorage.setItem("token", jwt);
      localStorage.setItem("name", name);
      localStorage.setItem("userId", email);
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
