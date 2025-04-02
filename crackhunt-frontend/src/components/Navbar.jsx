import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/svgs/pokemon-p2-651.svg";

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="logo" />
      <ul className="nav-links">
        <li><Link to="/">HOME</Link></li>
        {/* <li><Link to="/profile">Profile</Link></li> */}
        <li><Link to="/games">Games</Link></li>
        <li>
          <Link to="/leaderboard" className="leaderboard">LEADERBOARD</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
