import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LeaderBoard.css";
import background from "../assets/images/homebackground.png";
import ghost1 from "../assets/images/ghost1.svg";
import ghost2 from "../assets/images/ghost2.svg";
import trees1 from "../assets/svgs/trees.svg";
import trees2 from "../assets/svgs/trees2.svg";
import bottom from "../assets/images/bottom.svg";
import Navbar from "./Navbar.jsx";

const LeaderBoard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserScore, setCurrentUserScore] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser")); 
  const currentUsername = storedUser?.username || null;


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      
      try {
        // Fetch complete leaderboard
        const leaderboardResponse = await axios.get("https://crackhunt2-0.onrender.com/api/user/leaderboard/", {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          } : {
            'Content-Type': 'application/json',
          }
        });

        const leaderboardData = leaderboardResponse.data.leaderboard || [];
        setLeaderboard(leaderboardData);
        
        // Find current user's rank
        const currentUserIndex = leaderboardData.findIndex(user => user.username === currentUsername);
        if (currentUserIndex !== -1) {
          setCurrentUserRank(currentUserIndex + 1); // Rank starts from 1
          setCurrentUserScore(leaderboardData[currentUserIndex].totalScore);
        }

        setLoading(false);
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        setError(error.response?.data?.detail || "Failed to load leaderboard");
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUsername]);
  
  return (
    <div className="home-container">
      {/* Background Image */}
      <div className="background-wrapper">
        <img src={background} alt="Background" className="background-image" />
      </div>
      <div className="Navbarparent">
        <Navbar />
      </div>
      <div className="boardparent">
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h2 className="leaderboard-title">Leaderboard</h2>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-text">{error}</p>
            </div>
          ) : (
            <div className="leaderboard-table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table className="leaderboard-table" style={{ overflowY: "auto", maxHeight: "400px" }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody style={{ overflowY: "auto" , maxHeight: "400px" }}>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((player, index) => (
                      <tr key={index} className={`rank-${index + 1}`}>
                        <td className="rank-cell">{index + 1}</td>
                        <td className="name-cell">{player.username}</td>
                        <td className="score-cell">{player.totalScore}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">No leaderboard data available</td>
                    </tr>
                  )}

                  {currentUsername && (
                    <tr className="current-user-row" style={{ backgroundColor: "#6A4FA3", color:"#FFD700", position: "sticky", bottom: 0, fontWeight: "bold" }}>
                      <td>{currentUserRank || "--"}</td>
                      <td>{currentUsername} (You)</td>
                      <td>{currentUserScore || 0}</td>
                    </tr>
                  )}



                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* <div className="ghost1parent">
        <img src={ghost1} alt="ghost1" className="ghost1" />
      </div>
      <div className="ghost2parent">
        <img src={ghost2} alt="ghost2" className="ghost2" />
      </div>
      <div className="bottomparent">
        <img src={bottom} alt="bottom" className="bottom" />
      </div>
      <div className="trees1parent">
        <img src={trees1} alt="trees1" className="trees1" />
      </div>
      <div className="trees2parent">
        <img src={trees2} alt="trees2" className="trees2" />
      </div> */}
    </div>
  );
};

export default LeaderBoard;