// src/routes.js

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StrategyBuilder from "./components/StrategyBuilder";
import Backtesting from "./components/BackTesting";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import { isAuthenticatedUser } from "./auth";

const PrivateRoute = ({ children }) => {
  return isAuthenticatedUser() ? children : <Navigate to="/login" />;
};

const Router = () => {
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          <div className="home-content">
            <h1>Welcome to Quantify</h1>
            <p>
              Unlock the future of trading with <strong>Quantify</strong>.
              Join thousands of traders who are already maximizing their profits
              with our cutting-edge tools and expert insights.
            </p>
            <button className="main-signup-button">
              <a href="/signup">Sign Up Now</a>
            </button>

            {/* Graph SVG */}
            <div className="graph-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 150"
                className="graph-svg"
              >
                {/* Background grid */}
                <line x1="0" y1="120" x2="400" y2="120" stroke="#333" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="#333" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#333" />

                {/* Rising graph line */}
                <polyline
                  points="20,120 80,90 140,60 200,70 260,50 320,40 380,30"
                  fill="none"
                  stroke="#00ff99"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data points */}
                <circle cx="20" cy="120" r="4" fill="#00ff99" />
                <circle cx="80" cy="90" r="4" fill="#00ff99" />
                <circle cx="140" cy="60" r="4" fill="#00ff99" />
                <circle cx="200" cy="70" r="4" fill="#00ff99" />
                <circle cx="260" cy="50" r="4" fill="#00ff99" />
                <circle cx="320" cy="40" r="4" fill="#00ff99" />
                <circle cx="380" cy="30" r="4" fill="#00ff99" />
              </svg>
            </div>
          </div>
        }
      />

      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/strategy-builder"
        element={
          <PrivateRoute>
            <StrategyBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/backtesting"
        element={
          <PrivateRoute>
            <Backtesting />
          </PrivateRoute>
        }
      />

      {/* Additional pages */}
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;