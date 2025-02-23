import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const goToStrategyBuilder = () => {
    navigate("/strategy-builder");
  };

  const goToBacktesting = () => {
    navigate("/backtesting");
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <button onClick={goToStrategyBuilder} className="dashboard-button">
        Go to Strategy Builder
      </button>
      <button onClick={goToBacktesting} className="dashboard-button">
        Go to Backtesting
      </button>
    </div>
  );
};

export default Dashboard;