// src/pages/Signup.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  // State variables for form inputs
  const [id, setId] = useState(""); // User ID
  const [email, setEmail] = useState(""); // User email
  const [password, setPassword] = useState(""); // Password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password
  const [error, setError] = useState(""); // Error message state
  const navigate = useNavigate(); // Hook for navigation

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    console.log("Form submitted!"); // Debugging log

    // Validate that all fields are filled
    if (!id || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      console.error("Validation error: All fields are required."); // Debugging log
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      console.error("Validation error: Passwords do not match."); // Debugging log
      return;
    }

    // Simulate successful sign-up (replace with API call in real project)
    alert("Sign up successful!");
    console.log("Navigating to /login..."); // Debugging log
    navigate("/login"); // Redirect to login page after successful sign-up
  };

  return (
    <div className="signup-container">
      {/* Centered box for the sign-up form */}
      <div className="signup-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}
          
          {/* Input field for user ID */}
          <input
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              console.log("ID updated:", e.target.value); // Debugging log
            }}
          />
          
          {/* Input field for email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              console.log("Email updated:", e.target.value); // Debugging log
            }}
          />
          
          {/* Input field for password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              console.log("Password updated:", e.target.value); // Debugging log
            }}
          />
          
          {/* Input field for confirming password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              console.log("Confirm Password updated:", e.target.value); // Debugging log
            }}
          />
          
          {/* Submit button for the form */}
          <button type="submit">Sign Up</button>
        </form>
        
        {/* Link to the login page for existing users */}
        <p>
          Already have an account?{" "}
          <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;