import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for user inputs
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to fetch data based on user input
  const fetchData = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:5000/api/financial-data', {
      params: {
        ticker,
        start_date: startDate,
        end_date: endDate,
      },
    })
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  // Prepare chart data
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()), // Convert date to readable format
    datasets: [
      {
        label: 'Close Price',
        data: data.map(item => item.close_price), // Close prices as values
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Stock Prices for ${ticker || 'All Tickers'}`, // Display selected ticker or default text
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Stock Price Chart</h1>

      {/* Input fields for user filters */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Ticker:
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker (e.g., AAPL)"
          />
        </label>

        <label style={{ marginLeft: '20px' }}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ marginLeft: '20px' }}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={fetchData} style={{ marginLeft: '20px' }}>Fetch Data</button>
      </div>

      {/* Loading indicator */}
      {loading && <div>Loading...</div>}

      {/* Chart */}
      {!loading && data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        !loading && <div>No data available</div>
      )}
    </div>
  );
}

export default App;
