import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const url = "http://localhost:5258/api/Auth/register";

    try {
      await axios.post(url, {
        name,
        email,
        password,
        role,
      });

      alert("Registration successful! Please login.");
      navigate("/");
    } catch (error) {
      alert("Registration failed. Try again.",error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">EduSync Registration</h2>
      <form className="mx-auto" style={{ maxWidth: "400px" }} onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required />
        </div>
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
        <div className="mb-3">
          <label>Role</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
          </select>
        </div>
        <button className="btn btn-success w-100" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
