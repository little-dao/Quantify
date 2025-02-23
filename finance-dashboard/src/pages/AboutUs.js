// src/pages/AboutUs.js

import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1>About Us</h1>
      <p>
        At Quantify, we combine trading with fintech to deliver innovation, 
        profitability, and security for our customers. Our mission is to empower 
        traders with cutting-edge tools while ensuring a safe and rewarding 
        investment experience.
      </p>

      {/* Venn Diagram */}
      <div className="venn-diagram">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" className="diagram-svg">
          {/* Circles */}
          <circle cx="180" cy="200" r="100" fill="#00ff99" fillOpacity="0.6" />
          <circle cx="320" cy="200" r="100" fill="#ff4d4d" fillOpacity="0.6" />
          <circle cx="250" cy="280" r="100" fill="#0077ff" fillOpacity="0.6" />

          {/* Labels */}
          <text x="100" y="150" fontSize="16" fill="#ffffff" textAnchor="middle">Innovation</text>
          <text x="400" y="150" fontSize="16" fill="#ffffff" textAnchor="middle">Profitability</text>
          <text x="250" y="360" fontSize="16" fill="#ffffff" textAnchor="middle">Security</text>
        </svg>
      </div>
    </div>
  );
};

export default AboutUs;