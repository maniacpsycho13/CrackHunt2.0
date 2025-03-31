import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import background from "../assets/images/homebackground.png";
import trees1 from "../assets/svgs/trees.svg";
import trees2 from "../assets/svgs/trees2.svg";
import bottom from "../assets/images/bottom.svg";
import "./profile.css";
import Navbar from "./Navbar.jsx";

const Profile = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://crackhunt2-0.onrender.com/api/auth/login", {
        email: username,
        username,
        password,
      });

      console.log(response.data);
      

      const { refreshToken , username: loggedInUser } = response.data;
      localStorage.setItem("accessToken", refreshToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", loggedInUser);

      login(loggedInUser); // Store user in AuthContext
      navigate("/"); // Redirect to home page
    } catch (error) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="home-container">
      <div className="background-wrapper">
        <img src={background} alt="Background" className="background-image" />
      </div>
      <div className="Navbarparent">
        <Navbar />
      </div>
      <div className="bottomparent">
        <img src={bottom} alt="bottom" className="bottom" />
      </div>
      <div className="trees1parent">
        <img src={trees1} alt="trees1" className="trees1" />
      </div>
      <div className="trees2parent">
        <img src={trees2} alt="trees2" className="trees2" />
      </div>
      <div className="centreblackboxparent">
        <div className="centreblackbox"></div>
      </div>

      <div className="usernameformparent">
        <div className="usernameformgrid">
          <div className="usertextparent">
            <div className="usertext">Username</div>
          </div>
          <div className="username-input-container">
            <input
              type="text"
              className="username-input"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="usertextparent">
            <div className="usertext">Password</div>
          </div>
          <div className="password-input-container">
            <input
              type="password"
              className="password-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="login-button-container">
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          </div>

          <div className="register-link">
            <p>Don't have an account?</p>
            <button className="register-button" onClick={() => navigate("/register")}>
              {/* ADSFSDF */}
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
