import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game4.module.css';
import axios from 'axios';

const SlidingPuzzle = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'won'
  const [tiles, setTiles] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [showRules, setShowRules] = useState(false); // State for rules dialog
  const navigate = useNavigate();
  const currentLevel = 'level-4';
  const size = 4; // 4x4 grid

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        "https://crackhunt2-0.onrender.com/api/user/update-score",
        {
          level_completed: currentLevel,
          completion_time: completionTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Score updated:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to update score:", error);
      return false;
    }
  };

  const createPuzzle = () => {
    const newTiles = [...Array(size * size).keys()].slice(1);
    newTiles.push(null);
    setTiles(newTiles);
    setIsGameWon(false);
    setMessage('');
  };

  const shuffleTiles = () => {
    let shuffledTiles;
    do {
      shuffledTiles = [...tiles.filter(tile => tile !== null)];
      for (let i = shuffledTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
      }
      shuffledTiles.push(null);
    } while (!isSolvable(shuffledTiles));

    setTiles(shuffledTiles);
    setIsGameWon(false);
    setMessage('');
  };

  const isSolvable = (tileArray) => {
    const filteredTiles = tileArray.filter(tile => tile !== null);
    let inversions = 0;
    
    for (let i = 0; i < filteredTiles.length - 1; i++) {
      for (let j = i + 1; j < filteredTiles.length; j++) {
        if (filteredTiles[i] > filteredTiles[j]) inversions++;
      }
    }

    const emptyIndex = tileArray.indexOf(null);
    const emptyRowFromBottom = Math.floor(emptyIndex / size) + 1;
    return (inversions + emptyRowFromBottom) % 2 === 0;
  };

  const moveTile = (index) => {
    if (isGameWon) return;

    const emptyIndex = tiles.indexOf(null);
    const validMoves = [
      emptyIndex - 1, emptyIndex + 1,
      emptyIndex - size, emptyIndex + size
    ];

    if (validMoves.includes(index) && 
        !(emptyIndex % size === 0 && index % size === size - 1) && 
        !(emptyIndex % size === size - 1 && index % size === 0)) {
      
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles) => {
    if (currentTiles.slice(0, -1).every((tile, index) => tile === index + 1)) {
      setIsGameWon(true);
      setMessage('Congratulations! You solved the puzzle!');
      updateUserScore().then(() => {
        setTimeout(() => navigate('/game/5'), 2000);
      });
    }
  };

  const startGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    createPuzzle();
    shuffleTiles();
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  useEffect(() => {
    createPuzzle();
  }, []);

  return (
    <div className={styles.container}>
      {gameState === 'start' && (
        <div className={styles.startPage}>
          <h1>Sliding Puzzle Game</h1>
          <button className={styles.rulesButton} onClick={toggleRules}>
            Show Rules
          </button>
          <button className={styles.startButton} onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className={styles.gameContainer}>
          <button className={styles.rulesButton} onClick={toggleRules}>
            Show Rules
          </button>
          
          <div className={styles.puzzle}>
            {tiles.map((tile, index) => (
              <div
                key={index}
                className={`${styles.tile} ${tile === null ? styles.empty : ''}`}
                onClick={() => moveTile(index)}
              >
                {tile}
              </div>
            ))}
          </div>
          <button className={styles.shuffleButton} onClick={shuffleTiles}>Shuffle</button>
          {message && (
            <div className={`${styles.message} ${isGameWon ? styles.winMessage : ''}`}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* Rules Dialog */}
      {showRules && (
        <div className={styles.rulesDialog}>
          <div className={styles.rulesContent}>
            <h2>Sliding Puzzle Rules</h2>
            <ol>
              <li>The goal is to arrange the tiles in numerical order from 1 to 15</li>
              <li>Click on any tile adjacent to the empty space to move it</li>
              <li>Tiles can only move horizontally or vertically into the empty space</li>
              <li>You cannot move tiles diagonally</li>
              <li>The empty space should be in the bottom-right corner when solved</li>
              <li>Use the Shuffle button to reset the puzzle if you get stuck</li>
            </ol>
            <button onClick={toggleRules} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidingPuzzle;