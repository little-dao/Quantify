// src/App.js

import React from "react";
import Header from "./components/Header";
import Router from "./routes";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div>
      <Header />
      <main className="main-content">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

export default App;