// src/components/MainSection.js

import React from "react";
import PriceChart from "./PriceChart";
import "./MainSection.css";

const MainSection = () => {
  return (
    <main className="main-section">
      <h1>Welcome to Trading Co.</h1>
      <p>Your trusted partner in financial trading.</p>
      <div className="chart-container">
        <PriceChart />
      </div>
    </main>
  );
};

export default MainSection;