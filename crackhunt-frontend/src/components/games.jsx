import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./games.css";
import background from "../assets/images/homebackground.png";
import trees1 from "../assets/svgs/trees.svg";
import trees2 from "../assets/svgs/trees2.svg";
import bottom from "../assets/images/bottom.svg";
import Navbar from "./Navbar.jsx";

const Games = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1); 
  const navigate = useNavigate();
  const token = localStorage.getItem("refreshToken");
  useEffect(() => {
    axios
      .get("https://crackhunt2-0.onrender.com/api/user/get-score", { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
       }) // token auth
      .then(response => {
        setUserData(response.data);
        setLoading(false);
        if (response.data.completedLevels) {
          setUnlockedLevels(response.data.completedLevels + 1); 
        }
      })
      .catch(error => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleLevelClick = (levelNumber) => {
    if (levelNumber <= unlockedLevels) {
      navigate(`/game/${levelNumber}`);
    } else {
      alert(`You need to complete Level ${levelNumber - 1} first!`);
    }
  };

  const renderLevelBox = (levelNumber) => {
    const isUnlocked = levelNumber <= unlockedLevels;
    return (
      <div 
        className={`game1 ${isUnlocked ? 'unlocked' : 'locked'}`}
        onClick={() => handleLevelClick(levelNumber)}
      >
        Level {levelNumber}
        {!isUnlocked && <div className="lock-icon">🔒</div>}
      </div>
    );
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
      <div className="maingridtemplateforgamesparent">
        <div className="maingridtemplateforgames">
          <div className="gamesrow1">
            {renderLevelBox(1)}
            {renderLevelBox(2)}
            {renderLevelBox(3)}
            {renderLevelBox(4)}
          </div>
          <div className="gamesrow2">
            {renderLevelBox(5)}
            {renderLevelBox(6)}
            {renderLevelBox(7)}
            {renderLevelBox(8)}
          </div>
          <div className="gamesrow3">
            {renderLevelBox(9)}
            {renderLevelBox(10)}
            {renderLevelBox(11)}
            {renderLevelBox(12)}
          </div>
          <div className="gamesrow4">
            {renderLevelBox(13)}
            {renderLevelBox(14)}
            {renderLevelBox(15)}
            {renderLevelBox(16)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
