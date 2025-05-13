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

    const url = "https://edusync-server.azurewebsites.net/api/Auth/register";

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
      alert("Registration failed. Try again.", error);
    }
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "40px auto",
      padding: "25px",
      backgroundColor: "#f0f8ff",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{
        textAlign: "center",
        color: "#2c3e50",
        marginBottom: "25px"
      }}>
        Create Your Account
      </h2>
      
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #bdc3c7",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #bdc3c7",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #bdc3c7",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #bdc3c7",
              borderRadius: "4px",
              fontSize: "16px",
              backgroundColor: "white"
            }}
          >
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
          </select>
        </div>
        
        <button 
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#2980b9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#3498db"}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
