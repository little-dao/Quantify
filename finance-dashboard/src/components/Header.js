// src/components/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faGlobe, faInfoCircle, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { isAuthenticatedUser, logout } from "../auth";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  // Log out function
  const handleLogout = () => {
    logout(); // Call logout function
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="header">
      {/* Logo only */}
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="Company Logo" className="logo" />
        </Link>
      </div>

      {/* Navigation links and dynamic button */}
      <nav className="nav-container">
        <div className="nav-links">
          <Link to="/domestic-trade" className="nav-item">
            <FontAwesomeIcon icon={faHome} /> Domestic Trade
          </Link>
          <Link to="/international-trade" className="nav-item">
            <FontAwesomeIcon icon={faGlobe} /> International Trade
          </Link>
          <Link to="/about-us" className="nav-item">
            <FontAwesomeIcon icon={faInfoCircle} /> About Us
          </Link>
          <Link to="/contact-us" className="nav-item">
            <FontAwesomeIcon icon={faEnvelope} /> Contact Us
          </Link>
        </div>

        {/* Dynamic button based on authentication status */}
        {isAuthenticatedUser() ? (
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <Link to="/login" className="signup-button">
            Sign Up
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;