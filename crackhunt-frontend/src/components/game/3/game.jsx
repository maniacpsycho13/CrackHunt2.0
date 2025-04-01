import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game3.module.css';
import axios from 'axios';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const INITIAL_DELAY = 1000;
const SEQUENCE_DELAY = 800;
const FLASH_DURATION = 500;
const WINNING_SCORE = 10;

const SimonSays = () => {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComputerTurn, setIsComputerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const currentLevel = 'level-3'; // Set this based on the current game level

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
    
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

  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setWinner(false);
    setIsPlaying(true);
    setIsComputerTurn(true);
    setStartTime(Date.now());
    setTimeout(() => addToSequence(), INITIAL_DELAY);
  }, []);

  const addToSequence = useCallback(() => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, newColor]);
  }, []);

  const playSequence = useCallback(() => {
    let i = 0;
    setIsComputerTurn(true);
    
    const playNext = () => {
      if (i < sequence.length) {
        setActiveColor(sequence[i]);
        setTimeout(() => {
          setActiveColor(null);
          i++;
          setTimeout(playNext, SEQUENCE_DELAY);
        }, FLASH_DURATION);
      } else {
        setTimeout(() => setIsComputerTurn(false), SEQUENCE_DELAY);
      }
    };
    
    setTimeout(playNext, INITIAL_DELAY);
  }, [sequence]);

  const handleColorClick = (color) => {
    if (!isPlaying || isComputerTurn || gameOver || winner) return;

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), FLASH_DURATION / 2);

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    for (let i = 0; i < newPlayerSequence.length; i++) {
      if (newPlayerSequence[i] !== sequence[i]) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= WINNING_SCORE) {
        setWinner(true);
        setIsPlaying(false);
        updateUserScore().then(() => {
          setTimeout(() => navigate('/game/4'), 2000);
        });
        return;
      }
      setTimeout(() => {
        setPlayerSequence([]);
        setIsComputerTurn(true);
        addToSequence();
      }, INITIAL_DELAY);
    }
  };

  useEffect(() => {
    if (isPlaying && isComputerTurn && sequence.length > 0) {
      playSequence();
    }
  }, [sequence, isPlaying, isComputerTurn, playSequence]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <div className={styles.simonContainer}>
      <h1>Simon Says</h1>
      <div className={styles.score}>Score: {score}</div>
      
      <div className={styles.simonBoard}>
        {COLORS.map(color => (
          <button
            key={color}
            className={`${styles.simonButton} ${styles[color]} ${activeColor === color ? styles.active : ''}`}
            onClick={() => handleColorClick(color)}
            disabled={isComputerTurn || gameOver || winner}
          />
        ))}
      </div>

      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}

      {winner && (
        <div className={styles.winnerMessage}>
          <h2>Congratulations! You Won!</h2>
          <p>Proceeding to Level 4...</p>
        </div>
      )}

      {!isPlaying && !gameOver && !winner && (
        <button className={styles.startButton} onClick={startGame}>
          Start Game
        </button>
      )}
    </div>
  );
};

export default SimonSays;