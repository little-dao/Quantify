// src/pages/Login.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../auth";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 간단한 인증 로직 (실제 프로젝트에서는 백엔드 API 호출 필요)
    if (username === "user" && password === "password") {
      login(); // 인증 상태 업데이트
      navigate("/dashboard"); // 대시보드로 리다이렉트
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">
          Login
        </button>
        <p>
          Don't have an account?{" "}
          <Link to="/signup">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;