import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BackTesting from './components/BackTesting';
import StrategyBuilder from './components/StrategyBuilder';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/backtesting">Backtesting</Link>
            </li>
            <li>
              <Link to="/strategy-builder">Strategy Builder</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/backtesting" element={<BackTesting />} />
          <Route path="/strategy-builder" element={<StrategyBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
