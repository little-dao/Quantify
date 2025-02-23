import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onProductSelect }) => {
  return (
    <nav className="navbar">
      <div className="product-buttons">
        <button onClick={() => onProductSelect("A")}>A</button>
        <button onClick={() => onProductSelect("B")}>B</button>
        <button onClick={() => onProductSelect("C")}>C</button>
        <button onClick={() => onProductSelect("D")}>D</button>
      </div>
      <Link to="/login" className="logout-link">
        Logout
      </Link>
    </nav>
  );
};

export default Navbar;