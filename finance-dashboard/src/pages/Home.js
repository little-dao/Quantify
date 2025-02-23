// src/pages/Home.js

import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <div className="logo-container">
          <img src="/logo.png" alt="Company Logo" className="home-logo" />
        </div>
        <div className="auth-buttons">
          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-content">
        <h1>Welcome to Trading Co.</h1>
        <p>Your trusted partner in financial trading.</p>
      </main>

      {/* Footer Navigation */}
      <footer className="home-navbar">
        <ul>
          <li><Link to="/domestic-trade">Domestic Trade</Link></li>
          <li><Link to="/international-trade">International Trade</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
          <li><Link to="/contact-us">Contact Us</Link></li>
        </ul>
      </footer>
    </div>
  );
};

export default Home;