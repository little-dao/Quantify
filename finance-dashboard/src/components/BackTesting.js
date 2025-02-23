import React, { useState } from 'react';
import axios from 'axios';
import './BackTesting.css';
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
import { useTable } from 'react-table';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function BackTesting() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tradesData, setTrades] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [financialDataResponse, tradesResponse] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/financial-data', {
          params: {
            ticker,
            start_date: startDate,
            end_date: endDate,
          },
        }),
        axios.get('http://127.0.0.1:8000/api/trades', {
          params: {
            ticker,
            start_date: startDate,
            end_date: endDate,
          },
        })
      ]);
      setStockData(financialDataResponse.data);
      setTrades(tradesResponse.data);
      console.log('Data fetched:', financialDataResponse.data, tradesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching data. Please check your API and inputs.');
    } finally {
      setLoading(false);
    }
  };

  const entryDates = tradesData.map(trade => trade.entry_date);
  const exitDates = tradesData.map(trade => trade.exit_date);

  const chartData = {
    labels: stockData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Buy (Red)',
        data: stockData.map(item => item.close_price),
        borderColor: stockData.map((item) => {
          if (entryDates.includes(item.date)) {
            return 'rgba(255, 99, 132, 1)'; // Red for entry dates
          } else if (exitDates.includes(item.date)) {
            return 'rgba(0, 255, 0, 1)'; // Blue for exit dates
          } else {
            return 'rgba(75, 192, 192, 1)'; // Default teal color
          }
        }),
        backgroundColor: stockData.map((item) => {
          if (entryDates.includes(item.date)) {
            return 'rgba(255, 99, 132, 0.2)'; // Light red for entry dates
          } else if (exitDates.includes(item.date)) {
            return 'rgba(54, 162, 235, 0.2)'; // Light blue for exit dates
          } else {
            return 'rgba(75, 192, 192, 0.2)'; // Default light teal color
          }
        }),
        pointBorderWidth: stockData.map((item) =>
          entryDates.includes(item.date) || exitDates.includes(item.date) ? 3 : 1 // Thicker border for highlighted points
        ),
        tension: 0.4,
      },
      {
        label: 'Sell (Blue)',
        data: stockData.map(item => item.close_price),
        borderColor: stockData.map((item) => {
          if (entryDates.includes(item.date)) {
            return 'rgba(255, 99, 132, 1)'; // Red for entry dates
          } else if (exitDates.includes(item.date)) {
            return 'rgba(54, 162, 235, 1)'; // Blue for exit dates
          } else {
            return 'rgba(75, 192, 192, 1)'; // Default teal color
          }
        }),
        backgroundColor: stockData.map((item) => {
          if (entryDates.includes(item.date)) {
            return 'rgba(255, 99, 132, 0.2)'; // Light red for entry dates
          } else if (exitDates.includes(item.date)) {
            return 'rgba(54, 162, 235, 0.2)'; // Light blue for exit dates
          } else {
            return 'rgba(75, 192, 192, 0.2)'; // Default light teal color
          }
        }),
        pointBorderWidth: stockData.map((item) =>
          entryDates.includes(item.date) || exitDates.includes(item.date) ? 3 : 1 // Thicker border for highlighted points
        ),
        tension: 0.4,
      },
    ],
  };

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 10,
          weight: 'normal',
        },
        color: 'rgba(255, 255, 255, 1)',  // Change font color of legend labels to black
        padding: 20,
        boxWidth: 20,
        boxHeight: 20,
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: `Stock Prices for ${ticker || 'All Tickers'}`,
      color: 'rgba(255, 255, 255, 1)',  // Change title color to black
      font: {
        size: 16,
        weight: 'bold',
      },
    },
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date',
        color: 'rgba(255, 255, 255, 1)',  // Change x-axis title color to black
      },
      ticks: {
        color: 'rgba(255, 255, 255, 1)',  // Change x-axis ticks color to black
      },
      grid: {
        color: 'rgba(255, 255, 255, 1)',  // Light grid lines for x-axis
      },
    },
    y: {
      title: {
        display: true,
        text: 'Price (USD)',
        color: 'rgba(255, 255, 255, 1)',  // Change y-axis title color to black
      },
      ticks: {
        color: 'rgba(255, 255, 255, 1)',  // Change y-axis ticks color to black
      },
      grid: {
        color: 'rgba(255, 255, 255, 1)',  // Light grid lines for y-axis
      },
    },
  },
  backgroundColor: 'rgba(255, 255, 255, 1)',  // Set the background color of the chart to white
};

  const columns = React.useMemo(
    () => [
      {
        Header: 'Symbol',
        accessor: 'symbol',
      },
      {
        Header: 'Entry Date',
        accessor: 'entry_date',
      },
      {
        Header: 'Entry Price',
        accessor: 'entry_price',
      },
      {
        Header: 'Exit Date',
        accessor: 'exit_date',
      },
      {
        Header: 'Exit Price',
        accessor: 'exit_price',
      },
      {
        Header: 'PnL',
        accessor: 'pnl',
      },
    ],
    []
  );

  const data = React.useMemo(() => tradesData, [tradesData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div>
      <h2>Backtesting</h2>
      <div>
        <label>Ticker:</label>
        <input type="text" value={ticker} onChange={e => setTicker(e.target.value)} />
      </div>
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <div className="error">{error}</div>}
      {stockData.length > 0 && <Line data={chartData} options={options} />}
      {tradesData.length > 0 && (
      <div className="table-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
{rows.map(row => {
  prepareRow(row);
  return (
    <tr {...row.getRowProps()}>
      {row.cells.map(cell => (
        <td {...cell.getCellProps()} style={{ border: '1px solid black', padding: '5px' }}>
          {cell.render('Cell')}
        </td>
      ))}
    </tr>
  );
})}
          </tbody>
        </table>
      </div>
            )}
    </div>
  );
}

export default BackTesting;