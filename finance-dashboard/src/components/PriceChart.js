// src/components/PriceChart.js

import React from "react";
import { Line } from "react-chartjs-2";
import "./PriceChart.css";

const PriceChart = ({ productData }) => {
  if (!productData || !Array.isArray(productData)) {
    return <p>No data available</p>;
  }

  const data = {
    labels: productData.map((item) => item.date),
    datasets: [
      {
        label: "Price",
        data: productData.map((item) => item.price),
        borderColor: "#00ff99",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return <Line data={data} />;
};

export default PriceChart;