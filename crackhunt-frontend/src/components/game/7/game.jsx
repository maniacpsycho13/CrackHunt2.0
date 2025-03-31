import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game7.module.css';
import axios from 'axios';

const LightsOut = () => {
  const BOARD_SIZE = 5;
  const [gameState, setGameState] = useState('welcome'); // 'welcome', 'playing', 'won'
  const [moves, setMoves] = useState(0);
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false)));
  const [startTime, setStartTime] = useState(Date.now());
  const navigate = useNavigate();
  const currentLevel = 'level-7'; // Set this based on the current game level

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        "https://crackhunt2-0.onrender.com/api/user/update-score",
        {
          level_completed: currentLevel,
          completion_time: completionTime,
          moves: moves // Optional: You can also send the number of moves if you want to track efficiency
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

  // Initialize the game board
  useEffect(() => {
    if (gameState === 'playing') {
      randomizeBoard();
    }
  }, [gameState]);

  // Create a randomized board
  const randomizeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    
    // Make random moves to create a solvable puzzle
    for (let i = 0; i < BOARD_SIZE * 2; i++) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      toggleLights(newBoard, row, col);
    }
    
    setBoard(newBoard);
    setMoves(0);
    setStartTime(Date.now()); // Reset timer when game starts/resets
  };

  // Toggle lights (the clicked cell and adjacent cells)
  const toggleLights = (currentBoard, row, col) => {
    const newBoard = currentBoard.map(row => [...row]);
    const positions = [
      [row, col],
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];

    positions.forEach(([r, c]) => {
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        newBoard[r][c] = !newBoard[r][c];
      }
    });

    return newBoard;
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing') return;
    
    const newBoard = toggleLights(board, row, col);
    setBoard(newBoard);
    setMoves(moves + 1);
    checkWin(newBoard);
  };

  // Check if all lights are off (win condition)
  const checkWin = (currentBoard) => {
    const hasWon = currentBoard.every(row => row.every(cell => !cell));
    if (hasWon) {
      setGameState('won');
      updateUserScore().then(() => {
        setTimeout(() => navigate('/game/8'), 2000); // Navigate to Level 8 after 2 seconds
      });
    }
  };

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    randomizeBoard();
  };

  // Restart the game
  const restartGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    randomizeBoard();
  };

  // Show rules
  const showRules = () => {
    alert(`Rules:\n\n1. Click on cells to toggle lights\n2. Clicking a cell toggles its state and its adjacent cells\n3. Turn off all lights to win the game\n4. Try to win in minimum moves possible!`);
  };

  // Reset the current game
  const resetGame = () => {
    randomizeBoard();
    setStartTime(Date.now());
  };

  return (
    <div className={styles.lightsOutContainer}>
      {gameState === 'welcome' && (
        <div className={styles.welcomeScreen}>
          <h1>Lights Out</h1>
          <div className={styles.rules}>
            <h3>Game Rules</h3>
            <p>Click on cells to toggle lights</p>
            <p>Clicking a cell toggles its state and adjacent cells</p>
            <p>Turn off all lights to win the game</p>
            <p>Try to win in minimum moves possible!</p>
          </div>
          <button className={styles.startButton} onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className={styles.gameArea}>
          <div className={styles.gameBoard}>
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.boardRow}>
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${styles.cell} ${cell ? styles.on : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className={styles.movesCounter}>Moves: {moves}</div>
          <div className={styles.gameControls}>
            <button className={styles.rulesButton} onClick={showRules}>Show Rules</button>
            <button className={styles.resetButton} onClick={resetGame}>Reset Game</button>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className={styles.congratsScreen}>
          <h1>Congratulations! 🎉</h1>
          <p>You've won the game in {moves} moves!</p>
          <p>Proceeding to Level 8...</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default LightsOut;